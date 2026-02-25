"use client";

import { useRouter } from "next/navigation";
import { setTaskStatus } from "../actions";
import type { TaskStatus } from "@prisma/client";

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "TODO", label: "To do" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "DONE", label: "Done" },
];

type Props = { taskId: string; currentStatus: TaskStatus };

export function SetTaskStatusButton({ taskId, currentStatus }: Props) {
  const router = useRouter();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {STATUS_OPTIONS.filter((o) => o.value !== currentStatus).map((opt) => (
        <form
          key={opt.value}
          action={async () => {
            await setTaskStatus(taskId, opt.value);
            router.refresh();
          }}
          className="inline"
        >
          <button
            type="submit"
            className="rounded-md border border-black/15 px-3 py-1.5 text-sm hover:bg-black/5"
          >
            {opt.label}
          </button>
        </form>
      ))}
    </div>
  );
}
