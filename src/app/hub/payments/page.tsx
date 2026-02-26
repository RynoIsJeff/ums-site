import Link from "next/link";
import { getSession } from "@/lib/auth";
import { toAuthScope } from "@/lib/auth";
import { clientIdWhere, clientWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { RecordPaymentFormStandalone } from "./_components/RecordPaymentFormStandalone";
import { Pagination } from "@/app/hub/_components/Pagination";
import { PaymentsListFilters } from "./_components/PaymentsListFilters";
import {
  parseListParams,
  paramsForPagination,
} from "@/app/hub/_lib/listParams";

export const metadata = {
  title: "Payments | UMS Hub",
};

function toNum(d: unknown): number {
  if (d == null) return 0;
  if (typeof d === "number" && !Number.isNaN(d)) return d;
  return Number(d) || 0;
}

const BASE_PATH = "/hub/payments";

export default async function HubPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { user } = await getSession();
  if (!user) return null;

  const raw = await searchParams;
  const params = parseListParams(raw as Record<string, string | undefined>);

  const scope = toAuthScope(user);
  const scopeWhere = clientIdWhere(scope);

  const where: Parameters<typeof prisma.payment.findMany>[0]["where"] = {
    ...scopeWhere,
  };

  if (params.clientId) {
    where.clientId = params.clientId;
  }

  if (params.dateFrom || params.dateTo) {
    where.paidAt = {};
    if (params.dateFrom) {
      (where.paidAt as { gte?: Date }).gte = new Date(params.dateFrom);
    }
    if (params.dateTo) {
      (where.paidAt as { lte?: Date }).lte = new Date(params.dateTo);
    }
  }

  const [payments, total, clients, unpaidInvoices] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { paidAt: "desc" },
      include: {
        client: { select: { id: true, companyName: true } },
        invoice: { select: { id: true, invoiceNumber: true } },
      },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
    prisma.payment.count({ where }),
    prisma.client.findMany({
      where: clientWhere(scope),
      orderBy: { companyName: "asc" },
      select: { id: true, companyName: true },
    }),
    prisma.invoice.findMany({
      where: { ...scopeWhere, status: { in: ["SENT", "OVERDUE"] } },
      select: { id: true, invoiceNumber: true, clientId: true },
    }),
  ]);

  return (
    <section className="py-10">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--hub-text)]">
            Payments
          </h1>
          <p className="mt-2 text-sm text-[var(--hub-muted)]">
            Record and view payments. Link to an invoice to auto-mark it paid
            when fully settled.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <PaymentsListFilters
          params={params}
          basePath={BASE_PATH}
          clients={clients}
        />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] border-collapse rounded-xl border border-[var(--hub-border-light)] bg-white text-sm">
              <thead>
                <tr className="border-b border-[var(--hub-border-light)] text-left">
                  <th className="p-3 font-medium text-[var(--hub-text)]">Date</th>
                  <th className="p-3 font-medium text-[var(--hub-text)]">Client</th>
                  <th className="p-3 font-medium text-[var(--hub-text)]">Invoice</th>
                  <th className="p-3 font-medium text-[var(--hub-text)]">Method</th>
                  <th className="p-3 font-medium text-[var(--hub-text)]">Amount</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-6 text-center text-[var(--hub-muted)]"
                    >
                      No payments match your filters.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-black/5 hover:bg-black/[0.02]"
                    >
                      <td className="p-3 text-[var(--hub-text)]">
                        {p.paidAt.toLocaleDateString("en-ZA", {
                          dateStyle: "medium",
                        })}
                      </td>
                      <td className="p-3">
                        <Link
                          href={`/hub/clients/${p.client.id}`}
                          className="font-medium text-[var(--hub-text)] hover:underline"
                        >
                          {p.client.companyName}
                        </Link>
                      </td>
                      <td className="p-3">
                        {p.invoice ? (
                          <Link
                            href={`/hub/invoices/${p.invoice.id}`}
                            className="text-[var(--hub-muted)] hover:underline"
                          >
                            {p.invoice.invoiceNumber}
                          </Link>
                        ) : (
                          <span className="text-[var(--hub-muted)]">—</span>
                        )}
                      </td>
                      <td className="p-3 text-[var(--hub-text)]">{p.method}</td>
                      <td className="p-3 text-[var(--hub-text)]">
                        R {toNum(p.amount).toLocaleString("en-ZA")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            totalItems={total}
            currentPage={params.page}
            pageSize={params.pageSize}
            basePath={BASE_PATH}
            searchParams={
              paramsForPagination(params) as Record<string, string | undefined>
            }
          />
        </div>

        <div className="rounded-xl border border-[var(--hub-border-light)] bg-white p-5">
          <h2 className="text-lg font-semibold text-[var(--hub-text)]">
            Record payment
          </h2>
          <RecordPaymentFormStandalone
            clients={clients}
            unpaidInvoices={unpaidInvoices}
          />
        </div>
      </div>
    </section>
  );
}
