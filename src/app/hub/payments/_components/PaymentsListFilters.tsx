import type { ListParams } from "@/app/hub/_lib/listParams";

type Client = { id: string; companyName: string };

type PaymentsListFiltersProps = {
  params: ListParams;
  basePath: string;
  clients: Client[];
};

export function PaymentsListFilters({ params, basePath, clients }: PaymentsListFiltersProps) {
  return (
    <form
      method="get"
      action={basePath}
      className="flex flex-wrap items-end gap-4 rounded-lg border border-[var(--hub-border-light)] bg-white p-4"
    >
      <input type="hidden" name="page" value="1" />
      <div>
        <label htmlFor="payments-clientId" className="mb-1 block text-xs font-medium text-[var(--hub-muted)]">
          Client
        </label>
        <select
          id="payments-clientId"
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
        <label htmlFor="payments-dateFrom" className="mb-1 block text-xs font-medium text-[var(--hub-muted)]">
          From date
        </label>
        <input
          id="payments-dateFrom"
          type="date"
          name="dateFrom"
          defaultValue={params.dateFrom}
          className="rounded-md border border-[var(--hub-border-light)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        />
      </div>
      <div>
        <label htmlFor="payments-dateTo" className="mb-1 block text-xs font-medium text-[var(--hub-muted)]">
          To date
        </label>
        <input
          id="payments-dateTo"
          type="date"
          name="dateTo"
          defaultValue={params.dateTo}
          className="rounded-md border border-[var(--hub-border-light)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        />
      </div>
      <div>
        <label htmlFor="payments-pageSize" className="mb-1 block text-xs font-medium text-[var(--hub-muted)]">
          Per page
        </label>
        <select
          id="payments-pageSize"
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
