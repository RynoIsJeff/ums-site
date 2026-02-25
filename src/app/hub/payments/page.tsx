import Link from "next/link";
import { getSession } from "@/lib/auth";
import { toAuthScope } from "@/lib/auth";
import { clientIdWhere, clientWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { RecordPaymentFormStandalone } from "./_components/RecordPaymentFormStandalone";

export const metadata = {
  title: "Payments | UMS Hub",
};

function toNum(d: unknown): number {
  if (d == null) return 0;
  if (typeof d === "number" && !Number.isNaN(d)) return d;
  return Number(d) || 0;
}

export default async function HubPaymentsPage() {
  const { user } = await getSession();
  if (!user) return null;

  const scope = toAuthScope(user);
  const where = clientIdWhere(scope);

  const [payments, clients, unpaidInvoices] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { paidAt: "desc" },
      include: {
        client: { select: { id: true, companyName: true } },
        invoice: { select: { id: true, invoiceNumber: true } },
      },
    }),
    prisma.client.findMany({
      where: clientWhere(scope),
      orderBy: { companyName: "asc" },
      select: { id: true, companyName: true },
    }),
    prisma.invoice.findMany({
      where: { ...where, status: { in: ["SENT", "OVERDUE"] } },
      select: { id: true, invoiceNumber: true, clientId: true },
    }),
  ]);

  return (
    <section className="py-10">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
          <p className="mt-2 text-sm text-black/70">
            Record and view payments. Link to an invoice to auto-mark it paid when fully settled.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] border-collapse rounded-xl border border-black/10 bg-white text-sm">
              <thead>
                <tr className="border-b border-black/10 text-left">
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium">Client</th>
                  <th className="p-3 font-medium">Invoice</th>
                  <th className="p-3 font-medium">Method</th>
                  <th className="p-3 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-black/50">
                      No payments recorded yet.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="border-b border-black/5 hover:bg-black/[0.02]">
                      <td className="p-3">
                        {p.paidAt.toLocaleDateString("en-ZA", { dateStyle: "medium" })}
                      </td>
                      <td className="p-3">
                        <Link
                          href={`/hub/clients/${p.client.id}`}
                          className="font-medium hover:underline"
                        >
                          {p.client.companyName}
                        </Link>
                      </td>
                      <td className="p-3">
                        {p.invoice ? (
                          <Link
                            href={`/hub/invoices/${p.invoice.id}`}
                            className="text-black/70 hover:underline"
                          >
                            {p.invoice.invoiceNumber}
                          </Link>
                        ) : (
                          <span className="text-black/40">—</span>
                        )}
                      </td>
                      <td className="p-3">{p.method}</td>
                      <td className="p-3">R {toNum(p.amount).toLocaleString("en-ZA")}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-black/10 bg-white p-5">
          <h2 className="text-lg font-semibold">Record payment</h2>
          <RecordPaymentFormStandalone clients={clients} unpaidInvoices={unpaidInvoices} />
        </div>
      </div>
    </section>
  );
}
