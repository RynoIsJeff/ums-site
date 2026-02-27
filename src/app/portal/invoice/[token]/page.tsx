import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { toNum } from "@/lib/utils";
import { getCompanyConfig } from "@/lib/company-config";
import { isPayFastConfigured } from "@/lib/payfast";

type PageProps = { params: Promise<{ token: string }> };

export const metadata = {
  title: "View Invoice | UMS",
};

export default async function PortalInvoicePage({ params }: PageProps) {
  const { token } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { portalToken: token },
    include: {
      client: true,
      lineItems: { orderBy: { createdAt: "asc" } },
      payments: { orderBy: { paidAt: "desc" } },
    },
  });

  if (!invoice) notFound();

  // Don't show PAID or VOID invoices in portal (optional - or allow view)
  if (invoice.status === "VOID") notFound();

  const config = await getCompanyConfig();
  const total = toNum(invoice.totalAmount);
  const totalPaid = invoice.payments.reduce((s, p) => s + toNum(p.amount), 0);
  const remaining = total - totalPaid;
  const canPay =
    (invoice.status === "SENT" || invoice.status === "OVERDUE") &&
    remaining > 0;
  const payFastEnabled = isPayFastConfigured();

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    "http://localhost:3000";

  return (
    <div
      className="min-h-screen bg-slate-50 py-12 px-4"
      style={{ fontFamily: "system-ui, sans-serif" }}
    >
      <div className="mx-auto max-w-2xl">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 py-6 text-white" style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))" }}>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white text-sm mb-4"
            >
              ← Back to site
            </Link>
            <div className="flex items-start gap-4">
              <Image
                src="/ums-logo.svg"
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 object-contain opacity-90"
              />
              <div>
                <h1 className="text-xl font-bold">
                  {config?.companyName || "Invoice"}
                </h1>
                <p className="text-white/80 text-sm mt-1">
                  Invoice {invoice.invoiceNumber}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  invoice.status === "PAID"
                    ? "bg-green-100 text-green-800"
                    : invoice.status === "OVERDUE"
                      ? "bg-red-100 text-red-800"
                      : "bg-amber-100 text-amber-800"
                }`}
              >
                {invoice.status}
              </span>
              <span className="text-slate-600 text-sm">
                Due {invoice.dueDate.toLocaleDateString("en-ZA", { dateStyle: "medium" })}
              </span>
            </div>

            {/* Bill to */}
            <div>
              <h2 className="text-sm font-medium text-slate-500 mb-1">Bill to</h2>
              <p className="font-medium text-slate-900">
                {invoice.client.companyName}
              </p>
            </div>

            {/* Line items */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">
                      Description
                    </th>
                    <th className="text-right py-3 px-4 font-medium">Qty</th>
                    <th className="text-right py-3 px-4 font-medium">
                      Unit price
                    </th>
                    <th className="text-right py-3 px-4 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems.map((line) => (
                    <tr key={line.id} className="border-t border-slate-100">
                      <td className="py-3 px-4">{line.description}</td>
                      <td className="py-3 px-4 text-right">
                        {Number(line.quantity)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        R {toNum(line.unitPrice).toLocaleString("en-ZA")}
                      </td>
                      <td className="py-3 px-4 text-right">
                        R {toNum(line.lineTotal).toLocaleString("en-ZA")}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                  <tr>
                    <td colSpan={3} className="py-3 px-4 font-semibold">
                      Total
                    </td>
                    <td className="py-3 px-4 text-right font-semibold">
                      R {total.toLocaleString("en-ZA")}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Payments */}
            {invoice.payments.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-2">
                  Payments received
                </h3>
                <ul className="space-y-1 text-sm">
                  {invoice.payments.map((p) => (
                    <li
                      key={p.id}
                      className="flex justify-between text-slate-600"
                    >
                      <span>
                        {p.paidAt.toLocaleDateString("en-ZA")} · {p.method}
                      </span>
                      <span>R {toNum(p.amount).toLocaleString("en-ZA")}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-sm font-medium">
                  Total paid: R {totalPaid.toLocaleString("en-ZA")}
                  {remaining > 0 && (
                    <span className="text-amber-600 ml-2">
                      · R {remaining.toLocaleString("en-ZA")} outstanding
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Pay online */}
            {canPay && (
              <div className="border-t border-slate-200 pt-6">
                <h3 className="text-sm font-medium text-slate-700 mb-3">
                  Pay online
                </h3>
                {payFastEnabled ? (
                  <form action="/api/portal/pay" method="POST">
                    <input type="hidden" name="token" value={token} />
                    <button
                      type="submit"
                      className="w-full rounded-lg bg-green-600 px-4 py-3 text-white font-semibold hover:bg-green-700"
                    >
                      Pay R {remaining.toLocaleString("en-ZA")} with card or EFT
                    </button>
                  </form>
                ) : (
                  <div className="rounded-lg bg-slate-100 p-4 text-sm text-slate-700">
                    <p className="font-medium mb-2">Bank transfer details</p>
                    <p>Pay to: First National Bank (FNB)</p>
                    <p>Account: 63067511387</p>
                    <p>Branch: 250655</p>
                    <p className="mt-2">
                      Reference: {invoice.invoiceNumber}
                    </p>
                    {config?.supportEmail && (
                      <p className="mt-2">
                        Contact{" "}
                        <a
                          href={`mailto:${config.supportEmail}`}
                          className="text-(--primary) hover:underline"
                        >
                          {config.supportEmail}
                        </a>{" "}
                        for assistance.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
