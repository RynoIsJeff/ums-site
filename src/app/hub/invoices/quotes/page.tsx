import Link from "next/link";
import { FileSignature, FilePlus } from "lucide-react";
import { getSession, toAuthScope } from "@/lib/auth";
import { Breadcrumbs } from "@/app/hub/_components/Breadcrumbs";
import { EmptyState } from "@/app/hub/_components/EmptyState";
import { clientIdWhere, clientWhere } from "@/lib/rbac";
import { QuoteStatus, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Pagination } from "@/app/hub/_components/Pagination";
import {
  parseListParams,
  paramsForPagination,
} from "@/app/hub/_lib/listParams";
import { BillingDocTabs } from "../_components/BillingDocTabs";
import { QuotesListFilters } from "./_components/QuotesListFilters";
import { QuotesTable } from "./_components/QuotesTable";

export const metadata = {
  title: "Quotes | UMS Hub",
};

const BASE_PATH = "/hub/invoices/quotes";

export default async function HubQuotesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { user } = await getSession();
  if (!user) return null;

  const raw = await searchParams;
  const params = parseListParams(raw as Record<string, string | undefined>);

  const scope = toAuthScope(user);
  const where: Prisma.QuoteWhereInput = { ...clientIdWhere(scope) };

  if (params.search) {
    where.quoteNumber = { contains: params.search, mode: "insensitive" };
  }

  if (params.status && params.status in QuoteStatus) {
    where.status = params.status as QuoteStatus;
  }

  if (params.clientId) {
    where.clientId = params.clientId;
  }

  if (params.dateFrom || params.dateTo) {
    where.validUntil = {
      ...(params.dateFrom && { gte: new Date(params.dateFrom) }),
      ...(params.dateTo && { lte: new Date(params.dateTo) }),
    };
  }

  const [quotes, total, clients] = await Promise.all([
    prisma.quote.findMany({
      where,
      orderBy: [{ status: "asc" }, { validUntil: "desc" }],
      include: { client: { select: { id: true, companyName: true } } },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
    prisma.quote.count({ where }),
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
          { label: "Invoices", href: "/hub/invoices" },
          { label: "Quotes" },
        ]}
        className="mb-6"
      />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-(--hub-text)">
            Quotes
          </h1>
          <p className="mt-2 text-sm text-(--hub-muted)">
            Quote a client before the work starts. Once a quote is accepted, turn
            it into a draft invoice in one click.
          </p>
        </div>
        <Link
          href="/hub/invoices/quotes/new"
          className="rounded-md bg-(--primary) px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          New quote
        </Link>
      </div>

      <BillingDocTabs active="quotes" className="mt-6" />

      <div className="mt-6">
        <QuotesListFilters params={params} basePath={BASE_PATH} clients={clients} />
      </div>

      {quotes.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={FileSignature}
            title="No quotes found"
            description="No quotes match your filters. Create a quote to send a client pricing before invoicing."
            primaryAction={{
              href: "/hub/invoices/quotes/new",
              label: "New quote",
              icon: FilePlus,
            }}
          />
        </div>
      ) : (
        <div className="mt-6">
          <QuotesTable
            quotes={quotes.map((q) => ({ ...q, totalAmount: String(q.totalAmount) }))}
          />
        </div>
      )}

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
