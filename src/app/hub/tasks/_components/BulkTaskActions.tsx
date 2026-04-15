"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { CheckSquare, Square, CheckCheck } from "lucide-react";
import { setTaskStatus } from "../actions";
import { StatusBadge } from "@/app/hub/_components/StatusBadge";

type Task = {
  id: string;
  title: string;
  status: string;
  dueDate: Date | null;
  recurrencePattern: string;
  recurrenceInterval?: number | null;
  client: { id: string; companyName: string } | null;
  occurrences: { dueDate: Date }[];
};

type Props = {
  tasks: Task[];
};

export function BulkTaskTable({ tasks }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const toggleAll = useCallback(() => {
    setSelected((prev) =>
      prev.size === tasks.length ? new Set() : new Set(tasks.map((t) => t.id))
    );
  }, [tasks]);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const anySelected = selected.size > 0;
  const allChecked = tasks.length > 0 && selected.size === tasks.length;

  const handleBulkComplete = async () => {
    if (!confirm(`Mark ${selected.size} task(s) as Done?`)) return;
    setLoading(true);
    setErrors([]);
    const errs: string[] = [];
    for (const id of Array.from(selected)) {
      const r = await setTaskStatus(id, "DONE");
      if (r.error) errs.push(`${tasks.find((t) => t.id === id)?.title}: ${r.error}`);
    }
    setErrors(errs);
    setSelected(new Set());
    setLoading(false);
  };

  const handleBulkInProgress = async () => {
    if (!confirm(`Mark ${selected.size} task(s) as In Progress?`)) return;
    setLoading(true);
    setErrors([]);
    const errs: string[] = [];
    for (const id of Array.from(selected)) {
      const r = await setTaskStatus(id, "IN_PROGRESS");
      if (r.error) errs.push(`${tasks.find((t) => t.id === id)?.title}: ${r.error}`);
    }
    setErrors(errs);
    setSelected(new Set());
    setLoading(false);
  };

  return (
    <>
      {errors.length > 0 && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800 space-y-0.5">
          {errors.map((e, i) => <div key={i}>{e}</div>)}
        </div>
      )}

      {anySelected && (
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-lg border border-(--hub-border-light) bg-white px-4 py-2.5 shadow-sm">
          <span className="text-sm font-medium text-(--hub-text)">
            {selected.size} selected
          </span>
          <button
            type="button"
            onClick={handleBulkInProgress}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-md border border-(--hub-border-light) px-3 py-1.5 text-xs font-medium hover:bg-black/5 disabled:opacity-50"
          >
            Mark in progress
          </button>
          <button
            type="button"
            onClick={handleBulkComplete}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            <CheckCheck className="h-3 w-3" />
            Mark done
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="ml-auto text-xs text-(--hub-muted) hover:text-(--hub-text)"
          >
            Clear selection
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="hub-table min-w-[640px]">
          <thead>
            <tr>
              <th className="w-10 pr-0">
                <button
                  type="button"
                  onClick={toggleAll}
                  className="flex items-center text-(--hub-muted) hover:text-(--hub-text)"
                  aria-label={allChecked ? "Deselect all" : "Select all"}
                >
                  {allChecked
                    ? <CheckSquare className="h-4 w-4 text-(--primary)" />
                    : <Square className="h-4 w-4" />}
                </button>
              </th>
              <th>Title</th>
              <th>Client</th>
              <th>Due</th>
              <th>Status</th>
              <th>Recurrence</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className={selected.has(task.id) ? "bg-(--primary)/3" : ""}>
                <td className="pr-0">
                  <input
                    type="checkbox"
                    checked={selected.has(task.id)}
                    onChange={() => toggle(task.id)}
                    className="rounded border-(--hub-border-light)"
                    aria-label={`Select ${task.title}`}
                  />
                </td>
                <td>
                  <Link href={`/hub/tasks/${task.id}`} className="font-medium text-(--hub-text) hover:underline">
                    {task.title}
                  </Link>
                </td>
                <td className="p-3">
                  {task.client ? (
                    <Link href={`/hub/clients/${task.client.id}`} className="text-(--hub-muted) hover:underline">
                      {task.client.companyName}
                    </Link>
                  ) : (
                    <span className="text-(--hub-muted)">—</span>
                  )}
                </td>
                <td className="p-3 text-(--hub-text)">
                  {task.dueDate
                    ? task.dueDate.toLocaleDateString("en-ZA", { dateStyle: "medium" })
                    : task.occurrences[0]
                      ? task.occurrences[0].dueDate.toLocaleDateString("en-ZA", { dateStyle: "medium" })
                      : "—"}
                </td>
                <td className="p-3">
                  <StatusBadge status={task.status as "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED"} />
                </td>
                <td className="p-3">
                  {task.recurrencePattern === "NONE" ? (
                    <span className="text-(--hub-muted)">—</span>
                  ) : (
                    <span className="text-(--hub-muted)">
                      {task.recurrencePattern} every {task.recurrenceInterval}
                    </span>
                  )}
                </td>
                <td>
                  <Link href={`/hub/tasks/${task.id}/edit`} className="text-(--hub-muted) hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
