import type { ListParams } from "@/app/hub/_lib/listParams";
import { FilterForm, Input, Select } from "@/app/hub/_components/form";

type Client = { id: string; companyName: string };

type TimeListFiltersProps = {
  params: ListParams;
  basePath: string;
  clients: Client[];
};

export function TimeListFilters({ params, basePath, clients }: TimeListFiltersProps) {
  const clientOptions = clients.map((c) => ({ value: c.id, label: c.companyName }));

  return (
    <FilterForm basePath={basePath}>
      <Select
        id="time-clientId"
        name="clientId"
        label="Client"
        options={clientOptions}
        placeholder="All clients"
        defaultValue={params.clientId ?? ""}
      />
      <Input
        id="time-dateFrom"
        type="date"
        name="dateFrom"
        label="From"
        defaultValue={params.dateFrom}
      />
      <Input
        id="time-dateTo"
        type="date"
        name="dateTo"
        label="To"
        defaultValue={params.dateTo}
      />
      <Select
        id="time-pageSize"
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
