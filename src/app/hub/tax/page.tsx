import { getSession, toAuthScope } from "@/lib/auth";
import { clientIdWhere, clientWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { toNum } from "@/lib/utils";
import { Breadcrumbs } from "@/app/hub/_components/Breadcrumbs";
import { TaxRangeFilter } from "./_components/TaxRangeFilter";

export const metadata = { title: "Tax Tool | UMS Hub" };

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function fmt(n: number) {
  return `R ${n.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function parseDate(s: string | undefined, fallback: Date): Date {
  if (!s || typeof s !== "string") return fallback;
  const d = new Date(s);
  return isNaN(d.getTime()) ? fallback : d;
}

export default async function TaxPage({ searchParams }: PageProps) {
  const { user } = await getSession();
  if (!user) return null;

  const scope = toAuthScope(user);
  const clientIdClause = clientIdWhere(scope);
  const clientWhereClause = clientWhere(scope);

  const raw = await searchParams;
  const now = new Date();
  const defaultFrom = new Date(now.getFullYear() - 1, 2, 1); // 1 Mar last year
  const defaultTo = new Date(now.getFullYear(), 1, 28);       // 28 Feb this year

  const from = parseDate(raw.from as string, defaultFrom);
  from.setHours(0, 0, 0, 0);
  const to = parseDate(raw.to as string, defaultTo);
  to.setHours(23, 59, 59, 999);

  const fromStr = from.toISOString().slice(0, 10);
  const toStr = to.toISOString().slice(0, 10);

  const [payments, invoices, clients] = await Promise.all([
    // Payments received in the period
    prisma.payment.findMany({
      where: { ...clientIdClause, paidAt: { gte: from, lte: to } },
      select: { id: true, amount: true, paidAt: true, clientId: true, method: true, reference: true },
      orderBy: { paidAt: "asc" },
    }),
    // Invoices issued in the period
    prisma.invoice.findMany({
      where: {
        ...clientIdClause,
        issueDate: { gte: from, lte: to },
        status: { not: "VOID" },
      },
      select: {
        id: true,
        invoiceNumber: true,
        issueDate: true,
        dueDate: true,
        totalAmount: true,
        status: true,
        clientId: true,
        allocations: { select: { allocatedAmount: true } },
      },
      orderBy: { issueDate: "asc" },
    }),
    // All clients for name lookup
    prisma.client.findMany({
      where: clientWhereClause,
      select: { id: true, companyName: true },
    }),
  ]);

  const clientMap = new Map(clients.map((c) => [c.id, c.companyName]));

  // Revenue collected (payments)
  const totalCollected = payments.reduce((s, p) => s + toNum(p.amount), 0);

  // Revenue invoiced (invoices issued)
  const totalInvoiced = invoices.reduce((s, i) => s + toNum(i.totalAmount), 0);
  const totalOutstanding = invoices
    .filter((i) => i.status === "SENT" || i.status === "OVERDUE")
    .reduce((s, i) => s + toNum(i.totalAmount), 0);

  // Per-client breakdown
  const clientStats = new Map<string, { invoiced: number; collected: number; name: string }>();

  for (const inv of invoices) {
    const existing = clientStats.get(inv.clientId) ?? { invoiced: 0, collected: 0, name: clientMap.get(inv.clientId) ?? inv.clientId };
    existing.invoiced += toNum(inv.totalAmount);
    clientStats.set(inv.clientId, existing);
  }
  for (const p of payments) {
    const existing = clientStats.get(p.clientId) ?? { invoiced: 0, collected: 0, name: clientMap.get(p.clientId) ?? p.clientId };
    existing.collected += toNum(p.amount);
    clientStats.set(p.clientId, existing);
  }

  const clientRows = Array.from(clientStats.values()).sort((a, b) => b.collected - a.collected);

  // Monthly breakdown of payments
  const monthMap = new Map<string, number>();
  for (const p of payments) {
    const key = p.paidAt.toLocaleDateString("en-ZA", { month: "short", year: "2-digit" });
    monthMap.set(key, (monthMap.get(key) ?? 0) + toNum(p.amount));
  }
  const monthlyData = Array.from(monthMap.entries()).map(([month, amount]) => ({ month, amount }));
  const maxBar = Math.max(...monthlyData.map((m) => m.amount), 1);

  const periodLabel = `${from.toLocaleDateString("en-ZA", { dateStyle: "medium" })} – ${to.toLocaleDateString("en-ZA", { dateStyle: "medium" })}`;

  return (
    <section className="py-10">
      <div className="mb-6">
        <Breadcrumbs items={[{ label: "Hub", href: "/hub" }, { label: "Tax" }]} />
      </div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tax Tool</h1>
          <p className="mt-1 text-sm text-(--hub-muted)">{periodLabel}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Period selector */}
        <TaxRangeFilter currentFrom={fromStr} currentTo={toStr} />

        {/* KPI summary */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-(--hub-border-light) bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-(--hub-muted)">Total invoiced</p>
            <p className="mt-2 text-2xl font-bold text-(--hub-text)">{fmt(totalInvoiced)}</p>
            <p className="mt-1 text-xs text-(--hub-muted)">Invoices issued in period (excl. voided)</p>
          </div>
          <div className="rounded-xl border border-(--hub-border-light) bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-(--hub-muted)">Total collected</p>
            <p className="mt-2 text-2xl font-bold text-green-600">{fmt(totalCollected)}</p>
            <p className="mt-1 text-xs text-(--hub-muted)">Payments received in period</p>
          </div>
          <div className="rounded-xl border border-(--hub-border-light) bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-(--hub-muted)">Still outstanding</p>
            <p className={`mt-2 text-2xl font-bold ${totalOutstanding > 0 ? "text-amber-600" : "text-(--hub-text)"}`}>
              {fmt(totalOutstanding)}
            </p>
            <p className="mt-1 text-xs text-(--hub-muted)">Sent/overdue invoices from this period</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Per-client breakdown */}
          <div className="rounded-xl border border-(--hub-border-light) bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-(--hub-text)">Revenue by client</h2>
            <p className="mt-1 text-xs text-(--hub-muted)">Based on invoices issued in period</p>
            {clientRows.length === 0 ? (
              <p className="mt-4 text-sm text-(--hub-muted)">No data for this period.</p>
            ) : (
              <table className="mt-4 w-full text-sm">
                <thead>
                  <tr className="border-b border-(--hub-border-light) text-xs font-medium text-(--hub-muted)">
                    <th className="pb-2 text-left">Client</th>
                    <th className="pb-2 text-right">Invoiced</th>
                    <th className="pb-2 text-right">Collected</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--hub-border-light)">
                  {clientRows.map((row) => (
                    <tr key={row.name}>
                      <td className="py-2 font-medium text-(--hub-text)">{row.name}</td>
                      <td className="py-2 text-right text-(--hub-muted)">{fmt(row.invoiced)}</td>
                      <td className="py-2 text-right font-medium text-(--hub-text)">{fmt(row.collected)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-(--hub-border-light) font-semibold">
                    <td className="pt-2 text-(--hub-text)">Total</td>
                    <td className="pt-2 text-right text-(--hub-muted)">{fmt(totalInvoiced)}</td>
                    <td className="pt-2 text-right text-(--hub-text)">{fmt(totalCollected)}</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>

          {/* Monthly payments bar chart */}
          <div className="rounded-xl border border-(--hub-border-light) bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-(--hub-text)">Monthly collections</h2>
            <p className="mt-1 text-xs text-(--hub-muted)">Payments received per month</p>
            {monthlyData.length === 0 ? (
              <p className="mt-4 text-sm text-(--hub-muted)">No payments in this period.</p>
            ) : (
              <div className="mt-4 flex items-end gap-2">
                {monthlyData.map((m) => {
                  const ratio = m.amount / maxBar;
                  const barPx = m.amount <= 0 ? 0 : Math.max(6, Math.round(ratio * 120));
                  return (
                    <div key={m.month} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                      <div className="flex w-full flex-col items-center justify-end" style={{ height: 120 }}>
                        <div
                          className="w-full rounded-t-md bg-green-500/25"
                          style={{ height: barPx }}
                          title={`${m.month}: ${fmt(m.amount)}`}
                        />
                      </div>
                      <span className="text-[10px] text-(--hub-muted)">{m.month}</span>
                      <span className="text-[10px] font-medium text-(--hub-text)">
                        {m.amount >= 1000
                          ? `R${(m.amount / 1000).toFixed(1)}k`
                          : `R${m.amount.toFixed(0)}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Invoice list */}
        <div className="rounded-xl border border-(--hub-border-light) bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-(--hub-text)">Invoices in period</h2>
          <p className="mt-1 text-xs text-(--hub-muted)">{invoices.length} invoice{invoices.length !== 1 ? "s" : ""} issued</p>
          {invoices.length === 0 ? (
            <p className="mt-4 text-sm text-(--hub-muted)">No invoices issued in this period.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="hub-table min-w-[600px]">
                <thead>
                  <tr>
                    <th>Number</th>
                    <th>Client</th>
                    <th>Issue date</th>
                    <th>Due date</th>
                    <th className="text-right">Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="font-medium">{inv.invoiceNumber}</td>
                      <td className="text-(--hub-muted)">{clientMap.get(inv.clientId) ?? "—"}</td>
                      <td className="text-(--hub-muted)">{inv.issueDate.toLocaleDateString("en-ZA", { dateStyle: "medium" })}</td>
                      <td className="text-(--hub-muted)">{inv.dueDate.toLocaleDateString("en-ZA", { dateStyle: "medium" })}</td>
                      <td className="text-right font-medium">{fmt(toNum(inv.totalAmount))}</td>
                      <td>
                        <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                          inv.status === "PAID" ? "bg-green-100 text-green-700"
                          : inv.status === "OVERDUE" ? "bg-red-100 text-red-700"
                          : inv.status === "SENT" ? "bg-amber-100 text-amber-700"
                          : "bg-black/5 text-(--hub-muted)"
                        }`}>{inv.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Turnover summary box — copy-paste ready for CIPC/SARS */}
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
          <h2 className="text-sm font-semibold text-blue-900">Filing summary</h2>
          <p className="mt-1 text-xs text-blue-700">Use these figures for CIPC annual returns or SARS submissions.</p>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2 text-sm">
            <div>
              <dt className="font-medium text-blue-800">Estimated turnover (invoiced basis)</dt>
              <dd className="mt-0.5 text-xl font-bold text-blue-900">{fmt(totalInvoiced)}</dd>
              <dd className="text-xs text-blue-600">Total value of invoices issued {periodLabel}</dd>
            </div>
            <div>
              <dt className="font-medium text-blue-800">Estimated turnover (cash basis)</dt>
              <dd className="mt-0.5 text-xl font-bold text-blue-900">{fmt(totalCollected)}</dd>
              <dd className="text-xs text-blue-600">Total payments received {periodLabel}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
