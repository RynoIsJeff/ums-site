"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireHubAuth } from "@/lib/auth";
import { canAccessClient, clientIdWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { sendQuoteEmail } from "@/lib/email";
import { getNextInvoiceNumber } from "../actions";
import type { QuoteStatus } from "@prisma/client";

const statuses = [
  "DRAFT",
  "SENT",
  "ACCEPTED",
  "DECLINED",
  "EXPIRED",
  "CONVERTED",
] as const;

const LineItemSchema = z.object({
  description: z.string().min(1).max(500),
  details: z.string().max(5000).nullable(),
  quantity: z
    .string()
    .transform((s) => ((Number(s) || 0) <= 0 ? 1 : Number(s))),
  unitPrice: z.string().transform((s) => Number(s) || 0),
});

export type QuoteFormState = { error?: string; emailError?: string };

/** Returns next quote number in Q + 4-digit format (e.g. Q0001). */
export async function getNextQuoteNumber(): Promise<string> {
  const { scope } = await requireHubAuth();
  const all = await prisma.quote.findMany({
    where: clientIdWhere(scope),
    select: { quoteNumber: true },
  });
  let maxNum = 0;
  for (const q of all) {
    const m = q.quoteNumber.match(/^Q0*(\d{1,4})$/i);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > maxNum) maxNum = n;
    }
  }
  return `Q${String(maxNum + 1).padStart(4, "0")}`;
}

/**
 * Parse the repeated line item fields into priced rows. `details` is the
 * optional multi-line block shown under a description — blank rows are skipped,
 * and every row submits a details field so the indexes stay aligned.
 */
function readLineItems(formData: FormData) {
  const descriptions = formData.getAll("description") as string[];
  const detailsList = formData.getAll("details") as string[];
  const quantities = formData.getAll("quantity") as string[];
  const unitPrices = formData.getAll("unitPrice") as string[];

  const items: {
    description: string;
    details: string | null;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[] = [];
  let subtotal = 0;

  for (let i = 0; i < descriptions.length; i++) {
    const desc = descriptions[i]?.trim();
    if (!desc) continue;
    const parsed = LineItemSchema.safeParse({
      description: desc,
      details: detailsList[i]?.trim() || null,
      quantity: quantities[i] ?? "1",
      unitPrice: unitPrices[i] ?? "0",
    });
    if (!parsed.success) continue;
    const lineTotal = parsed.data.quantity * parsed.data.unitPrice;
    subtotal += lineTotal;
    items.push({ ...parsed.data, lineTotal });
  }

  return { items, subtotal };
}

export async function createQuote(
  _prev: QuoteFormState,
  formData: FormData,
): Promise<QuoteFormState> {
  let newQuoteId: string;
  try {
    const { scope, user } = await requireHubAuth();

    const clientId = formData.get("clientId") as string;
    if (!clientId || !canAccessClient(scope, clientId)) {
      return { error: "Invalid or inaccessible client." };
    }

    const quoteNumber = (formData.get("quoteNumber") as string)?.trim();
    if (!quoteNumber) return { error: "Quote number is required." };

    const issueDateStr = formData.get("issueDate") as string;
    const validUntilStr = formData.get("validUntil") as string;
    const issueDate = issueDateStr ? new Date(issueDateStr) : new Date();
    const validUntil = validUntilStr ? new Date(validUntilStr) : new Date();
    if (
      Number.isNaN(issueDate.getTime()) ||
      Number.isNaN(validUntil.getTime())
    ) {
      return { error: "Valid issue and valid-until dates required." };
    }

    const { items, subtotal } = readLineItems(formData);
    if (items.length === 0)
      return { error: "At least one line item is required." };

    const existing = await prisma.quote.findUnique({ where: { quoteNumber } });
    if (existing) return { error: "Quote number already in use." };

    const storeId = (formData.get("storeId") as string)?.trim() || null;

    const quote = await prisma.quote.create({
      data: {
        clientId,
        quoteNumber,
        issueDate,
        validUntil,
        status: "DRAFT",
        includeVat: false,
        vatRate: 0,
        subtotalAmount: String(subtotal),
        vatAmount: "0",
        totalAmount: String(subtotal),
        currency: "ZAR",
        notes: (formData.get("notes") as string)?.trim() || null,
        storeId,
        createdById: user.id,
        lineItems: { create: items },
      },
    });
    newQuoteId = quote.id;

    revalidatePath("/hub/invoices/quotes");
  } catch (e) {
    console.error("[createQuote]", e);
    return { error: "Something went wrong." };
  }
  redirect(`/hub/invoices/quotes/${newQuoteId}`);
}

export async function updateQuote(
  quoteId: string,
  _prev: QuoteFormState,
  formData: FormData,
): Promise<QuoteFormState> {
  try {
    const { scope } = await requireHubAuth();

    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      select: { clientId: true, status: true },
    });
    if (!quote || !canAccessClient(scope, quote.clientId)) {
      return { error: "Quote not found or access denied." };
    }
    if (quote.status !== "DRAFT") {
      return { error: "Only draft quotes can be edited." };
    }

    const issueDateStr = formData.get("issueDate") as string;
    const validUntilStr = formData.get("validUntil") as string;
    const issueDate = issueDateStr ? new Date(issueDateStr) : new Date();
    const validUntil = validUntilStr ? new Date(validUntilStr) : new Date();
    if (
      Number.isNaN(issueDate.getTime()) ||
      Number.isNaN(validUntil.getTime())
    ) {
      return { error: "Valid issue and valid-until dates required." };
    }

    const { items, subtotal } = readLineItems(formData);
    if (items.length === 0)
      return { error: "At least one line item is required." };

    const storeId = (formData.get("storeId") as string)?.trim() || null;

    await prisma.$transaction([
      prisma.quoteLineItem.deleteMany({ where: { quoteId } }),
      prisma.quote.update({
        where: { id: quoteId },
        data: {
          issueDate,
          validUntil,
          subtotalAmount: String(subtotal),
          vatAmount: "0",
          totalAmount: String(subtotal),
          notes: (formData.get("notes") as string)?.trim() || null,
          storeId,
          lineItems: { create: items },
        },
      }),
    ]);

    revalidatePath("/hub/invoices/quotes");
    revalidatePath(`/hub/invoices/quotes/${quoteId}`);
  } catch (e) {
    console.error("[updateQuote]", e);
    return { error: "Something went wrong." };
  }
  redirect(`/hub/invoices/quotes/${quoteId}`);
}

/**
 * Move a quote through its lifecycle. Marking it Sent emails the client the
 * quotation (same Resend setup as invoices). CONVERTED is set by
 * `convertQuoteToInvoice` only.
 */
export async function setQuoteStatus(
  quoteId: string,
  status: QuoteStatus,
): Promise<QuoteFormState> {
  const { scope } = await requireHubAuth();

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    select: {
      clientId: true,
      status: true,
      client: { select: { email: true, companyName: true } },
    },
  });
  if (!quote || !canAccessClient(scope, quote.clientId)) {
    return { error: "Quote not found or access denied." };
  }
  if (status === "CONVERTED") {
    return { error: "Use “Create invoice” to convert an accepted quote." };
  }
  if (quote.status === "CONVERTED") {
    return { error: "This quote has already been converted to an invoice." };
  }
  if (status === "SENT" && !quote.client.email) {
    return {
      error: `${quote.client.companyName} has no email address. Add one in the client record before sending this quote.`,
    };
  }

  const now = new Date();
  await prisma.quote.update({
    where: { id: quoteId },
    data: {
      status,
      ...(status === "SENT" && { sentAt: now }),
      ...(status === "ACCEPTED" && { acceptedAt: now }),
      ...(status === "DECLINED" && { declinedAt: now }),
    },
  });

  let emailError: string | undefined;
  if (status === "SENT") {
    const [fullQuote, companyConfig] = await Promise.all([
      prisma.quote.findUnique({
        where: { id: quoteId },
        include: { client: true, lineItems: { orderBy: { createdAt: "asc" } } },
      }),
      prisma.companyConfig.findFirst(),
    ]);
    if (fullQuote) {
      const result = await sendQuoteEmail(
        fullQuote,
        companyConfig?.companyName ?? null,
        companyConfig?.supportEmail ?? null,
      );
      if (!result.success && result.error) emailError = result.error;
    }
  }

  revalidatePath("/hub/invoices/quotes");
  revalidatePath(`/hub/invoices/quotes/${quoteId}`);
  return { emailError };
}

/** Form action: pass quoteId via bind, formData must include status. */
export async function setQuoteStatusForm(
  quoteId: string,
  _prev: QuoteFormState,
  formData: FormData,
): Promise<QuoteFormState> {
  const status = formData.get("status");
  if (typeof status !== "string" || !statuses.includes(status as QuoteStatus)) {
    return { error: "Invalid status" };
  }
  return setQuoteStatus(quoteId, status as QuoteStatus);
}

/** Draft, declined, or expired quotes only — never one already converted. */
export async function deleteQuote(
  quoteId: string,
): Promise<{ error?: string }> {
  try {
    const { scope } = await requireHubAuth();

    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      select: { clientId: true, status: true },
    });
    if (!quote || !canAccessClient(scope, quote.clientId)) {
      return { error: "Quote not found or access denied." };
    }
    if (!["DRAFT", "DECLINED", "EXPIRED"].includes(quote.status)) {
      return {
        error: "Only draft, declined, or expired quotes can be deleted.",
      };
    }

    await prisma.quote.delete({ where: { id: quoteId } });

    revalidatePath("/hub/invoices/quotes");
    revalidatePath(`/hub/clients/${quote.clientId}`);
  } catch (e) {
    console.error("[deleteQuote]", e);
    return { error: "Something went wrong." };
  }
  return {};
}

/** New draft quote with the same client, store, lines, and notes; new number, dates reset to today keeping the original validity window. */
export async function duplicateQuote(quoteId: string): Promise<void> {
  const { scope, user } = await requireHubAuth();

  const src = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: { lineItems: { orderBy: { createdAt: "asc" } } },
  });
  if (!src || !canAccessClient(scope, src.clientId)) {
    redirect("/hub/invoices/quotes");
  }
  if (src.lineItems.length === 0) {
    redirect(`/hub/invoices/quotes/${quoteId}`);
  }

  const quoteNumber = await getNextQuoteNumber();
  const offsetMs = src.validUntil.getTime() - src.issueDate.getTime();
  const issueDate = new Date();
  issueDate.setHours(0, 0, 0, 0);
  const validUntil = new Date(issueDate.getTime() + offsetMs);

  let newQuoteId: string;
  try {
    const copy = await prisma.quote.create({
      data: {
        clientId: src.clientId,
        quoteNumber,
        issueDate,
        validUntil,
        status: "DRAFT",
        includeVat: src.includeVat,
        vatRate: src.vatRate,
        subtotalAmount: src.subtotalAmount,
        vatAmount: src.vatAmount,
        totalAmount: src.totalAmount,
        currency: src.currency,
        notes: src.notes,
        storeId: src.storeId,
        createdById: user.id,
        lineItems: {
          create: src.lineItems.map((li) => ({
            description: li.description,
            details: li.details,
            quantity: li.quantity,
            unitPrice: li.unitPrice,
            lineTotal: li.lineTotal,
          })),
        },
      },
    });
    newQuoteId = copy.id;
  } catch (e) {
    console.error("[duplicateQuote]", e);
    redirect(`/hub/invoices/quotes/${quoteId}`);
  }

  revalidatePath("/hub/invoices/quotes");
  redirect(`/hub/invoices/quotes/${newQuoteId}`);
}

/**
 * Turn an accepted quote into a draft invoice: line items, amounts, store, and
 * notes carry over; the invoice gets the next invoice number, today's issue
 * date, and a due date the same number of days out as the quote's validity
 * window (30 days minimum). The quote is then marked CONVERTED and linked to
 * the invoice, so it can only ever produce one.
 */
export async function convertQuoteToInvoice(
  quoteId: string,
): Promise<{ error?: string }> {
  let newInvoiceId: string;
  try {
    const { scope, user } = await requireHubAuth();

    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: { lineItems: { orderBy: { createdAt: "asc" } } },
    });
    if (!quote || !canAccessClient(scope, quote.clientId)) {
      return { error: "Quote not found or access denied." };
    }
    if (quote.status === "CONVERTED" || quote.convertedInvoiceId) {
      return { error: "This quote has already been converted to an invoice." };
    }
    if (quote.status !== "ACCEPTED") {
      return {
        error: "Mark the quote as Accepted before creating an invoice from it.",
      };
    }
    if (quote.lineItems.length === 0) {
      return { error: "This quote has no line items." };
    }

    const invoiceNumber = await getNextInvoiceNumber();

    const issueDate = new Date();
    issueDate.setHours(0, 0, 0, 0);
    const validityDays = Math.round(
      (quote.validUntil.getTime() - quote.issueDate.getTime()) / 86_400_000,
    );
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + Math.max(30, validityDays));

    const invoice = await prisma.$transaction(async (tx) => {
      const created = await tx.invoice.create({
        data: {
          clientId: quote.clientId,
          invoiceNumber,
          issueDate,
          dueDate,
          status: "DRAFT",
          includeVat: quote.includeVat,
          vatRate: quote.vatRate,
          subtotalAmount: quote.subtotalAmount,
          vatAmount: quote.vatAmount,
          totalAmount: quote.totalAmount,
          currency: quote.currency,
          notes: quote.notes,
          storeId: quote.storeId,
          createdById: user.id,
          lineItems: {
            create: quote.lineItems.map((li) => ({
              description: li.description,
              details: li.details,
              quantity: li.quantity,
              unitPrice: li.unitPrice,
              lineTotal: li.lineTotal,
            })),
          },
        },
      });

      await tx.quote.update({
        where: { id: quoteId },
        data: {
          status: "CONVERTED",
          convertedAt: new Date(),
          convertedInvoiceId: created.id,
        },
      });

      return created;
    });
    newInvoiceId = invoice.id;

    revalidatePath("/hub/invoices");
    revalidatePath("/hub/invoices/quotes");
    revalidatePath(`/hub/invoices/quotes/${quoteId}`);
    revalidatePath("/hub/billing");
    revalidatePath(`/hub/clients/${quote.clientId}`);
  } catch (e) {
    console.error("[convertQuoteToInvoice]", e);
    return { error: "Something went wrong creating the invoice." };
  }
  redirect(`/hub/invoices/${newInvoiceId}`);
}
