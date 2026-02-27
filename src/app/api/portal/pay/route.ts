import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildPayFastPaymentUrl } from "@/lib/payfast";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const token = formData.get("token");
  if (typeof token !== "string" || !token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const invoice = await prisma.invoice.findUnique({
    where: { portalToken: token },
    include: { client: true, payments: true },
  });

  if (!invoice) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const total = Number(invoice.totalAmount);
  const totalPaid = invoice.payments.reduce((s, p) => s + Number(p.amount), 0);
  const remaining = total - totalPaid;

  if (
    remaining <= 0 ||
    (invoice.status !== "SENT" && invoice.status !== "OVERDUE")
  ) {
    return NextResponse.redirect(
      new URL(`/portal/invoice/${token}`, req.url)
    );
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    req.nextUrl.origin;

  const payUrl = await buildPayFastPaymentUrl({
    amount: remaining,
    itemName: `Invoice ${invoice.invoiceNumber}`,
    itemDescription: invoice.client.companyName,
    emailAddress: invoice.client.email ?? "client@example.com",
    returnUrl: `${baseUrl}/portal/invoice/${token}?paid=1`,
    cancelUrl: `${baseUrl}/portal/invoice/${token}`,
    notifyUrl: `${baseUrl}/api/portal/payfast-notify`,
    mPaymentId: invoice.id,
  });

  return NextResponse.redirect(payUrl);
}
