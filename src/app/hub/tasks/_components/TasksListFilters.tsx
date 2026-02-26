import type { ListParams } from "@/app/hub/_lib/listParams";
import { TaskStatus } from "@prisma/client";

type Client = { id: string; companyName: string };

type TasksListFiltersProps = {
  params: ListParams;
  basePath: string;
  clients: Client[];
};

export function TasksListFilters({ params, basePath, clients }: TasksListFiltersProps) {
  return (
    <form
      method="get"
      action={basePath}
      className="flex flex-wrap items-end gap-4 rounded-lg border border-[var(--hub-border-light)] bg-white p-4"
    >
      <input type="hidden" name="page" value="1" />
      <div>
        <label htmlFor="tasks-status" className="mb-1 block text-xs font-medium text-[var(--hub-muted)]">
          Status
        </label>
        <select
          id="tasks-status"
          name="status"
          defaultValue={params.status ?? ""}
          className="rounded-md border border-[var(--hub-border-light)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        >
          <option value="">All</option>
          {(Object.keys(TaskStatus) as Array<keyof typeof TaskStatus>).map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="tasks-clientId" className="mb-1 block text-xs font-medium text-[var(--hub-muted)]">
          Client
        </label>
        <select
          id="tasks-clientId"
          name="clientId"
          defaultValue={params.clientId ?? ""}
          className="rounded-md border border-[var(--hub-border-light)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        >
          <option value="">All clients</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.companyName}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="tasks-dateFrom" className="mb-1 block text-xs font-medium text-[var(--hub-muted)]">
          Due from
        </label>
        <input
          id="tasks-dateFrom"
          type="date"
          name="dateFrom"
          defaultValue={params.dateFrom}
          className="rounded-md border border-[var(--hub-border-light)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        />
      </div>
      <div>
        <label htmlFor="tasks-dateTo" className="mb-1 block text-xs font-medium text-[var(--hub-muted)]">
          Due to
        </label>
        <input
          id="tasks-dateTo"
          type="date"
          name="dateTo"
          defaultValue={params.dateTo}
          className="rounded-md border border-[var(--hub-border-light)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        />
      </div>
      <div>
        <label htmlFor="tasks-pageSize" className="mb-1 block text-xs font-medium text-[var(--hub-muted)]">
          Per page
        </label>
        <select
          id="tasks-pageSize"
          name="pageSize"
          defaultValue={params.pageSize}
          className="rounded-md border border-[var(--hub-border-light)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        >
          <option value="25">25</option>
          <option value="50">50</option>
        </select>
      </div>
      <button
        type="submit"
        className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        Apply
      </button>
    </form>
  );
}
