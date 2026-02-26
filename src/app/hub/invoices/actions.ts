"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireHubAuth } from "@/lib/auth";
import { canAccessClient, clientIdWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import type { InvoiceStatus } from "@prisma/client";

const statuses = ["DRAFT", "SENT", "PAID", "OVERDUE", "VOID"] as const;

const LineItemSchema = z.object({
  description: z.string().min(1).max(500),
  quantity: z.string().transform((s) => (Number(s) || 0) <= 0 ? 1 : Number(s)),
  unitPrice: z.string().transform((s) => Number(s) || 0),
});

function toNum(d: unknown): number {
  if (d == null) return 0;
  if (typeof d === "number" && !Number.isNaN(d)) return d;
  return Number(d) || 0;
}

/** Returns next invoice number in 4-digit format (e.g. 0088). Next after 0087 is 0088. */
export async function getNextInvoiceNumber(): Promise<string> {
  const { scope } = await requireHubAuth();
  const all = await prisma.invoice.findMany({
    where: clientIdWhere(scope),
    select: { invoiceNumber: true },
  });
  let maxNum = 87; // Next number is 0088 when no 4-digit invoices exist
  for (const inv of all) {
    const m = inv.invoiceNumber.match(/^0*(\d{1,4})$/);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > maxNum) maxNum = n;
    }
  }
  return String(maxNum + 1).padStart(4, "0");
}

export type InvoiceFormState = { error?: string };

export async function createInvoice(
  _prev: InvoiceFormState,
  formData: FormData
): Promise<InvoiceFormState> {
  const { scope, user } = await requireHubAuth();

  const clientId = formData.get("clientId") as string;
  if (!clientId || !canAccessClient(scope, clientId)) {
    return { error: "Invalid or inaccessible client." };
  }

  const invoiceNumber = (formData.get("invoiceNumber") as string)?.trim();
  if (!invoiceNumber) return { error: "Invoice number is required." };

  const issueDateStr = formData.get("issueDate") as string;
  const dueDateStr = formData.get("dueDate") as string;
  const issueDate = issueDateStr ? new Date(issueDateStr) : new Date();
  const dueDate = dueDateStr ? new Date(dueDateStr) : new Date();
  if (Number.isNaN(issueDate.getTime()) || Number.isNaN(dueDate.getTime())) {
    return { error: "Valid issue and due dates required." };
  }

  const descriptions = formData.getAll("description") as string[];
  const quantities = formData.getAll("quantity") as string[];
  const unitPrices = formData.getAll("unitPrice") as string[];

  const lineItems: { description: string; quantity: number; unitPrice: number }[] = [];
  for (let i = 0; i < descriptions.length; i++) {
    const desc = descriptions[i]?.trim();
    if (!desc) continue;
    const parsed = LineItemSchema.safeParse({
      description: desc,
      quantity: quantities[i] ?? "1",
      unitPrice: unitPrices[i] ?? "0",
    });
    if (parsed.success) {
      lineItems.push(parsed.data);
    }
  }
  if (lineItems.length === 0) return { error: "At least one line item is required." };

  const existing = await prisma.invoice.findUnique({
    where: { invoiceNumber },
  });
  if (existing) return { error: "Invoice number already in use." };

  let subtotal = 0;
  const items = lineItems.map((item) => {
    const lineTotal = item.quantity * item.unitPrice;
    subtotal += lineTotal;
    return {
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal,
    };
  });

  const totalAmount = subtotal;

  await prisma.invoice.create({
    data: {
      clientId,
      invoiceNumber,
      issueDate,
      dueDate,
      status: "DRAFT",
      includeVat: false,
      vatRate: 0,
      subtotalAmount: String(subtotal),
      vatAmount: "0",
      totalAmount: String(totalAmount),
      currency: "ZAR",
      notes: (formData.get("notes") as string)?.trim() || null,
      createdById: user.id,
      lineItems: {
        create: items.map((i) => ({
          description: i.description,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          lineTotal: i.lineTotal,
        })),
      },
    },
  });

  revalidatePath("/hub/invoices");
  revalidatePath("/hub/billing");
  redirect("/hub/invoices");
}

export async function updateInvoice(
  invoiceId: string,
  _prev: InvoiceFormState,
  formData: FormData
): Promise<InvoiceFormState> {
  const { scope, user } = await requireHubAuth();

  const inv = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: { clientId: true, status: true },
  });
  if (!inv || !canAccessClient(scope, inv.clientId)) {
    return { error: "Invoice not found or access denied." };
  }
  if (inv.status !== "DRAFT") {
    return { error: "Only draft invoices can be edited." };
  }

  const issueDateStr = formData.get("issueDate") as string;
  const dueDateStr = formData.get("dueDate") as string;
  const issueDate = issueDateStr ? new Date(issueDateStr) : new Date();
  const dueDate = dueDateStr ? new Date(dueDateStr) : new Date();
  if (Number.isNaN(issueDate.getTime()) || Number.isNaN(dueDate.getTime())) {
    return { error: "Valid issue and due dates required." };
  }

  const descriptions = formData.getAll("description") as string[];
  const quantities = formData.getAll("quantity") as string[];
  const unitPrices = formData.getAll("unitPrice") as string[];

  const lineItems: { description: string; quantity: number; unitPrice: number }[] = [];
  for (let i = 0; i < descriptions.length; i++) {
    const desc = descriptions[i]?.trim();
    if (!desc) continue;
    const parsed = LineItemSchema.safeParse({
      description: desc,
      quantity: quantities[i] ?? "1",
      unitPrice: unitPrices[i] ?? "0",
    });
    if (parsed.success) lineItems.push(parsed.data);
  }
  if (lineItems.length === 0) return { error: "At least one line item is required." };

  let subtotal = 0;
  const items = lineItems.map((item) => {
    const lineTotal = item.quantity * item.unitPrice;
    subtotal += lineTotal;
    return {
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal,
    };
  });

  const totalAmount = subtotal;

  await prisma.$transaction([
    prisma.invoiceLineItem.deleteMany({ where: { invoiceId } }),
    prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        issueDate,
        dueDate,
        includeVat: false,
        vatRate: 0,
        subtotalAmount: String(subtotal),
        vatAmount: "0",
        totalAmount: String(totalAmount),
        notes: (formData.get("notes") as string)?.trim() || null,
        lineItems: {
          create: items.map((i) => ({
            description: i.description,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            lineTotal: i.lineTotal,
          })),
        },
      },
    }),
  ]);

  revalidatePath("/hub/invoices");
  revalidatePath(`/hub/invoices/${invoiceId}`);
  revalidatePath("/hub/billing");
  redirect(`/hub/invoices/${invoiceId}`);
}

export async function setInvoiceStatus(
  invoiceId: string,
  status: InvoiceStatus
): Promise<InvoiceFormState> {
  const { scope } = await requireHubAuth();

  const inv = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: { clientId: true, status: true },
  });
  if (!inv || !canAccessClient(scope, inv.clientId)) {
    return { error: "Invoice not found or access denied." };
  }

  const updates: { status: InvoiceStatus; sentAt?: Date; voidedAt?: Date } = { status };
  if (status === "SENT") updates.sentAt = new Date();
  if (status === "VOID") updates.voidedAt = new Date();

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: updates,
  });

  revalidatePath("/hub/invoices");
  revalidatePath(`/hub/invoices/${invoiceId}`);
  revalidatePath("/hub/billing");
  return {};
}

/** Form action: pass invoiceId via bind, formData must include status. */
export async function setInvoiceStatusForm(
  invoiceId: string,
  _prev: InvoiceFormState,
  formData: FormData
): Promise<InvoiceFormState> {
  const status = formData.get("status");
  if (typeof status !== "string" || !statuses.includes(status as InvoiceStatus)) {
    return { error: "Invalid status" };
  }
  return setInvoiceStatus(invoiceId, status as InvoiceStatus);
}
