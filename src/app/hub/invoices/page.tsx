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
import { StatusBadge } from "@/app/hub/_components/StatusBadge";
import { toNum } from "@/lib/utils";

export const metadata = {
  title: "Invoices | UMS Hub",
};

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
        <table className="hub-table min-w-[600px]">
          <thead>
            <tr>
              <th>Number</th>
              <th>Client</th>
              <th>Due date</th>
              <th>Amount</th>
              <th>Status</th>
              <th aria-label="Actions" />
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
                <tr key={inv.id}>
                  <td>
                    <Link
                      href={`/hub/invoices/${inv.id}`}
                      className="font-medium text-[var(--hub-text)] hover:underline"
                    >
                      {inv.invoiceNumber}
                    </Link>
                  </td>
                  <td>
                    <Link
                      href={`/hub/clients/${inv.client.id}`}
                      className="text-[var(--hub-muted)] hover:underline"
                    >
                      {inv.client.companyName}
                    </Link>
                  </td>
                  <td className="text-[var(--hub-text)]">
                    {inv.dueDate.toLocaleDateString("en-ZA", {
                      dateStyle: "medium",
                    })}
                  </td>
                  <td className="text-[var(--hub-text)]">
                    R {toNum(inv.totalAmount).toLocaleString("en-ZA")}
                  </td>
                  <td>
                    <StatusBadge status={inv.status} />
                  </td>
                  <td>
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
