import type { ListParams } from "@/app/hub/_lib/listParams";
import { FilterForm, Input, Select } from "@/app/hub/_components/form";
import { ClientStatus } from "@prisma/client";

type ClientsListFiltersProps = {
  params: ListParams;
  basePath: string;
};

export function ClientsListFilters({ params, basePath }: ClientsListFiltersProps) {
  const statusOptions = (Object.keys(ClientStatus) as Array<keyof typeof ClientStatus>).map((s) => ({
    value: s,
    label: s,
  }));

  return (
    <FilterForm basePath={basePath}>
      <Input
        id="clients-search"
        type="search"
        name="search"
        label="Search"
        placeholder="Company or contact..."
        defaultValue={params.search}
      />
      <Select
        id="clients-status"
        name="status"
        label="Status"
        options={statusOptions}
        placeholder="All"
        defaultValue={params.status ?? ""}
      />
      <Select
        id="clients-pageSize"
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
