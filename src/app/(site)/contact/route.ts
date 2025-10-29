import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email, intent, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
    }

    const html = `
      <div style="font-family:Arial,sans-serif;font-size:14px;color:#111">
        <h2>New UMS website enquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Intent:</strong> ${intent || "N/A"}</p>
        <p><strong>Message:</strong></p>
        <pre style="white-space:pre-wrap">${message}</pre>
      </div>
    `;

    await resend.emails.send({
      from: process.env.CONTACT_FROM || "ums-site@example.com",
      to: process.env.CONTACT_TO || "hello@example.com",
      subject: `UMS enquiry — ${intent || "General"}`,
      html,
      reply_to: email,
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Send failed" }, { status: 500 });
  }
}
