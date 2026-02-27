import Link from "next/link";
import { FileSignature, FilePlus } from "lucide-react";
import { getSession } from "@/lib/auth";
import { Breadcrumbs } from "@/app/hub/_components/Breadcrumbs";
import { EmptyState } from "@/app/hub/_components/EmptyState";
import { toAuthScope } from "@/lib/auth";
import { clientWhere } from "@/lib/rbac";
import { clientIdWhere } from "@/lib/rbac";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Pagination } from "@/app/hub/_components/Pagination";
import {
  parseListParams,
  paramsForPagination,
} from "@/app/hub/_lib/listParams";

export const metadata = {
  title: "Proposals | UMS Hub",
};

const BASE_PATH = "/hub/proposals";

const statusColors: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-800",
  SENT: "bg-amber-100 text-amber-800",
  SIGNED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

export default async function HubProposalsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { user } = await getSession();
  if (!user) return null;

  const raw = await searchParams;
  const params = parseListParams(raw as Record<string, string | undefined>);

  const scope = toAuthScope(user);
  const where = {
    ...(clientIdWhere(scope) as Prisma.ProposalWhereInput),
  };

  if (params.status) {
    where.status = params.status as "DRAFT" | "SENT" | "SIGNED" | "REJECTED";
  }

  if (params.clientId) {
    where.clientId = params.clientId;
  }

  const [proposals, total, clients] = await Promise.all([
    prisma.proposal.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        client: { select: { id: true, companyName: true } },
      },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
    prisma.proposal.count({ where }),
    prisma.client.findMany({
      where: clientWhere(scope),
      orderBy: { companyName: "asc" },
      select: { id: true, companyName: true },
    }),
  ]);

  return (
    <section className="py-10">
      <Breadcrumbs
        items={[{ label: "Hub", href: "/hub" }, { label: "Proposals" }]}
        className="mb-6"
      />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-(--hub-text)">
            Proposals
          </h1>
          <p className="mt-2 text-sm text-(--hub-muted)">
            Create, send and track proposals and contracts.
          </p>
        </div>
        <Link
          href="/hub/proposals/new"
          className="rounded-md bg-(--primary) px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          New proposal
        </Link>
      </div>

      <div className="mt-6">
        <form method="get" action={BASE_PATH} className="flex flex-wrap gap-4">
          <input type="hidden" name="page" value="1" />
          <div>
            <label htmlFor="proposals-status" className="sr-only">Status</label>
            <select
              id="proposals-status"
              name="status"
              className="rounded-md border border-(--hub-border) px-3 py-2 text-sm"
              defaultValue={params.status ?? ""}
            >
              <option value="">All statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="SIGNED">Signed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <div>
            <label htmlFor="proposals-clientId" className="sr-only">Client</label>
            <select
              id="proposals-clientId"
              name="clientId"
              className="rounded-md border border-(--hub-border) px-3 py-2 text-sm"
              defaultValue={params.clientId ?? ""}
            >
              <option value="">All clients</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.companyName}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="rounded-md border border-(--hub-border) px-3 py-2 text-sm hover:bg-(--hub-bg)"
          >
            Filter
          </button>
        </form>
      </div>

      {proposals.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={FileSignature}
            title="No proposals"
            description="Create your first proposal to get started."
            primaryAction={{ href: "/hub/proposals/new", label: "New proposal", icon: FilePlus }}
          />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="hub-table min-w-[600px]">
            <thead>
              <tr>
                <th>Title</th>
                <th>Client</th>
                <th>Status</th>
                <th>Sent</th>
                <th>Signed</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {proposals.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link
                      href={`/hub/proposals/${p.id}`}
                      className="font-medium text-(--hub-text) hover:underline"
                    >
                      {p.title}
                    </Link>
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/hub/clients/${p.client.id}`}
                      className="text-(--hub-muted) hover:underline"
                    >
                      {p.client.companyName}
                    </Link>
                  </td>
                  <td className="p-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[p.status] ?? "bg-slate-100"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3 text-(--hub-muted)">
                    {p.sentAt ? p.sentAt.toLocaleDateString("en-ZA", { dateStyle: "medium" }) : "—"}
                  </td>
                  <td className="p-3 text-(--hub-muted)">
                    {p.signedAt ? p.signedAt.toLocaleDateString("en-ZA", { dateStyle: "medium" }) : "—"}
                  </td>
                  <td>
                    <Link
                      href={`/hub/proposals/${p.id}`}
                      className="text-(--hub-muted) hover:underline"
                    >
                      {p.status === "DRAFT" ? "Edit" : "View"}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
