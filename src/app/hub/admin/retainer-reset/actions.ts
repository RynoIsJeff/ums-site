"use server";

import { prisma } from "@/lib/prisma";
import { requireHubAuth } from "@/lib/auth";
import { Prisma, type BillingFrequency } from "@prisma/client";
import { normalizeRetainerLineItemsJson } from "@/lib/retainer-invoice-lines";

function parseInvoiceNum(invoiceNumber: string, prefix: string): number {
  const s = prefix ? invoiceNumber.replace(prefix, "") : invoiceNumber;
  const m = s.match(/^0*(\d{1,6})$/);
  return m ? parseInt(m[1], 10) : -1;
}

async function getNextNum(prefix: string): Promise<string> {
  const all = await prisma.invoice.findMany({ select: { invoiceNumber: true } });
  let maxNum = 87;
  for (const inv of all) {
    const n = parseInvoiceNum(inv.invoiceNumber, prefix);
    if (n > maxNum) maxNum = n;
  }
  return `${prefix}${String(maxNum + 1).padStart(4, "0")}`;
}

function addMonths(d: Date, n: number): Date {
  const out = new Date(d);
  out.setMonth(out.getMonth() + n);
  return out;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export type ResetState = {
  deleted?: string[];
  created?: string[];
  error?: string;
};

export async function resetRetainerInvoices(
  minNum: number,
  _prev: ResetState,
): Promise<ResetState> {
  try {
    const { scope } = await requireHubAuth();
    if (scope.role !== "ADMIN") return { error: "Admin only." };

    const config = await prisma.companyConfig.findFirst();
    const prefix = config?.invoicePrefix?.trim() ?? "";

    // Find all invoices with numeric part >= minNum
    const allInvoices = await prisma.invoice.findMany({
      select: { id: true, invoiceNumber: true },
    });
    const toDelete = allInvoices.filter((inv) => {
      const n = parseInvoiceNum(inv.invoiceNumber, prefix);
      return n >= minNum;
    });

    const deletedNumbers = toDelete.map((i) => i.invoiceNumber);

    if (toDelete.length > 0) {
      await prisma.invoice.deleteMany({
        where: { id: { in: toDelete.map((i) => i.id) } },
      });
    }

    // Re-run retainer invoice generation for this month
    const now = new Date();
    const today = startOfMonth(now);
    const created: string[] = [];

    const clients = await prisma.client.findMany({
      where: {
        status: "ACTIVE",
        billingFrequency: { in: ["MONTHLY", "QUARTERLY", "ANNUAL"] },
        OR: [
          { retainerAmount: { not: null } },
          { retainerLineItems: { not: Prisma.DbNull } },
        ],
      },
      select: {
        id: true,
        companyName: true,
        retainerAmount: true,
        retainerLineItems: true,
        billingFrequency: true,
        renewalDate: true,
      },
    });

    for (const client of clients) {
      const freq = client.billingFrequency as BillingFrequency;
      if (!freq) continue;

      const templates = normalizeRetainerLineItemsJson(client.retainerLineItems);
      const amount = client.retainerAmount != null ? Number(client.retainerAmount) : 0;
      if (templates.length === 0 && amount <= 0) continue;

      const monthsPerInvoice = freq === "MONTHLY" ? 1 : freq === "QUARTERLY" ? 3 : 12;

      const lastInvoice = await prisma.invoice.findFirst({
        where: { clientId: client.id },
        orderBy: { issueDate: "desc" },
        select: { issueDate: true },
      });

      // For new clients with no invoices, issue for the current month immediately.
      const issueDate = lastInvoice
        ? (() => {
            const baseDate = new Date(lastInvoice.issueDate);
            const nextIssue = addMonths(startOfMonth(baseDate), monthsPerInvoice);
            return nextIssue.getTime() <= today.getTime() ? nextIssue : null;
          })()
        : today;

      if (issueDate) {
        const dueDate = addMonths(issueDate, 1);
        const invoiceNumber = await getNextNum(prefix);

        const lineCreates =
          templates.length > 0
            ? templates.map((t) => ({
                description: t.description,
                quantity: t.quantity,
                unitPrice: t.unitPrice,
                lineTotal: t.quantity * t.unitPrice,
              }))
            : [
                {
                  description: `Retainer - ${client.companyName} (${freq})`,
                  quantity: 1,
                  unitPrice: amount,
                  lineTotal: amount,
                },
              ];

        const subtotal = lineCreates.reduce((s, l) => s + l.lineTotal, 0);
        if (subtotal <= 0) continue;

        await prisma.invoice.create({
          data: {
            clientId: client.id,
            invoiceNumber,
            issueDate: issueDate,
            dueDate,
            status: "DRAFT",
            includeVat: false,
            vatRate: 0,
            subtotalAmount: String(subtotal),
            vatAmount: "0",
            totalAmount: String(subtotal),
            currency: "ZAR",
            lineItems: { create: lineCreates },
          },
        });
        created.push(invoiceNumber);
      }
    }

    return { deleted: deletedNumbers, created };
  } catch (e) {
    console.error("[resetRetainerInvoices]", e);
    return { error: String(e) };
  }
}
