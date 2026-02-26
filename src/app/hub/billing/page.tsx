import Link from "next/link";
import { getSession } from "@/lib/auth";
import { toAuthScope } from "@/lib/auth";
import { clientWhere, clientIdWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Billing | UMS Hub",
};

function toNum(d: unknown): number {
  if (d == null) return 0;
  if (typeof d === "number" && !Number.isNaN(d)) return d;
  return Number(d) || 0;
}

export default async function HubBillingPage() {
  const { user } = await getSession();
  if (!user) return null;

  const scope = toAuthScope(user);
  const clientWhereClause = clientWhere(scope);
  const clientIdClause = clientIdWhere(scope);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const in30Days = new Date(now);
  in30Days.setDate(in30Days.getDate() + 30);

  await prisma.invoice.updateMany({
    where: { ...clientIdClause, status: "SENT", dueDate: { lt: now } },
    data: { status: "OVERDUE" },
  });

  const [clientsWithRenewal, invoicesDueOrOverdue, paymentsThisMonth, allInvoices, invoicesCreatedThisMonth] =
    await Promise.all([
      prisma.client.findMany({
        where: {
          ...clientWhereClause,
          renewalDate: { gte: now, lte: in30Days },
          status: "ACTIVE",
        },
        orderBy: { renewalDate: "asc" },
        select: { id: true, companyName: true, renewalDate: true },
      }),
      prisma.invoice.findMany({
        where: {
          ...clientIdClause,
          status: { in: ["SENT", "OVERDUE"] },
        },
        orderBy: { dueDate: "asc" },
        include: { client: { select: { companyName: true } } },
      }),
      prisma.payment.findMany({
        where: {
          ...clientIdClause,
          paidAt: { gte: startOfMonth, lte: endOfMonth },
        },
        select: { amount: true },
      }),
      prisma.invoice.findMany({
        where: {
          ...clientIdClause,
          status: { in: ["SENT", "OVERDUE"] },
        },
        select: { totalAmount: true },
      }),
      prisma.invoice.count({
        where: {
          ...clientIdClause,
          createdAt: { gte: startOfMonth, lte: endOfMonth },
        },
      }),
    ]);

  const revenueThisMonth = paymentsThisMonth.reduce((s, p) => s + toNum(p.amount), 0);
  const outstandingTotal = allInvoices.reduce((s, i) => s + toNum(i.totalAmount), 0);

  const renewalsBy7 = clientsWithRenewal.filter((c) => c.renewalDate && (c.renewalDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000) <= 7);
  const renewalsBy14 = clientsWithRenewal.filter((c) => c.renewalDate && (c.renewalDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000) <= 14);
  const renewalsBy60 = clientsWithRenewal;

  return (
    <section className="py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
      <p className="mt-2 text-sm text-black/70">
        Revenue, outstanding invoices, and renewals across your clients.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/hub/payments"
          className="block rounded-xl border border-black/10 bg-white p-4 transition-colors hover:border-black/20 hover:bg-black/[0.02]"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-black/50">
            Revenue this month
          </p>
          <p className="mt-1 text-2xl font-semibold">
            R {revenueThisMonth.toLocaleString("en-ZA")}
          </p>
          <p className="mt-1 text-xs text-black/40">View payments →</p>
        </Link>
        <Link
          href="/hub/invoices"
          className="block rounded-xl border border-black/10 bg-white p-4 transition-colors hover:border-black/20 hover:bg-black/[0.02]"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-black/50">
            Outstanding total
          </p>
          <p className="mt-1 text-2xl font-semibold">
            R {outstandingTotal.toLocaleString("en-ZA")}
          </p>
          <p className="mt-1 text-xs text-black/40">View invoices →</p>
        </Link>
        <Link
          href="/hub/invoices"
          className="block rounded-xl border border-black/10 bg-white p-4 transition-colors hover:border-black/20 hover:bg-black/[0.02]"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-black/50">
            Invoices created this month
          </p>
          <p className="mt-1 text-2xl font-semibold">{invoicesCreatedThisMonth}</p>
          <p className="mt-1 text-xs text-black/40">View invoices →</p>
        </Link>
        <Link
          href="#renewals"
          className="block rounded-xl border border-black/10 bg-white p-4 transition-colors hover:border-black/20 hover:bg-black/[0.02]"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-black/50">
            Renewals due (30 days)
          </p>
          <p className="mt-1 text-2xl font-semibold">{renewalsBy60.length}</p>
          <p className="mt-1 text-xs text-black/40">View renewals →</p>
        </Link>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div id="renewals" className="rounded-xl border border-black/10 bg-white p-5">
          <h2 className="text-lg font-semibold">Renewals due</h2>
          <p className="mt-1 text-sm text-black/60">
            Next 7 / 14 / 30 / 60 days (active clients only)
          </p>
          <ul className="mt-4 space-y-2">
            {renewalsBy60.length === 0 ? (
              <li className="text-sm text-black/50">No renewals in the next 60 days.</li>
            ) : (
              renewalsBy60.map((c) => {
                const days = c.renewalDate
                  ? Math.ceil((c.renewalDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
                  : 0;
                const in7 = days <= 7;
                const in14 = days <= 14;
                return (
                  <li key={c.id} className="flex items-center justify-between text-sm">
                    <Link
                      href={`/hub/clients/${c.id}`}
                      className="font-medium hover:underline"
                    >
                      {c.companyName}
                    </Link>
                    <span className={in7 ? "text-amber-600" : in14 ? "text-black/70" : "text-black/50"}>
                      {c.renewalDate ? c.renewalDate.toLocaleDateString("en-ZA", { dateStyle: "medium" }) : "—"} ({days}d)
                    </span>
                  </li>
                );
              })
            )}
          </ul>
        </div>

        <div className="rounded-xl border border-black/10 bg-white p-5">
          <h2 className="text-lg font-semibold">Invoices due / overdue</h2>
          <p className="mt-1 text-sm text-black/60">Sent and not yet paid</p>
          <ul className="mt-4 space-y-2">
            {invoicesDueOrOverdue.length === 0 ? (
              <li className="text-sm text-black/50">No invoices due or overdue.</li>
            ) : (
              invoicesDueOrOverdue.map((inv) => {
                const isOverdue = inv.dueDate < now;
                return (
                  <li key={inv.id} className="flex items-center justify-between text-sm">
                    <Link
                      href={`/hub/invoices/${inv.id}`}
                      className="font-medium hover:underline"
                    >
                      {inv.invoiceNumber}
                    </Link>
                    <span className={isOverdue ? "text-red-600" : "text-black/70"}>
                      {inv.client.companyName} · R {toNum(inv.totalAmount).toLocaleString("en-ZA")} · due {inv.dueDate.toLocaleDateString("en-ZA")}
                    </span>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
