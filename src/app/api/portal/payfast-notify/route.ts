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

    await prisma.$transaction([
      prisma.payment.create({
        data: {
          clientId: invoice.clientId,
          invoiceId: invoice.id,
          amount: amount,
          method: "CARD",
          paidAt: new Date(),
          reference: pfPaymentId,
          paymentGateway: "PAYFAST",
          externalReference: pfPaymentId,
        },
      }),
      prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: "PAID", paidAt: new Date() },
      }),
    ]);
  } catch {
    // Log but still return 200
  }

  return new NextResponse("OK", { status: 200 });
}
