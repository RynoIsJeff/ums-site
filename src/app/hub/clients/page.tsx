import Link from "next/link";
import { getSession } from "@/lib/auth";
import { toAuthScope } from "@/lib/auth";
import { clientWhere } from "@/lib/rbac";
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

  const where: Parameters<typeof prisma.client.findMany>[0]["where"] = {
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--hub-text)]">
            Clients
          </h1>
          <p className="mt-2 text-sm text-[var(--hub-muted)]">
            {user.role === "ADMIN"
              ? "All clients (admin view)."
              : `You have access to ${total} client(s).`}
          </p>
        </div>
        <Link
          href="/hub/clients/new"
          className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          New client
        </Link>
      </div>

      <div className="mt-6">
        <ClientsListFilters params={params} basePath={BASE_PATH} />
      </div>

      <ul className="mt-6 space-y-3">
        {clients.length === 0 ? (
          <li className="rounded-lg border border-[var(--hub-border-light)] bg-white p-4 text-sm text-[var(--hub-muted)]">
            No clients match your filters.
          </li>
        ) : (
          clients.map((client) => (
            <li key={client.id}>
              <Link
                href={`/hub/clients/${client.id}`}
                className="block rounded-lg border border-[var(--hub-border-light)] bg-white p-4 transition hover:border-black/25 hover:bg-black/2"
              >
                <div className="font-medium text-[var(--hub-text)]">
                  {client.companyName}
                </div>
                <div className="mt-1 text-sm text-[var(--hub-muted)]">
                  {client.contactPerson}
                  {client.email ? ` · ${client.email}` : ""}
                </div>
                <div className="mt-1 text-xs text-[var(--hub-muted)]">
                  {client.status}
                </div>
              </Link>
            </li>
          ))
        )}
      </ul>

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
