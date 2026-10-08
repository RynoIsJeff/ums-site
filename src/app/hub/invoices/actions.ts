"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireHubAuth } from "@/lib/auth";
import { canAccessClient, clientIdWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { sendInvoiceEmail } from "@/lib/email";
import { Prisma, type InvoiceStatus } from "@prisma/client";

const statuses = ["DRAFT", "SENT", "PAID", "OVERDUE", "VOID"] as const;

const CreditSchema = z.object({
  description: z.string().min(1).max(500),
  amount: z.string().transform((v) => Math.abs(Number(v) || 0)),
});

const LineItemSchema = z.object({
  description: z.string().min(1).max(500),
  details: z.string().max(5000).nullable(),
  quantity: z
    .string()
    .transform((s) => ((Number(s) || 0) <= 0 ? 1 : Number(s))),
  unitPrice: z.string().transform((s) => Number(s) || 0),
});

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
    isCredit: boolean;
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
    items.push({ ...parsed.data, isCredit: false, lineTotal });
  }

  // Credits are typed in as positive amounts and stored negative, so they
  // deduct from the same subtotal rather than needing their own column.
  const creditDescriptions = formData.getAll("creditDescription") as string[];
  const creditAmounts = formData.getAll("creditAmount") as string[];
  let creditTotal = 0;

  for (let i = 0; i < creditDescriptions.length; i++) {
    const desc = creditDescriptions[i]?.trim();
    if (!desc) continue;
    const parsed = CreditSchema.safeParse({
      description: desc,
      amount: creditAmounts[i] ?? "0",
    });
    if (!parsed.success || parsed.data.amount === 0) continue;
    const lineTotal = -parsed.data.amount;
    subtotal += lineTotal;
    creditTotal += parsed.data.amount;
    items.push({
      description: parsed.data.description,
      details: null,
      quantity: 1,
      unitPrice: lineTotal,
      isCredit: true,
      lineTotal,
    });
  }

  return { items, subtotal, creditTotal };
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

/**
 * A missing column means the database is behind the deployed code — worth
 * saying so, rather than reporting a generic failure the user cannot act on.
 */
function describeSaveFailure(e: unknown): string {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2022") {
    const column = (e.meta?.column as string) ?? "a new column";
    return `The database is missing ${column}, so this could not be saved. A pending migration needs to run (prisma migrate deploy).`;
  }
  return "Something went wrong.";
}

export type InvoiceFormState = { error?: string; emailError?: string };

export async function createInvoice(
  _prev: InvoiceFormState,
  formData: FormData,
): Promise<InvoiceFormState> {
  try {
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

    const { items, subtotal, creditTotal } = readLineItems(formData);
    if (items.length === 0 || items.every((i) => i.isCredit))
      return { error: "At least one line item is required." };
    if (subtotal < 0)
      return {
        error: `Credits (R ${creditTotal.toLocaleString("en-ZA")}) are more than the invoice total.`,
      };

    const existing = await prisma.invoice.findUnique({
      where: { invoiceNumber },
      select: { id: true },
    });
    if (existing) {
      // Most often a resubmit after a slow save: the first one did land.
      return {
        error: `Invoice ${invoiceNumber} already exists — it may have been created by an earlier attempt. Check the invoice list before trying again.`,
      };
    }

    const totalAmount = subtotal;

    const storeId = (formData.get("storeId") as string)?.trim() || null;

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
        storeId,
        createdById: user.id,
        lineItems: { create: items },
      },
    });

    revalidatePath("/hub/invoices");
    revalidatePath("/hub/billing");
  } catch (e) {
    console.error("[createInvoice]", e);
    return { error: describeSaveFailure(e) };
  }
  redirect("/hub/invoices?success=invoice");
}

export async function updateInvoice(
  invoiceId: string,
  _prev: InvoiceFormState,
  formData: FormData,
): Promise<InvoiceFormState> {
  try {
    const { scope } = await requireHubAuth();

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

    const { items, subtotal, creditTotal } = readLineItems(formData);
    if (items.length === 0 || items.every((i) => i.isCredit))
      return { error: "At least one line item is required." };
    if (subtotal < 0)
      return {
        error: `Credits (R ${creditTotal.toLocaleString("en-ZA")}) are more than the invoice total.`,
      };

    const totalAmount = subtotal;
    const storeId = (formData.get("storeId") as string)?.trim() || null;

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
          storeId,
          lineItems: { create: items },
        },
      }),
    ]);

    revalidatePath("/hub/invoices");
    revalidatePath(`/hub/invoices/${invoiceId}`);
    revalidatePath("/hub/billing");
  } catch (e) {
    console.error("[updateInvoice]", e);
    return { error: describeSaveFailure(e) };
  }
  redirect(`/hub/invoices/${invoiceId}`);
}

export async function setInvoiceStatus(
  invoiceId: string,
  status: InvoiceStatus,
): Promise<InvoiceFormState> {
  const { scope } = await requireHubAuth();

  const inv = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: {
      clientId: true,
      status: true,
      client: { select: { email: true, companyName: true } },
    },
  });
  if (!inv || !canAccessClient(scope, inv.clientId)) {
    return { error: "Invoice not found or access denied." };
  }

  // Block marking as Sent if client has no email (invoice email will fail silently)
  if (status === "SENT" && !inv.client.email) {
    return {
      error: `${inv.client.companyName} has no email address. Add one in the client record before sending this invoice.`,
    };
  }

  const crypto = await import("crypto");
  const portalToken =
    status === "SENT"
      ? crypto.randomBytes(24).toString("base64url")
      : undefined;

  const TOKEN_EXPIRY_DAYS = 90;
  const updates: {
    status: InvoiceStatus;
    sentAt?: Date;
    voidedAt?: Date;
    portalToken?: string;
    portalTokenExpiresAt?: Date;
  } = { status };
  if (status === "SENT") {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + TOKEN_EXPIRY_DAYS);
    updates.sentAt = new Date();
    updates.portalToken = portalToken ?? undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (updates as any).portalTokenExpiresAt = expiresAt; // added in migration — typed after prisma generate
  }
  if (status === "VOID") updates.voidedAt = new Date();

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: updates,
  });

  let emailError: string | undefined;
  if (status === "SENT") {
    const [fullInvoice, companyConfig] = await Promise.all([
      prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          client: true,
          lineItems: { orderBy: { createdAt: "asc" } },
        },
      }),
      prisma.companyConfig.findFirst(),
    ]);
    if (fullInvoice) {
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000";
      const portalUrl = portalToken
        ? `${baseUrl}/portal/invoice/${portalToken}`
        : null;
      const result = await sendInvoiceEmail(
        fullInvoice,
        companyConfig?.companyName ?? null,
        companyConfig?.supportEmail ?? null,
        portalUrl,
      );
      if (!result.success && result.error) {
        emailError = result.error;
      }
    }
  }

  revalidatePath("/hub/invoices");
  revalidatePath(`/hub/invoices/${invoiceId}`);
  revalidatePath("/hub/billing");
  return { emailError };
}

/** Form action: pass invoiceId via bind, formData must include status. */
export async function setInvoiceStatusForm(
  invoiceId: string,
  _prev: InvoiceFormState,
  formData: FormData,
): Promise<InvoiceFormState> {
  const status = formData.get("status");
  if (
    typeof status !== "string" ||
    !statuses.includes(status as InvoiceStatus)
  ) {
    return { error: "Invalid status" };
  }
  return setInvoiceStatus(invoiceId, status as InvoiceStatus);
}

/** Draft invoices only, with no payments linked. */
export async function deleteInvoice(
  invoiceId: string,
): Promise<{ error?: string }> {
  try {
    const { scope } = await requireHubAuth();

    const inv = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: {
        clientId: true,
        status: true,
        _count: { select: { allocations: true } },
      },
    });
    if (!inv || !canAccessClient(scope, inv.clientId)) {
      return { error: "Invoice not found or access denied." };
    }
    if (inv.status !== "DRAFT") {
      return { error: "Only draft invoices can be deleted." };
    }
    if (inv._count.allocations > 0) {
      return { error: "Cannot delete an invoice that has payments recorded." };
    }

    await prisma.invoice.delete({ where: { id: invoiceId } });

    revalidatePath("/hub/invoices");
    revalidatePath("/hub/billing");
    revalidatePath(`/hub/clients/${inv.clientId}`);
  } catch (e) {
    console.error("[deleteInvoice]", e);
    return { error: "Something went wrong." };
  }
  return {};
}

/** Regenerate the portal token for a sent/overdue invoice (e.g. after expiry). Resets expiry to 90 days from now. */
export async function regeneratePortalToken(
  invoiceId: string,
): Promise<{ error?: string }> {
  const { scope } = await requireHubAuth();

  const inv = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: { clientId: true, status: true },
  });
  if (!inv || !canAccessClient(scope, inv.clientId)) {
    return { error: "Invoice not found or access denied." };
  }
  if (!["SENT", "OVERDUE", "PAID"].includes(inv.status)) {
    return {
      error:
        "Portal link can only be regenerated for sent, overdue, or paid invoices.",
    };
  }

  const crypto = await import("crypto");
  const newToken = crypto.randomBytes(24).toString("base64url");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 90);

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { portalToken: newToken, portalTokenExpiresAt: expiresAt },
  });

  revalidatePath(`/hub/invoices/${invoiceId}`);
  return {};
}

/** New draft invoice with the same client, lines, amounts, VAT, and notes; new number from `getNextInvoiceNumber`; dates reset to today keeping the original issue→due offset. */
export async function duplicateInvoice(invoiceId: string): Promise<void> {
  const { scope, user } = await requireHubAuth();

  const src = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { lineItems: { orderBy: { createdAt: "asc" } } },
  });
  if (!src || !canAccessClient(scope, src.clientId)) {
    redirect("/hub/invoices");
  }
  if (src.lineItems.length === 0) {
    redirect(`/hub/invoices/${invoiceId}`);
  }

  const invoiceNumber = await getNextInvoiceNumber();
  const offsetMs = src.dueDate.getTime() - src.issueDate.getTime();
  const issueDate = new Date();
  issueDate.setHours(0, 0, 0, 0);
  const dueDate = new Date(issueDate.getTime() + offsetMs);

  try {
    const newInv = await prisma.invoice.create({
      data: {
        clientId: src.clientId,
        invoiceNumber,
        issueDate,
        dueDate,
        status: "DRAFT",
        includeVat: src.includeVat,
        vatRate: src.vatRate,
        subtotalAmount: src.subtotalAmount,
        vatAmount: src.vatAmount,
        totalAmount: src.totalAmount,
        currency: src.currency,
        notes: src.notes,
        createdById: user.id,
        lineItems: {
          create: src.lineItems.map((li) => ({
            description: li.description,
            details: li.details,
            isCredit: li.isCredit,
            quantity: li.quantity,
            unitPrice: li.unitPrice,
            lineTotal: li.lineTotal,
          })),
        },
      },
    });

    revalidatePath("/hub/invoices");
    revalidatePath("/hub/billing");
    revalidatePath(`/hub/clients/${src.clientId}`);
    redirect(`/hub/invoices/${newInv.id}`);
  } catch (e) {
    console.error("[duplicateInvoice]", e);
    redirect(`/hub/invoices/${invoiceId}`);
  }
}
