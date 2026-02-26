import type { ListParams } from "@/app/hub/_lib/listParams";
import { FilterForm, Input, Select } from "@/app/hub/_components/form";
import { InvoiceStatus } from "@prisma/client";

type Client = { id: string; companyName: string };

type InvoicesListFiltersProps = {
  params: ListParams;
  basePath: string;
  clients: Client[];
};

export function InvoicesListFilters({ params, basePath, clients }: InvoicesListFiltersProps) {
  const statusOptions = (Object.keys(InvoiceStatus) as Array<keyof typeof InvoiceStatus>).map((s) => ({
    value: s,
    label: s,
  }));
  const clientOptions = clients.map((c) => ({ value: c.id, label: c.companyName }));

  return (
    <FilterForm basePath={basePath}>
      <Input
        id="invoices-search"
        type="search"
        name="search"
        label="Search"
        placeholder="Invoice number..."
        defaultValue={params.search}
      />
      <Select
        id="invoices-status"
        name="status"
        label="Status"
        options={statusOptions}
        placeholder="All"
        defaultValue={params.status ?? ""}
      />
      <Select
        id="invoices-clientId"
        name="clientId"
        label="Client"
        options={clientOptions}
        placeholder="All clients"
        defaultValue={params.clientId ?? ""}
      />
      <Input
        id="invoices-dateFrom"
        type="date"
        name="dateFrom"
        label="From date"
        defaultValue={params.dateFrom}
      />
      <Input
        id="invoices-dateTo"
        type="date"
        name="dateTo"
        label="To date"
        defaultValue={params.dateTo}
      />
      <Select
        id="invoices-pageSize"
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
