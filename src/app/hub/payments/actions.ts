"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireHubAuth } from "@/lib/auth";
import { canAccessClient } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import type { PaymentMethod } from "@prisma/client";

const methods: PaymentMethod[] = ["EFT", "CASH", "CARD", "OTHER"];

const RecordPaymentSchema = z
  .object({
    clientId: z.string().min(1, "Client is required"),
    invoiceId: z.string().optional(),
    amount: z.string().transform((s) => Number(s) || 0),
    method: z.enum(["EFT", "CASH", "CARD", "OTHER"]),
    paidAt: z.string().min(1, "Date is required"),
    reference: z.string().max(200).optional(),
    notes: z.string().max(1000).optional(),
  })
  .refine((data) => data.amount > 0, {
    message: "Amount must be greater than 0",
    path: ["amount"],
  });

export type PaymentFormState = { error?: string };

function toNum(d: unknown): number {
  if (d == null) return 0;
  if (typeof d === "number" && !Number.isNaN(d)) return d;
  return Number(d) || 0;
}

export async function recordPayment(
  _prev: PaymentFormState,
  formData: FormData
): Promise<PaymentFormState> {
  const { scope, user } = await requireHubAuth();

  const raw = {
    clientId: formData.get("clientId"),
    invoiceId: formData.get("invoiceId") || undefined,
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

  const { clientId, invoiceId, amount, method, paidAt, reference, notes } = parsed.data;

  if (!canAccessClient(scope, clientId)) {
    return { error: "You do not have access to this client." };
  }

  const paidAtDate = new Date(paidAt);
  if (Number.isNaN(paidAtDate.getTime())) return { error: "Invalid payment date." };

  if (invoiceId) {
    const inv = await prisma.invoice.findFirst({
      where: { id: invoiceId, clientId },
      select: { id: true, totalAmount: true, status: true },
    });
    if (!inv || !canAccessClient(scope, clientId)) {
      return { error: "Invoice not found or access denied." };
    }
  }

  await prisma.payment.create({
    data: {
      clientId,
      invoiceId: invoiceId || null,
      amount: String(amount),
      method: method as PaymentMethod,
      paidAt: paidAtDate,
      reference: reference?.trim() || null,
      notes: notes?.trim() || null,
      recordedById: user.id,
    },
  });

  if (invoiceId) {
    const payments = await prisma.payment.findMany({
      where: { invoiceId },
      select: { amount: true },
    });
    const totalPaid = payments.reduce((s, p) => s + toNum(p.amount), 0);
    const inv = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: { totalAmount: true },
    });
    if (inv && totalPaid >= toNum(inv.totalAmount)) {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: "PAID", paidAt: new Date() },
      });
    }
  }

  revalidatePath("/hub/payments");
  revalidatePath("/hub/billing");
  if (invoiceId) {
    revalidatePath(`/hub/invoices/${invoiceId}`);
  }
  redirect("/hub/payments");
}
