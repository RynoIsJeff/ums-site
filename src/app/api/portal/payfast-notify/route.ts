import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";

export const dynamic = "force-dynamic";

function verifyPayFastSignature(
  params: Record<string, string>,
  passphrase: string
): boolean {
  const exclude = ["signature"];
  const filtered: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (!exclude.includes(k) && v != null && v !== "") filtered[k] = v;
  }
  const pfParamString = Object.keys(filtered)
    .sort()
    .map(
      (k) =>
        `${k}=${encodeURIComponent(filtered[k]).replace(/%20/g, "+")}`
    )
    .join("&");
  const signature =
    passphrase !== ""
      ? `${pfParamString}&passphrase=${encodeURIComponent(passphrase)}`
      : pfParamString;
  const expected = createHash("md5").update(signature).digest("hex");
  return params.signature === expected;
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const params: Record<string, string> = {};
  formData.forEach((v, k) => {
    params[k] = String(v);
  });

  const passphrase = process.env.PAYFAST_PASSPHRASE ?? "";
  if (!verifyPayFastSignature(params, passphrase)) {
    return new NextResponse("Bad signature", { status: 400 });
  }

  const paymentStatus = params.payment_status;
  if (paymentStatus !== "COMPLETE") {
    return new NextResponse("OK", { status: 200 });
  }

  const mPaymentId = params.m_payment_id;
  const pfPaymentId = params.pf_payment_id;
  const amount = parseFloat(params.amount_gross ?? params.amount ?? "0");
  const invoiceId = mPaymentId || undefined;

  if (!invoiceId || amount <= 0) {
    return new NextResponse("OK", { status: 200 });
  }

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return new NextResponse("OK", { status: 200 });
    }

    // Duplicate guard: if this pfPaymentId was already recorded, skip
    if (pfPaymentId) {
      const existing = await prisma.payment.findFirst({
        where: { externalReference: pfPaymentId },
        select: { id: true },
      });
      if (existing) {
        console.warn(`[payfast-notify] Duplicate webhook for pfPaymentId=${pfPaymentId} — skipping`);
        return new NextResponse("OK", { status: 200 });
      }
    }

    await prisma.$transaction(async (tx) => {
      const pay = await tx.payment.create({
        data: {
          clientId: invoice.clientId,
          amount: amount,
          method: "CARD",
          paidAt: new Date(),
          reference: pfPaymentId,
          paymentGateway: "PAYFAST",
          externalReference: pfPaymentId,
        },
      });
      await tx.paymentAllocation.create({
        data: {
          paymentId: pay.id,
          invoiceId: invoice.id,
          allocatedAmount: amount,
        },
      });
      await tx.invoice.update({
        where: { id: invoice.id },
        data: { status: "PAID", paidAt: new Date() },
      });
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[payfast-notify] Failed to record payment:", message, { invoiceId, pfPaymentId });
    return new NextResponse("Internal error", { status: 500 });
  }

  return new NextResponse("OK", { status: 200 });
}
