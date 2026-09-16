import type { ListParams } from "@/app/hub/_lib/listParams";
import { FilterForm, Input, Select } from "@/app/hub/_components/form";
import { QuoteStatus } from "@prisma/client";

type Client = { id: string; companyName: string };

type QuotesListFiltersProps = {
  params: ListParams;
  basePath: string;
  clients: Client[];
};

export function QuotesListFilters({ params, basePath, clients }: QuotesListFiltersProps) {
  const statusOptions = (Object.keys(QuoteStatus) as Array<keyof typeof QuoteStatus>).map((s) => ({
    value: s,
    label: s,
  }));
  const clientOptions = clients.map((c) => ({ value: c.id, label: c.companyName }));

  return (
    <FilterForm basePath={basePath}>
      <Input
        id="quotes-search"
        type="search"
        name="search"
        label="Search"
        placeholder="Quote number..."
        defaultValue={params.search}
      />
      <Select
        id="quotes-status"
        name="status"
        label="Status"
        options={statusOptions}
        placeholder="All"
        defaultValue={params.status ?? ""}
      />
      <Select
        id="quotes-clientId"
        name="clientId"
        label="Client"
        options={clientOptions}
        placeholder="All clients"
        defaultValue={params.clientId ?? ""}
      />
      <Input
        id="quotes-dateFrom"
        type="date"
        name="dateFrom"
        label="Valid from"
        defaultValue={params.dateFrom}
      />
      <Input
        id="quotes-dateTo"
        type="date"
        name="dateTo"
        label="Valid to"
        defaultValue={params.dateTo}
      />
      <Select
        id="quotes-pageSize"
        name="pageSize"
        label="Per page"
        options={[
          { value: "25", label: "25" },
          { value: "50", label: "50" },
        ]}
        defaultValue={params.pageSize}
      />
    </FilterForm>
  );
}
