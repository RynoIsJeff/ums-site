import Link from "next/link";
import { getSession } from "@/lib/auth";
import { toAuthScope } from "@/lib/auth";
import { canAccessClient } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SetTaskStatusButton } from "../_components/SetTaskStatusButton";
import { CompleteOccurrenceButton } from "../_components/CompleteOccurrenceButton";
import { SkipOccurrenceButton } from "../_components/SkipOccurrenceButton";

export const metadata = {
  title: "Task | UMS Hub",
};

type PageProps = { params: Promise<{ id: string }> };

function formatDate(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleDateString("en-ZA", { dateStyle: "medium" });
}

export default async function TaskDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { user } = await getSession();
  if (!user) return null;

  const scope = toAuthScope(user);
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, companyName: true } },
      occurrences: { orderBy: { dueDate: "asc" } },
    },
  });

  if (!task) notFound();
  if (task.clientId && !canAccessClient(scope, task.clientId)) notFound();

  const canEdit = task.status !== "CANCELLED";
  const pendingOccurrences = task.occurrences.filter((o) => o.status === "PENDING");

  return (
    <section className="py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link href="/hub/tasks" className="text-sm text-black/60 hover:text-black">
          ← Tasks
        </Link>
        {canEdit && (
          <div className="flex items-center gap-2">
            <Link
              href={`/hub/tasks/${id}/edit`}
              className="rounded-md border border-black/15 px-3 py-1.5 text-sm font-medium hover:bg-black/5"
            >
              Edit
            </Link>
            <SetTaskStatusButton taskId={id} currentStatus={task.status} />
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">{task.title}</h1>
        <span
          className={
            task.status === "DONE"
              ? "text-green-600"
              : task.status === "IN_PROGRESS"
                ? "text-amber-600"
                : "text-black/60"
          }
        >
          {task.status.replace("_", " ")}
        </span>
      </div>

      <p className="mt-2 text-sm text-black/70">
        {task.client ? (
          <Link href={`/hub/clients/${task.client.id}`} className="hover:underline">
            {task.client.companyName}
          </Link>
        ) : (
          "General task"
        )}
        {task.recurrencePattern !== "NONE" && (
          <> · {task.recurrencePattern} every {task.recurrenceInterval}</>
        )}
      </p>

      {task.description && (
        <div className="mt-4 whitespace-pre-wrap rounded-lg border border-black/10 bg-black/[0.02] p-4 text-sm">
          {task.description}
        </div>
      )}

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-medium text-black/60">Start date</dt>
          <dd>{formatDate(task.startDate)}</dd>
        </div>
        <div>
          <dt className="font-medium text-black/60">Due date</dt>
          <dd>{formatDate(task.dueDate)}</dd>
        </div>
        {task.completedAt && (
          <div>
            <dt className="font-medium text-black/60">Completed</dt>
            <dd>{formatDate(task.completedAt)}</dd>
          </div>
        )}
      </dl>

      {task.recurrencePattern !== "NONE" && task.occurrences.length > 0 && (
        <div className="mt-6 rounded-xl border border-black/10 bg-white p-5">
          <h2 className="text-lg font-semibold">Occurrences</h2>
          <ul className="mt-4 space-y-2">
            {task.occurrences.map((occ) => (
              <li
                key={occ.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-black/5 pb-2 last:border-0"
              >
                <span className="text-sm">
                  {occ.dueDate.toLocaleDateString("en-ZA", { dateStyle: "medium" })}
                  <span
                    className={`ml-2 ${
                      occ.status === "COMPLETED"
                        ? "text-green-600"
                        : occ.status === "SKIPPED"
                          ? "text-black/40"
                          : ""
                    }`}
                  >
                    {occ.status}
                  </span>
                </span>
                {occ.status === "PENDING" && (
                  <span>
                    <CompleteOccurrenceButton occurrenceId={occ.id} />
                    <SkipOccurrenceButton occurrenceId={occ.id} />
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
