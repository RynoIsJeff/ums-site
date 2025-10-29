import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

export const runtime = "edge";

const resend = new Resend(process.env.RESEND_API_KEY);
const Schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(200),
  intent: z.string().optional(),
  message: z.string().min(10).max(5000),
  company: z.string().optional(), // honeypot
});

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => ({}));
    const parsed = Schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    }
    const { name, email, intent, message, company } = parsed.data;

    // honeypot
    if (company && company.trim().length > 0) {
      return NextResponse.json({ ok: true });
    }

    const from = process.env.CONTACT_FROM || "ums-site@example.com";
    const to = process.env.CONTACT_TO || "hello@example.com";

    const html = `
      <div style="font-family:Arial,sans-serif;font-size:14px;color:#111">
        <h2>New UMS website enquiry</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Intent:</strong> ${escapeHtml(intent || "N/A")}</p>
        <p><strong>Message:</strong></p>
        <pre style="white-space:pre-wrap">${escapeHtml(message)}</pre>
      </div>
    `;

    await resend.emails.send({
      from,
      to,
      subject: `UMS enquiry — ${intent || "General"}`,
      html,
      replyTo: email,
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Send failed" }, { status: 500 });
  }
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
