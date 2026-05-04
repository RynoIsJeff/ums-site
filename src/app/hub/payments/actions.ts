"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireHubAuth } from "@/lib/auth";
import { canAccessClient } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import type { PaymentMethod } from "@prisma/client";
import { toNum } from "@/lib/utils";

const PaymentSchema = z
  .object({
    clientId: z.string().min(1, "Client is required"),
    amount: z.string().transform((s) => Number(s) || 0),
    method: z.enum(["EFT", "CASH", "CARD", "OTHER"]),
    paidAt: z.string().min(1, "Date is required"),
    reference: z.string().max(200).optional(),
    notes: z.string().max(1000).optional(),
    // Legacy single-invoice field (invoice detail page form)
    invoiceId: z.string().optional(),
    // Multi-invoice allocations as JSON: [{invoiceId, allocatedAmount}]
    allocations: z.string().optional(),
  })
  .refine((data) => data.amount > 0, {
    message: "Amount must be greater than 0",
    path: ["amount"],
  });

type AllocationInput = { invoiceId: string; allocatedAmount: number };

export type PaymentFormState = { error?: string };

function parseAllocations(
  allocationsJson: string | undefined,
  invoiceId: string | undefined,
  amount: number
): AllocationInput[] {
  if (allocationsJson) {
    try {
      const parsed = JSON.parse(allocationsJson);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((a) => a.invoiceId && Number(a.allocatedAmount) > 0)
          .map((a) => ({ invoiceId: String(a.invoiceId), allocatedAmount: Number(a.allocatedAmount) }));
      }
    } catch {
      // fall through to empty
    }
  } else if (invoiceId) {
    return [{ invoiceId, allocatedAmount: amount }];
  }
  return [];
}

/** After adding/removing allocations for an invoice, re-sync its PAID status. */
async function syncInvoiceStatus(invoiceId: string) {
  const [allocs, inv] = await Promise.all([
    prisma.paymentAllocation.findMany({
      where: { invoiceId },
      select: { allocatedAmount: true },
    }),
    prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: { totalAmount: true, status: true, dueDate: true, paidAt: true },
    }),
  ]);

  if (!inv || inv.status === "VOID" || inv.status === "DRAFT") return;

  const totalPaid = allocs.reduce((s, a) => s + toNum(a.allocatedAmount), 0);
  const totalAmount = toNum(inv.totalAmount);

  if (totalPaid >= totalAmount && inv.status !== "PAID") {
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: "PAID", paidAt: new Date() },
    });
  } else if (totalPaid < totalAmount && inv.status === "PAID") {
    const revertStatus = inv.dueDate < new Date() ? "OVERDUE" : "SENT";
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: revertStatus, paidAt: null },
    });
  }
}

export async function recordPayment(
  _prev: PaymentFormState,
  formData: FormData
): Promise<PaymentFormState> {
  try {
    const { scope, user } = await requireHubAuth();

    const raw = {
      clientId: formData.get("clientId"),
      invoiceId: formData.get("invoiceId") || undefined,
      allocations: formData.get("allocations") || undefined,
      amount: formData.get("amount"),
      method: formData.get("method"),
      paidAt: formData.get("paidAt"),
      reference: formData.get("reference"),
      notes: formData.get("notes"),
    };

    const parsed = PaymentSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
    }

    const { clientId, invoiceId, allocations: allocationsJson, amount, method, paidAt, reference, notes } = parsed.data;

    if (!canAccessClient(scope, clientId)) {
      return { error: "You do not have access to this client." };
    }

    const paidAtDate = new Date(paidAt);
    if (Number.isNaN(paidAtDate.getTime())) return { error: "Invalid payment date." };

    const allocations = parseAllocations(allocationsJson, invoiceId, amount);

    if (allocations.length > 0) {
      const invoiceIds = allocations.map((a) => a.invoiceId);
      const found = await prisma.invoice.findMany({
        where: { id: { in: invoiceIds }, clientId },
        select: { id: true },
      });
      if (found.length !== invoiceIds.length) {
        return { error: "One or more invoices not found or access denied." };
      }
    }

    await prisma.$transaction(async (tx) => {
      const pay = await tx.payment.create({
        data: {
          clientId,
          amount: String(amount),
          method: method as PaymentMethod,
          paidAt: paidAtDate,
          reference: reference?.trim() || null,
          notes: notes?.trim() || null,
          recordedById: user.id,
        },
      });

      if (allocations.length > 0) {
        await tx.paymentAllocation.createMany({
          data: allocations.map((a) => ({
            paymentId: pay.id,
            invoiceId: a.invoiceId,
            allocatedAmount: String(a.allocatedAmount),
          })),
        });
      }
    });

    for (const allocation of allocations) {
      await syncInvoiceStatus(allocation.invoiceId);
      revalidatePath(`/hub/invoices/${allocation.invoiceId}`);
    }

    revalidatePath("/hub/payments");
    revalidatePath("/hub/billing");
  } catch (e) {
    console.error("[recordPayment]", e);
    return { error: "Something went wrong." };
  }
  redirect("/hub/payments?success=1");
}

export async function updatePayment(
  paymentId: string,
  _prev: PaymentFormState,
  formData: FormData
): Promise<PaymentFormState> {
  try {
    const { scope } = await requireHubAuth();

    const existing = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { allocations: { select: { invoiceId: true } } },
    });
    if (!existing || !canAccessClient(scope, existing.clientId)) {
      return { error: "Payment not found or access denied." };
    }

    const raw = {
      clientId: existing.clientId,
      invoiceId: formData.get("invoiceId") || undefined,
      allocations: formData.get("allocations") || undefined,
      amount: formData.get("amount"),
      method: formData.get("method"),
      paidAt: formData.get("paidAt"),
      reference: formData.get("reference"),
      notes: formData.get("notes"),
    };

    const parsed = PaymentSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
    }

    const { invoiceId, allocations: allocationsJson, amount, method, paidAt, reference, notes } = parsed.data;

    const paidAtDate = new Date(paidAt);
    if (Number.isNaN(paidAtDate.getTime())) return { error: "Invalid payment date." };

    const newAllocations = parseAllocations(allocationsJson, invoiceId, amount);

    if (newAllocations.length > 0) {
      const invoiceIds = newAllocations.map((a) => a.invoiceId);
      const found = await prisma.invoice.findMany({
        where: { id: { in: invoiceIds }, clientId: existing.clientId },
        select: { id: true },
      });
      if (found.length !== invoiceIds.length) {
        return { error: "One or more invoices not found or access denied." };
      }
    }

    const prevInvoiceIds = existing.allocations.map((a) => a.invoiceId);

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: paymentId },
        data: {
          amount: String(amount),
          method: method as PaymentMethod,
          paidAt: paidAtDate,
          reference: reference?.trim() || null,
          notes: notes?.trim() || null,
        },
      });

      await tx.paymentAllocation.deleteMany({ where: { paymentId } });

      if (newAllocations.length > 0) {
        await tx.paymentAllocation.createMany({
          data: newAllocations.map((a) => ({
            paymentId,
            invoiceId: a.invoiceId,
            allocatedAmount: String(a.allocatedAmount),
          })),
        });
      }
    });

    // Sync status for all affected invoices (old + new)
    const allInvoiceIds = Array.from(new Set([...prevInvoiceIds, ...newAllocations.map((a) => a.invoiceId)]));
    for (const invId of allInvoiceIds) {
      await syncInvoiceStatus(invId);
      revalidatePath(`/hub/invoices/${invId}`);
    }

    revalidatePath("/hub/payments");
    revalidatePath("/hub/billing");
  } catch (e) {
    console.error("[updatePayment]", e);
    return { error: "Something went wrong." };
  }
  redirect("/hub/payments?updated=1");
}

export async function deletePayment(paymentId: string): Promise<{ error?: string }> {
  try {
    const { scope } = await requireHubAuth();

    const existing = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { allocations: { select: { invoiceId: true } } },
    });
    if (!existing || !canAccessClient(scope, existing.clientId)) {
      return { error: "Payment not found or access denied." };
    }

    const invoiceIds = existing.allocations.map((a) => a.invoiceId);

    await prisma.payment.delete({ where: { id: paymentId } });

    for (const invId of invoiceIds) {
      await syncInvoiceStatus(invId);
      revalidatePath(`/hub/invoices/${invId}`);
    }

    revalidatePath("/hub/payments");
    revalidatePath("/hub/billing");
    return {};
  } catch (e) {
    console.error("[deletePayment]", e);
    return { error: "Something went wrong." };
  }
}
