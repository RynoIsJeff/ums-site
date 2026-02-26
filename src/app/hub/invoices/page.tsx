import Link from "next/link";
import { getSession } from "@/lib/auth";
import { Breadcrumbs } from "@/app/hub/_components/Breadcrumbs";
import { toAuthScope } from "@/lib/auth";
import { clientIdWhere, clientWhere } from "@/lib/rbac";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Pagination } from "@/app/hub/_components/Pagination";
import { InvoicesListFilters } from "./_components/InvoicesListFilters";
import {
  parseListParams,
  paramsForPagination,
} from "@/app/hub/_lib/listParams";

export const metadata = {
  title: "Invoices | UMS Hub",
};

function toNum(d: unknown): number {
  if (d == null) return 0;
  if (typeof d === "number" && !Number.isNaN(d)) return d;
  return Number(d) || 0;
}

const BASE_PATH = "/hub/invoices";

export default async function HubInvoicesPage({
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

  const where: Prisma.InvoiceWhereInput = {
    ...scopeWhere,
  };

  if (params.search) {
    where.invoiceNumber = { contains: params.search, mode: "insensitive" };
  }

  if (params.status) {
    where.status = params.status as "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "VOID";
  }

  if (params.clientId) {
    where.clientId = params.clientId;
  }

  if (params.dateFrom || params.dateTo) {
    where.dueDate = {
      ...(params.dateFrom && { gte: new Date(params.dateFrom) }),
      ...(params.dateTo && { lte: new Date(params.dateTo) }),
    };
  }

  const [invoices, total, clients] = await Promise.all([
    prisma.invoice.findMany({
      where,
      orderBy: [{ status: "asc" }, { dueDate: "desc" }],
      include: { client: { select: { id: true, companyName: true } } },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
    prisma.invoice.count({ where }),
    prisma.client.findMany({
      where: clientWhere(scope),
      orderBy: { companyName: "asc" },
      select: { id: true, companyName: true },
    }),
  ]);

  return (
    <section className="py-10">
      <Breadcrumbs
        items={[
          { label: "Hub", href: "/hub" },
          { label: "Invoices" },
        ]}
        className="mb-6"
      />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--hub-text)]">
            Invoices
          </h1>
          <p className="mt-2 text-sm text-[var(--hub-muted)]">
            Create and manage invoices. Drafts can be edited; mark as Sent when
            ready.
          </p>
        </div>
        <Link
          href="/hub/invoices/new"
          className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          New invoice
        </Link>
      </div>

      <div className="mt-6">
        <InvoicesListFilters
          params={params}
          basePath={BASE_PATH}
          clients={clients}
        />
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse rounded-xl border border-[var(--hub-border-light)] bg-white text-sm">
          <thead>
            <tr className="border-b border-[var(--hub-border-light)] text-left">
              <th className="p-3 font-medium text-[var(--hub-text)]">Number</th>
              <th className="p-3 font-medium text-[var(--hub-text)]">Client</th>
              <th className="p-3 font-medium text-[var(--hub-text)]">Due date</th>
              <th className="p-3 font-medium text-[var(--hub-text)]">Amount</th>
              <th className="p-3 font-medium text-[var(--hub-text)]">Status</th>
              <th className="p-3 font-medium" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-6 text-center text-[var(--hub-muted)]"
                >
                  No invoices match your filters.
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-b border-black/5 hover:bg-black/[0.02]"
                >
                  <td className="p-3">
                    <Link
                      href={`/hub/invoices/${inv.id}`}
                      className="font-medium text-[var(--hub-text)] hover:underline"
                    >
                      {inv.invoiceNumber}
                    </Link>
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/hub/clients/${inv.client.id}`}
                      className="text-[var(--hub-muted)] hover:underline"
                    >
                      {inv.client.companyName}
                    </Link>
                  </td>
                  <td className="p-3 text-[var(--hub-text)]">
                    {inv.dueDate.toLocaleDateString("en-ZA", {
                      dateStyle: "medium",
                    })}
                  </td>
                  <td className="p-3 text-[var(--hub-text)]">
                    R {toNum(inv.totalAmount).toLocaleString("en-ZA")}
                  </td>
                  <td className="p-3">
                    <span
                      className={
                        inv.status === "PAID"
                          ? "text-green-600"
                          : inv.status === "OVERDUE"
                            ? "text-red-600"
                            : inv.status === "SENT"
                              ? "text-amber-600"
                              : "text-[var(--hub-muted)]"
                      }
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/hub/invoices/${inv.id}/print`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--hub-muted)] hover:underline"
                    >
                      Print
                    </Link>
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
    </section>
  );
}
