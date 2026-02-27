import Link from "next/link";
import { CheckSquare, FilePlus } from "lucide-react";
import { getSession } from "@/lib/auth";
import { EmptyState } from "@/app/hub/_components/EmptyState";
import { toAuthScope } from "@/lib/auth";
import { clientWhere, taskWhere } from "@/lib/rbac";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Pagination } from "@/app/hub/_components/Pagination";
import { TasksListFilters } from "./_components/TasksListFilters";
import {
  parseListParams,
  paramsForPagination,
} from "@/app/hub/_lib/listParams";
import { StatusBadge } from "@/app/hub/_components/StatusBadge";

export const metadata = {
  title: "Tasks | UMS Hub",
};

const BASE_PATH = "/hub/tasks";

export default async function HubTasksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { user } = await getSession();
  if (!user) return null;

  const raw = await searchParams;
  const params = parseListParams(raw as Record<string, string | undefined>);

  const scope = toAuthScope(user);
  const scopeWhere = taskWhere(scope) as Prisma.TaskWhereInput;

  const where: Prisma.TaskWhereInput = {
    ...scopeWhere,
  };

  if (params.status) {
    where.status = params.status as "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";
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

  const [tasks, total, clients] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy: [
        { status: "asc" },
        { dueDate: "asc" },
        { createdAt: "desc" },
      ],
      include: {
        client: { select: { id: true, companyName: true } },
        occurrences: {
          where: { status: "PENDING" },
          orderBy: { dueDate: "asc" },
          take: 1,
        },
      },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
    prisma.task.count({ where }),
    prisma.client.findMany({
      where: clientWhere(scope),
      orderBy: { companyName: "asc" },
      select: { id: true, companyName: true },
    }),
  ]);

  return (
    <section className="py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-(--hub-text)">
            Tasks
          </h1>
          <p className="mt-2 text-sm text-(--hub-muted)">
            Create and manage tasks. Use recurrence for repeating tasks.
          </p>
        </div>
        <Link
          href="/hub/tasks/new"
          className="rounded-md bg-(--primary) px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          New task
        </Link>
      </div>

      <div className="mt-6">
        <TasksListFilters
          params={params}
          basePath={BASE_PATH}
          clients={clients}
        />
      </div>

      {tasks.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={CheckSquare}
            title="No tasks found"
            description="No tasks match your filters. Try adjusting your search or filter criteria."
            primaryAction={{ href: "/hub/tasks/new", label: "New task", icon: FilePlus }}
          />
        </div>
      ) : (
      <div className="mt-6 overflow-x-auto">
        <table className="hub-table min-w-[600px]">
          <thead>
            <tr>
              <th>Title</th>
              <th>Client</th>
              <th>Due</th>
              <th>Status</th>
              <th>Recurrence</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td>
                    <Link
                      href={`/hub/tasks/${task.id}`}
                      className="font-medium text-(--hub-text) hover:underline"
                    >
                      {task.title}
                    </Link>
                  </td>
                  <td className="p-3">
                    {task.client ? (
                      <Link
                        href={`/hub/clients/${task.client.id}`}
                        className="text-(--hub-muted) hover:underline"
                      >
                        {task.client.companyName}
                      </Link>
                    ) : (
                      <span className="text-(--hub-muted)">—</span>
                    )}
                  </td>
                  <td className="p-3 text-(--hub-text)">
                    {task.dueDate
                      ? task.dueDate.toLocaleDateString("en-ZA", {
                          dateStyle: "medium",
                        })
                      : task.occurrences[0]
                        ? task.occurrences[0].dueDate.toLocaleDateString(
                            "en-ZA",
                            { dateStyle: "medium" }
                          )
                        : "—"}
                  </td>
                  <td className="p-3">
                    <span
                      className={
                        task.status === "DONE"
                          ? "text-green-600"
                          : task.status === "IN_PROGRESS"
                            ? "text-amber-600"
                            : "text-(--hub-muted)"
                      }
                    >
                      {task.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-3">
                    {task.recurrencePattern === "NONE" ? (
                      <span className="text-(--hub-muted)">—</span>
                    ) : (
                      <span className="text-(--hub-muted)">
                        {task.recurrencePattern} every {task.recurrenceInterval}
                      </span>
                    )}
                  </td>
                  <td>
                    <Link
                      href={`/hub/tasks/${task.id}/edit`}
                      className="text-(--hub-muted) hover:underline"
                    >
                      Edit
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
