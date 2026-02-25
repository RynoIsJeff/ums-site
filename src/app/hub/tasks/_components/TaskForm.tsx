"use client";

import { useActionState } from "react";
import { useState } from "react";

type TaskFormProps = {
  action: (prev: { error?: string }, formData: FormData) => Promise<{ error?: string }>;
  clients: { id: string; companyName: string }[];
  defaultValues?: {
    title?: string;
    description?: string;
    clientId?: string;
    status?: string;
    recurrencePattern?: string;
    recurrenceInterval?: number;
    startDate?: string;
    dueDate?: string;
  };
  submitLabel: string;
  backHref: string;
};

const RECURRENCE_OPTIONS = [
  { value: "NONE", label: "None" },
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
];

const STATUS_OPTIONS = [
  { value: "TODO", label: "To do" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "DONE", label: "Done" },
];

export function TaskForm({
  action,
  clients,
  defaultValues = {},
  submitLabel,
  backHref,
}: TaskFormProps) {
  const [state, formAction] = useActionState(action, {});
  const [recurrence, setRecurrence] = useState(defaultValues.recurrencePattern ?? "NONE");

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium">Title *</label>
        <input
          id="title"
          name="title"
          required
          defaultValue={defaultValues.title}
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium">Description</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={defaultValues.description}
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="clientId" className="block text-sm font-medium">Client</label>
        <select
          id="clientId"
          name="clientId"
          defaultValue={defaultValues.clientId ?? ""}
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
        >
          <option value="">— None —</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.companyName}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium">Status</label>
        <select
          id="status"
          name="status"
          defaultValue={defaultValues.status ?? "TODO"}
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium">Start date</label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={defaultValues.startDate}
            className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium">Due date</label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            defaultValue={defaultValues.dueDate}
            className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="recurrencePattern" className="block text-sm font-medium">Recurrence</label>
        <select
          id="recurrencePattern"
          name="recurrencePattern"
          value={recurrence}
          onChange={(e) => setRecurrence(e.target.value)}
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
        >
          {RECURRENCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {recurrence !== "NONE" && (
        <div>
          <label htmlFor="recurrenceInterval" className="block text-sm font-medium">Repeat every (interval)</label>
          <input
            id="recurrenceInterval"
            name="recurrenceInterval"
            type="number"
            min={1}
            max={99}
            defaultValue={defaultValues.recurrenceInterval ?? 1}
            className="mt-1 w-24 rounded-md border border-black/15 px-3 py-2 text-sm"
          />
          <span className="ml-2 text-sm text-black/60">
            {recurrence === "DAILY" && "day(s)"}
            {recurrence === "WEEKLY" && "week(s)"}
            {recurrence === "MONTHLY" && "month(s)"}
          </span>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90"
        >
          {submitLabel}
        </button>
        <a
          href={backHref}
          className="rounded-md border border-black/15 px-4 py-2 text-sm font-medium hover:bg-black/5"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
