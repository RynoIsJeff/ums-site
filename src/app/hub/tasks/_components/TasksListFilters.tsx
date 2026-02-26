import type { ListParams } from "@/app/hub/_lib/listParams";
import { FilterForm, Input, Select } from "@/app/hub/_components/form";
import { TaskStatus } from "@prisma/client";

type Client = { id: string; companyName: string };

type TasksListFiltersProps = {
  params: ListParams;
  basePath: string;
  clients: Client[];
};

export function TasksListFilters({ params, basePath, clients }: TasksListFiltersProps) {
  const statusOptions = (Object.keys(TaskStatus) as Array<keyof typeof TaskStatus>).map((s) => ({
    value: s,
    label: s.replace("_", " "),
  }));
  const clientOptions = clients.map((c) => ({ value: c.id, label: c.companyName }));

  return (
    <FilterForm basePath={basePath}>
      <Select
        id="tasks-status"
        name="status"
        label="Status"
        options={statusOptions}
        placeholder="All"
        defaultValue={params.status ?? ""}
      />
      <Select
        id="tasks-clientId"
        name="clientId"
        label="Client"
        options={clientOptions}
        placeholder="All clients"
        defaultValue={params.clientId ?? ""}
      />
      <Input
        id="tasks-dateFrom"
        type="date"
        name="dateFrom"
        label="Due from"
        defaultValue={params.dateFrom}
      />
      <Input
        id="tasks-dateTo"
        type="date"
        name="dateTo"
        label="Due to"
        defaultValue={params.dateTo}
      />
      <Select
        id="tasks-pageSize"
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
