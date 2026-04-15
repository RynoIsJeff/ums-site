"use client";

import { useActionState, useState } from "react";
import { PendingSubmitButton } from "@/app/hub/_components/PendingSubmitButton";
import type { TimeEntryFormState } from "../actions";
import { Input, Select } from "@/app/hub/_components/form";
import { TaskCombobox } from "./TaskCombobox";

type Client = { id: string; companyName: string };

type LogTimeFormProps = {
  clients: Client[];
  action: (
    prev: TimeEntryFormState,
    formData: FormData
  ) => Promise<TimeEntryFormState>;
  initialState?: TimeEntryFormState;
};

export function LogTimeForm({
  clients,
  action,
  initialState,
}: LogTimeFormProps) {
  const [state, formAction] = useActionState<TimeEntryFormState, FormData>(action, initialState ?? {});
  const [selectedClientId, setSelectedClientId] = useState("");

  const clientOptions = clients.map((c) => ({ value: c.id, label: c.companyName }));
  const defaultDate = new Date().toISOString().slice(0, 10);

  return (
    <form
      action={formAction}
      className="rounded-lg border border-(--hub-border) bg-(--hub-card) p-4 space-y-4"
    >
      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Select
          id="clientId"
          name="clientId"
          label="Client"
          options={clientOptions}
          placeholder="Select client"
          required
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedClientId(e.target.value)}
        />
        <div>
          <label className="block text-sm font-medium text-(--hub-text) mb-1">Task (optional)</label>
          <TaskCombobox clientId={selectedClientId} />
        </div>
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
      <PendingSubmitButton className="rounded-md border border-transparent bg-(--primary) px-4 py-2 text-sm font-semibold text-white hover:opacity-95">
        Log time
      </PendingSubmitButton>
    </form>
  );
}
