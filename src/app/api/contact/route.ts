import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "edge";

const Schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(200),
  intent: z.string().optional(),
  message: z.string().min(10).max(5000),
  hp: z.string().optional(), // honeypot — must stay empty or we skip sending
});

export async function POST(req: Request) {
  try {
    const formId = process.env.FORMSPREE_FORM_ID?.trim();
    if (!formId) {
      return NextResponse.json(
        { ok: false, error: "Contact form is not configured (missing FORMSPREE_FORM_ID)." },
        { status: 503 }
      );
    }

    const json = await req.json().catch(() => ({}));
    const parsed = Schema.safeParse(json);
    if (!parsed.success) {
      const msg = parsed.error.errors?.[0]?.message ?? "Invalid payload";
      return NextResponse.json({ ok: false, error: msg }, { status: 400 });
    }
    const { name, email, intent, message, hp } = parsed.data;

    // honeypot — if filled (by bot or autocomplete), pretend success but don't send
    if (hp && hp.trim().length > 0) {
      return NextResponse.json({ ok: true });
    }

    const res = await fetch(`https://formspree.io/f/${formId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        name,
        email,
        message,
        intent: intent ?? "General",
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errMsg = Array.isArray(data.errors) ? data.errors[0]?.message : data.error ?? "Form submission failed";
      return NextResponse.json({ ok: false, error: errMsg }, { status: res.status >= 400 ? res.status : 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Send failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
