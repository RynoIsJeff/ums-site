import { NextResponse } from "next/server";
import { Prisma, type BillingFrequency } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeRetainerLineItemsJson } from "@/lib/retainer-invoice-lines";

async function getNextInvoiceNumber(): Promise<string> {
  const config = await prisma.companyConfig.findFirst();
  const prefix = config?.invoicePrefix?.trim() ?? "";
  const all = await prisma.invoice.findMany({
    select: { invoiceNumber: true },
  });
  let maxNum = 87;
  for (const inv of all) {
    const s = prefix ? inv.invoiceNumber.replace(prefix, "") : inv.invoiceNumber;
    const m = s.match(/^0*(\d{1,6})$/);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > maxNum) maxNum = n;
    }
  }
  return `${prefix}${String(maxNum + 1).padStart(4, "0")}`;
}

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function addMonths(d: Date, n: number): Date {
  const out = new Date(d);
  out.setMonth(out.getMonth() + n);
  return out;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    const token = auth?.replace(/^Bearer\s+/i, "").trim();
    if (token !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

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

    const monthsPerInvoice =
      freq === "MONTHLY" ? 1 : freq === "QUARTERLY" ? 3 : 12;

    const lastInvoice = await prisma.invoice.findFirst({
      where: { clientId: client.id },
      orderBy: { issueDate: "desc" },
      select: { issueDate: true },
    });

    const baseDate = lastInvoice
      ? new Date(lastInvoice.issueDate)
      : client.renewalDate
        ? new Date(client.renewalDate)
        : now;
    const nextIssue = addMonths(startOfMonth(baseDate), monthsPerInvoice);

    if (nextIssue.getTime() <= today.getTime()) {
      const dueDate = addMonths(nextIssue, 1);
      const invoiceNumber = await getNextInvoiceNumber();

      const lineCreates =
        templates.length > 0
          ? templates.map((t) => {
              const lineTotal = t.quantity * t.unitPrice;
              return {
                description: t.description,
                quantity: t.quantity,
                unitPrice: t.unitPrice,
                lineTotal,
              };
            })
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
          issueDate: nextIssue,
          dueDate,
          status: "DRAFT",
          includeVat: false,
          vatRate: 0,
          subtotalAmount: String(subtotal),
          vatAmount: "0",
          totalAmount: String(subtotal),
          currency: "ZAR",
          lineItems: {
            create: lineCreates,
          },
        },
      });
      created.push(invoiceNumber);
    }
  }

  return NextResponse.json({
    ok: true,
    created: created.length,
    invoices: created,
  });
}
