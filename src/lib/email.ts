import { Resend } from "resend";
import type { Invoice, Client, InvoiceLineItem } from "@prisma/client";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

type InvoiceWithRelations = Invoice & {
  client: Client;
  lineItems: InvoiceLineItem[];
};

function formatCurrency(amount: number | string, currency = "ZAR"): string {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  if (currency === "ZAR") {
    return `R ${n.toLocaleString("en-ZA")}`;
  }
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency }).format(
    n
  );
}

function buildInvoiceEmailHtml(
  invoice: InvoiceWithRelations,
  companyName: string,
  supportEmail: string | null,
  portalUrl?: string | null
): string {
  const issueDate = invoice.issueDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const dueDate = invoice.dueDate.toLocaleDateString("en-ZA", {
    dateStyle: "medium",
  });
  const total = Number(invoice.totalAmount);
  const currency = invoice.currency || "ZAR";

  const rows = invoice.lineItems
    .map(
      (line) => `
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(line.description)}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${Number(line.quantity)}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(Number(line.unitPrice), currency)}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(Number(line.lineTotal), currency)}</td>
    </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; color: #374151; max-width: 600px; margin: 0 auto; padding: 24px;">
  <div style="margin-bottom: 24px;">
    <p style="font-size: 18px; font-weight: 700; color: #111;">${escapeHtml(companyName || "Invoice")}</p>
    ${supportEmail ? `<p style="font-size: 14px; color: #6b7280;">${escapeHtml(supportEmail)}</p>` : ""}
  </div>
  <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 8px;">Invoice ${escapeHtml(invoice.invoiceNumber)}</h1>
  <p style="color: #6b7280; margin-bottom: 24px;">Issue date: ${issueDate} · Due date: ${dueDate}</p>
  <p style="margin-bottom: 16px;"><strong>To:</strong> ${escapeHtml(invoice.client.companyName)}</p>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
    <thead>
      <tr style="background: #f9fafb;">
        <th style="padding: 8px 12px; text-align: left; font-weight: 600;">Description</th>
        <th style="padding: 8px 12px; text-align: right; font-weight: 600;">Qty</th>
        <th style="padding: 8px 12px; text-align: right; font-weight: 600;">Unit price</th>
        <th style="padding: 8px 12px; text-align: right; font-weight: 600;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
    <tfoot>
      <tr style="font-weight: 600; border-top: 2px solid #e5e7eb;">
        <td colspan="3" style="padding: 12px;">Total</td>
        <td style="padding: 12px; text-align: right;">${formatCurrency(total, currency)}</td>
      </tr>
    </tfoot>
  </table>
  ${invoice.notes ? `<p style="color: #6b7280; font-size: 14px; margin-top: 24px;">${escapeHtml(invoice.notes)}</p>` : ""}
  <p style="margin-top: 32px; font-size: 14px; color: #6b7280;">
    Please make payment by the due date. Contact us if you have any questions.
  </p>
  ${portalUrl ? `
  <p style="margin-top: 16px;">
    <a href="${escapeHtml(portalUrl)}" style="display: inline-block; background: #0586AD; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
      View invoice &amp; pay online
    </a>
  </p>
  ` : ""}
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendPaymentReminderEmail(
  invoice: InvoiceWithRelations,
  companyName: string | null,
  supportEmail: string | null,
  portalUrl: string | null,
  reminderType: "due_soon" | "overdue"
): Promise<{ success: boolean; error?: string }> {
  if (!resend) return { success: false, error: "Email not configured" };

  const toEmail = invoice.client.email?.trim();
  if (!toEmail) return { success: false, error: "Client has no email" };

  const subject =
    reminderType === "overdue"
      ? `Overdue: Invoice ${invoice.invoiceNumber}`
      : `Reminder: Invoice ${invoice.invoiceNumber} due soon`;

  const html = buildInvoiceEmailHtml(
    invoice,
    companyName || "UMS",
    supportEmail,
    portalUrl
  ).replace(
    "Please make payment by the due date.",
    reminderType === "overdue"
      ? "This invoice is now overdue. Please pay as soon as possible."
      : "This is a friendly reminder that payment is due soon."
  );

  const fromEmail =
    process.env.EMAIL_FROM ||
    supportEmail ||
    process.env.HUB_BOOTSTRAP_EMAIL ||
    "noreply@resend.dev";

  try {
    const { error } = await resend.emails.send({
      from: `${companyName || "UMS"} <${fromEmail}>`,
      to: [toEmail],
      subject,
      html,
    });
    return error ? { success: false, error: error.message } : { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to send",
    };
  }
}

export async function sendInvoiceEmail(
  invoice: InvoiceWithRelations,
  companyName: string | null,
  supportEmail: string | null,
  portalUrl?: string | null
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set, skipping invoice email");
    return { success: false, error: "Email not configured" };
  }

  const toEmail = invoice.client.email?.trim();
  if (!toEmail) {
    return { success: false, error: "Client has no email address" };
  }

  const fromEmail =
    process.env.EMAIL_FROM ||
    supportEmail ||
    process.env.HUB_BOOTSTRAP_EMAIL ||
    "noreply@resend.dev";
  const fromName = companyName || "UMS Hub";

  const html = buildInvoiceEmailHtml(
    invoice,
    companyName || "UMS",
    supportEmail,
    portalUrl
  );

  try {
    const { error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [toEmail],
      subject: `Invoice ${invoice.invoiceNumber} from ${companyName || "UMS"}`,
      html,
    });
    if (error) {
      console.error("[email] Resend error:", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e) {
    console.error("[email] Failed to send invoice:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to send email",
    };
  }
}
