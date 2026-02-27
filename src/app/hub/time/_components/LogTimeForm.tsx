"use client";

import { useFormStatus } from "react-dom";
import type { TimeEntryFormState } from "../actions";
import { Input, Select } from "@/app/hub/_components/form";

type Client = { id: string; companyName: string };
type Task = { id: string; title: string; clientId: string | null };

type LogTimeFormProps = {
  clients: Client[];
  tasks: Task[];
  action: (prev: TimeEntryFormState, formData: FormData) => Promise<TimeEntryFormState>;
  initialState?: TimeEntryFormState;
};

export function LogTimeForm({
  clients,
  tasks,
  action,
  initialState,
}: LogTimeFormProps) {
  const clientOptions = clients.map((c) => ({ value: c.id, label: c.companyName }));
  const taskOptions = tasks
    .filter((t) => t.clientId)
    .map((t) => ({ value: t.id, label: t.title }));

  const defaultDate = new Date().toISOString().slice(0, 10);

  return (
    <form action={action} className="rounded-lg border border-(--hub-border) bg-(--hub-card) p-4 space-y-4">
      {initialState?.error && (
        <p className="text-sm text-red-600">{initialState.error}</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Select
          id="clientId"
          name="clientId"
          label="Client"
          options={clientOptions}
          placeholder="Select client"
          required
        />
        <Select
          id="taskId"
          name="taskId"
          label="Task (optional)"
          options={taskOptions}
          placeholder="None"
        />
        <Input
          id="date"
          type="date"
          name="date"
          label="Date"
          defaultValue={defaultDate}
          required
        />
        <Input
          id="hours"
          type="number"
          name="hours"
          label="Hours"
          min="0.1"
          step="0.25"
          defaultValue="1"
          required
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-(--hub-text) mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={2}
          className="w-full rounded-md border border-(--hub-border) bg-white px-3 py-2 text-(--hub-text) focus:outline-none focus:ring-2 focus:ring-(--primary)"
          placeholder="What did you work on?"
          required
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="billable"
          name="billable"
          defaultChecked
          className="rounded border-(--hub-border) text-(--primary) focus:ring-(--primary)"
        />
        <label htmlFor="billable" className="text-sm text-(--hub-text)">
          Billable
        </label>
      </div>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-(--primary) px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
    >
      {pending ? "Saving…" : "Log time"}
    </button>
  );
}
