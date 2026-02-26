import type { ListParams } from "@/app/hub/_lib/listParams";
import { FilterForm, Input, Select } from "@/app/hub/_components/form";

type Client = { id: string; companyName: string };

type PaymentsListFiltersProps = {
  params: ListParams;
  basePath: string;
  clients: Client[];
};

export function PaymentsListFilters({ params, basePath, clients }: PaymentsListFiltersProps) {
  const clientOptions = clients.map((c) => ({ value: c.id, label: c.companyName }));

  return (
    <FilterForm basePath={basePath}>
      <Select
        id="payments-clientId"
        name="clientId"
        label="Client"
        options={clientOptions}
        placeholder="All clients"
        defaultValue={params.clientId ?? ""}
      />
      <Input
        id="payments-dateFrom"
        type="date"
        name="dateFrom"
        label="From date"
        defaultValue={params.dateFrom}
      />
      <Input
        id="payments-dateTo"
        type="date"
        name="dateTo"
        label="To date"
        defaultValue={params.dateTo}
      />
      <Select
        id="payments-pageSize"
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
