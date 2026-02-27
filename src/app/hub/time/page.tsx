import Link from "next/link";
import { Clock, Plus } from "lucide-react";
import { getSession } from "@/lib/auth";
import { EmptyState } from "@/app/hub/_components/EmptyState";
import { toAuthScope } from "@/lib/auth";
import { clientWhere, clientIdWhere } from "@/lib/rbac";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Pagination } from "@/app/hub/_components/Pagination";
import { TimeListFilters } from "./_components/TimeListFilters";
import { LogTimeForm } from "./_components/LogTimeForm";
import { createTimeEntry } from "./actions";
import {
  parseListParams,
  paramsForPagination,
} from "@/app/hub/_lib/listParams";
import { toNum } from "@/lib/utils";

export const metadata = {
  title: "Time | UMS Hub",
};

const BASE_PATH = "/hub/time";

export default async function HubTimePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { user } = await getSession();
  if (!user) return null;

  const raw = await searchParams;
  const params = parseListParams(raw as Record<string, string | undefined>);

  const scope = toAuthScope(user);
  const clientWhereClause = clientWhere(scope);
  const timeWhere = clientIdWhere(scope) as Prisma.TimeEntryWhereInput;

  const where: Prisma.TimeEntryWhereInput = { ...timeWhere };

  if (params.clientId) {
    where.clientId = params.clientId;
  }

  if (params.dateFrom || params.dateTo) {
    where.date = {
      ...(params.dateFrom && { gte: new Date(params.dateFrom) }),
      ...(params.dateTo && { lte: new Date(params.dateTo) }),
    };
  }

  const [entries, total, clients, tasks] = await Promise.all([
    prisma.timeEntry.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        client: { select: { id: true, companyName: true } },
        user: { select: { id: true, name: true, email: true } },
        task: { select: { id: true, title: true } },
      },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
    prisma.timeEntry.count({ where }),
    prisma.client.findMany({
      where: clientWhereClause,
      orderBy: { companyName: "asc" },
      select: { id: true, companyName: true },
    }),
    prisma.task.findMany({
      where: {
        clientId: { in: clients.map((c) => c.id) },
      } as Prisma.TaskWhereInput,
      orderBy: { title: "asc" },
      select: { id: true, title: true, clientId: true },
      take: 200,
    }),
  ]);

  return (
    <section className="py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-(--hub-text)">
            Time
          </h1>
          <p className="mt-2 text-sm text-(--hub-muted)">
            Log and track billable hours by client.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-medium text-(--hub-text) mb-3">Log time</h2>
        <LogTimeForm
          clients={clients}
          tasks={tasks}
          action={createTimeEntry}
        />
      </div>

      <div className="mt-8">
        <TimeListFilters
          params={params}
          basePath={BASE_PATH}
          clients={clients}
        />
      </div>

      {entries.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Clock}
            title="No time entries"
            description="Log your first time entry above or adjust your filters."
            primaryAction={{ href: "/hub/time", label: "Log time", icon: Plus }}
          />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="hub-table min-w-[600px]">
            <thead>
              <tr>
                <th>Date</th>
                <th>Client</th>
                <th>Description</th>
                <th>Task</th>
                <th>User</th>
                <th>Hours</th>
                <th>Billable</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id}>
                  <td className="p-3 text-(--hub-text)">
                    {e.date.toLocaleDateString("en-ZA", { dateStyle: "medium" })}
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/hub/clients/${e.client.id}`}
                      className="text-(--hub-muted) hover:underline"
                    >
                      {e.client.companyName}
                    </Link>
                  </td>
                  <td className="p-3 text-(--hub-text) max-w-xs truncate">
                    {e.description}
                  </td>
                  <td className="p-3 text-(--hub-muted)">
                    {e.task ? (
                      <Link
                        href={`/hub/tasks/${e.task.id}`}
                        className="hover:underline"
                      >
                        {e.task.title}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="p-3 text-(--hub-muted)">
                    {e.user.name ?? e.user.email}
                  </td>
                  <td className="p-3 text-(--hub-text)">
                    {toNum(e.hours)}h
                  </td>
                  <td className="p-3">
                    {e.billable ? (
                      <span className="text-green-600">Yes</span>
                    ) : (
                      <span className="text-(--hub-muted)">No</span>
                    )}
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
