"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronDown, X } from "lucide-react";

type Task = { id: string; title: string; clientId: string | null };

type Props = {
  clientId: string;
  defaultTaskId?: string;
  defaultTaskTitle?: string;
};

export function TaskCombobox({ clientId, defaultTaskId = "", defaultTaskTitle = "" }: Props) {
  const [query, setQuery] = useState(defaultTaskTitle);
  const [selectedId, setSelectedId] = useState(defaultTaskId);
  const [options, setOptions] = useState<Task[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchTasks = useCallback(
    async (q: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ q });
        if (clientId) params.set("clientId", clientId);
        const res = await fetch(`/api/hub/tasks-search?${params.toString()}`);
        const data = await res.json();
        setOptions(data.tasks ?? []);
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    [clientId]
  );

  // Fetch initial options when clientId changes
  useEffect(() => {
    if (clientId) {
      fetchTasks("");
    } else {
      setOptions([]);
    }
    // Reset selection when client changes
    setSelectedId("");
    setQuery("");
  }, [clientId, fetchTasks]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setSelectedId(""); // clear selection when typing
    setOpen(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchTasks(val), 250);
  };

  const handleSelect = (task: Task) => {
    setSelectedId(task.id);
    setQuery(task.title);
    setOpen(false);
  };

  const handleClear = () => {
    setSelectedId("");
    setQuery("");
    fetchTasks("");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* Hidden input carries the actual task ID */}
      <input type="hidden" name="taskId" value={selectedId} />

      <div className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={() => { setOpen(true); if (!options.length) fetchTasks(query); }}
          placeholder={clientId ? "Search tasks…" : "Select a client first"}
          disabled={!clientId}
          className="w-full rounded-lg border border-(--hub-border-light) px-3 py-2 pr-8 text-sm focus:border-(--primary) focus:outline-none focus:ring-1 focus:ring-(--primary) disabled:cursor-not-allowed disabled:opacity-50"
        />
        {selectedId ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 text-black/40 hover:text-black"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <ChevronDown className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-black/40" />
        )}
      </div>

      {open && clientId && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-(--hub-border-light) bg-white shadow-lg">
          {loading ? (
            <div className="p-3 text-sm text-(--hub-muted)">Searching…</div>
          ) : options.length === 0 ? (
            <div className="p-3 text-sm text-(--hub-muted)">No tasks found</div>
          ) : (
            <ul className="max-h-48 overflow-y-auto py-1">
              <li>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm text-(--hub-muted) hover:bg-black/5"
                  onClick={handleClear}
                >
                  — None —
                </button>
              </li>
              {options.map((task) => (
                <li key={task.id}>
                  <button
                    type="button"
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-black/5 ${task.id === selectedId ? "bg-(--primary)/5 font-medium" : ""}`}
                    onClick={() => handleSelect(task)}
                  >
                    {task.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
