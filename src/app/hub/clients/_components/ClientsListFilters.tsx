import type { ListParams } from "@/app/hub/_lib/listParams";
import { ClientStatus } from "@prisma/client";

type ClientsListFiltersProps = {
  params: ListParams;
  basePath: string;
};

export function ClientsListFilters({ params, basePath }: ClientsListFiltersProps) {
  return (
    <form
      method="get"
      action={basePath}
      className="flex flex-wrap items-end gap-4 rounded-lg border border-[var(--hub-border-light)] bg-white p-4"
    >
      <input type="hidden" name="page" value="1" />
      <div>
        <label htmlFor="clients-search" className="mb-1 block text-xs font-medium text-[var(--hub-muted)]">
          Search
        </label>
        <input
          id="clients-search"
          type="search"
          name="search"
          placeholder="Company or contact..."
          defaultValue={params.search}
          className="rounded-md border border-[var(--hub-border-light)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        />
      </div>
      <div>
        <label htmlFor="clients-status" className="mb-1 block text-xs font-medium text-[var(--hub-muted)]">
          Status
        </label>
        <select
          id="clients-status"
          name="status"
          defaultValue={params.status ?? ""}
          className="rounded-md border border-[var(--hub-border-light)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        >
          <option value="">All</option>
          {(Object.keys(ClientStatus) as Array<keyof typeof ClientStatus>).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="clients-pageSize" className="mb-1 block text-xs font-medium text-[var(--hub-muted)]">
          Per page
        </label>
        <select
          id="clients-pageSize"
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
