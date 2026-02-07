import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

export const runtime = "edge";

const Schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(200),
  intent: z.string().optional(),
  message: z.string().min(10).max(5000),
  company: z.string().optional(), // honeypot
});

export async function POST(req: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.CONTACT_TO;
    if (!apiKey || !apiKey.trim()) {
      return NextResponse.json(
        { ok: false, error: "Contact form is not configured (missing RESEND_API_KEY)." },
        { status: 503 }
      );
    }
    if (!to || !to.trim()) {
      return NextResponse.json(
        { ok: false, error: "Contact form is not configured (missing CONTACT_TO)." },
        { status: 503 }
      );
    }

    const json = await req.json().catch(() => ({}));
    const parsed = Schema.safeParse(json);
    if (!parsed.success) {
      const msg = parsed.error.errors?.[0]?.message ?? "Invalid payload";
      return NextResponse.json({ ok: false, error: msg }, { status: 400 });
    }
    const { name, email, intent, message, company } = parsed.data;

    // honeypot — treat as success but don't send
    if (company && company.trim().length > 0) {
      return NextResponse.json({ ok: true });
    }

    // Resend: "from" must be a verified domain or use onboarding@resend.dev for testing
    const from =
      process.env.CONTACT_FROM?.trim() ||
      "UMS Contact <onboarding@resend.dev>";

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

    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from,
      to: to.trim().split(",").map((e) => e.trim()).filter(Boolean),
      subject: `UMS enquiry — ${intent || "General"}`,
      html,
      replyTo: email,
    });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message || "Email send failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, id: data?.id });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Send failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
