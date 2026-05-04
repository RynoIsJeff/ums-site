"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireHubAuth } from "@/lib/auth";
import { canAccessClient } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import type { PaymentMethod } from "@prisma/client";
import { toNum } from "@/lib/utils";

const RecordPaymentSchema = z
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

    const parsed = RecordPaymentSchema.safeParse(raw);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Invalid input";
      return { error: msg };
    }

    const { clientId, invoiceId, allocations: allocationsJson, amount, method, paidAt, reference, notes } = parsed.data;

    if (!canAccessClient(scope, clientId)) {
      return { error: "You do not have access to this client." };
    }

    const paidAtDate = new Date(paidAt);
    if (Number.isNaN(paidAtDate.getTime())) return { error: "Invalid payment date." };

    // Build the allocations list from JSON field, falling back to single invoiceId
    let allocations: AllocationInput[] = [];

    if (allocationsJson) {
      try {
        const parsed = JSON.parse(allocationsJson);
        if (Array.isArray(parsed)) {
          allocations = parsed
            .filter((a) => a.invoiceId && Number(a.allocatedAmount) > 0)
            .map((a) => ({ invoiceId: String(a.invoiceId), allocatedAmount: Number(a.allocatedAmount) }));
        }
      } catch {
        return { error: "Invalid allocation data." };
      }
    } else if (invoiceId) {
      allocations = [{ invoiceId, allocatedAmount: amount }];
    }

    // Validate each invoice exists and belongs to this client
    const invoiceIds = allocations.map((a) => a.invoiceId);
    if (invoiceIds.length > 0) {
      const invoices = await prisma.invoice.findMany({
        where: { id: { in: invoiceIds }, clientId },
        select: { id: true },
      });
      if (invoices.length !== invoiceIds.length) {
        return { error: "One or more invoices not found or access denied." };
      }
    }

    // Create payment + allocations in a transaction
    const payment = await prisma.$transaction(async (tx) => {
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

      return pay;
    });

    // After transaction: check & auto-mark each allocated invoice as PAID
    for (const allocation of allocations) {
      const [allocationTotals, inv] = await Promise.all([
        prisma.paymentAllocation.findMany({
          where: { invoiceId: allocation.invoiceId },
          select: { allocatedAmount: true },
        }),
        prisma.invoice.findUnique({
          where: { id: allocation.invoiceId },
          select: { totalAmount: true, status: true },
        }),
      ]);

      if (inv && inv.status !== "PAID" && inv.status !== "VOID") {
        const totalPaid = allocationTotals.reduce((s, a) => s + toNum(a.allocatedAmount), 0);
        if (totalPaid >= toNum(inv.totalAmount)) {
          await prisma.invoice.update({
            where: { id: allocation.invoiceId },
            data: { status: "PAID", paidAt: new Date() },
          });
        }
      }
      revalidatePath(`/hub/invoices/${allocation.invoiceId}`);
    }

    void payment; // used in transaction above
    revalidatePath("/hub/payments");
    revalidatePath("/hub/billing");
  } catch (e) {
    console.error("[recordPayment]", e);
    return { error: "Something went wrong." };
  }
  redirect("/hub/payments?success=1");
}
