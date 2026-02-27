import Link from "next/link";
import { Suspense } from "react";
import { Users, UserPlus } from "lucide-react";
import { getSession } from "@/lib/auth";
import { Breadcrumbs } from "@/app/hub/_components/Breadcrumbs";
import { EmptyState } from "@/app/hub/_components/EmptyState";
import { SuccessBanner } from "@/app/hub/_components/SuccessBanner";
import { StatusBadge } from "@/app/hub/_components/StatusBadge";
import { toAuthScope } from "@/lib/auth";
import { clientWhere } from "@/lib/rbac";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Pagination } from "@/app/hub/_components/Pagination";
import { ClientsListFilters } from "./_components/ClientsListFilters";
import {
  parseListParams,
  paramsForPagination,
} from "@/app/hub/_lib/listParams";

export const metadata = {
  title: "Clients | UMS Hub",
};

const BASE_PATH = "/hub/clients";

export default async function HubClientsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { user } = await getSession();
  if (!user) return null;

  const raw = await searchParams;
  const params = parseListParams(raw as Record<string, string | undefined>);

  const scope = toAuthScope(user);
  const scopeWhere = clientWhere(scope);

  const where: Prisma.ClientWhereInput = {
    ...scopeWhere,
  };

  if (params.search) {
    where.OR = [
      { companyName: { contains: params.search, mode: "insensitive" } },
      { contactPerson: { contains: params.search, mode: "insensitive" } },
      { email: { contains: params.search, mode: "insensitive" } },
    ];
  }

  if (params.status) {
    where.status = params.status as "LEAD" | "ACTIVE" | "PAUSED" | "CHURNED";
  }

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      orderBy: { companyName: "asc" },
      select: {
        id: true,
        companyName: true,
        contactPerson: true,
        email: true,
        status: true,
      },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
    prisma.client.count({ where }),
  ]);

  return (
    <section className="py-10">
      <Breadcrumbs
        items={[
          { label: "Hub", href: "/hub" },
          { label: "Clients" },
        ]}
        className="mb-6"
      />
      <Suspense fallback={null}>
        <SuccessBanner message="Client created successfully." />
      </Suspense>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-(--hub-text)">
            Clients
          </h1>
          <p className="mt-2 text-sm text-(--hub-muted)">
            {user.role === "ADMIN"
              ? "All clients (admin view)."
              : `You have access to ${total} client(s).`}
          </p>
        </div>
        <Link
          href="/hub/clients/new"
          className="rounded-md bg-(--primary) px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          New client
        </Link>
      </div>

      <div className="mt-6">
        <ClientsListFilters params={params} basePath={BASE_PATH} />
      </div>

      {clients.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Users}
            title="No clients found"
            description="No clients match your filters. Try adjusting your search or filter criteria."
            primaryAction={{ href: "/hub/clients/new", label: "Add client", icon: UserPlus }}
          />
        </div>
      ) : (
      <ul className="mt-6 space-y-3">
          {clients.map((client) => (
            <li key={client.id}>
              <Link
                href={`/hub/clients/${client.id}`}
                className="block rounded-lg border border-(--hub-border-light) bg-white p-4 transition hover:border-black/25 hover:bg-black/2"
              >
                <div className="font-medium text-(--hub-text)">
                  {client.companyName}
                </div>
                <div className="mt-1 text-sm text-(--hub-muted)">
                  {client.contactPerson}
                  {client.email ? ` · ${client.email}` : ""}
                </div>
                <div className="mt-2">
                  <StatusBadge status={client.status} />
                </div>
              </Link>
            </li>
          ))}
      </ul>
      )}

      <Pagination
        totalItems={total}
        currentPage={params.page}
        pageSize={params.pageSize}
        basePath={BASE_PATH}
        searchParams={paramsForPagination(params) as Record<string, string | undefined>}
      />
    </section>
  );
}
