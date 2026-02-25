import Link from "next/link";
import { getSession } from "@/lib/auth";
import { toAuthScope } from "@/lib/auth";
import { taskWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Tasks | UMS Hub",
};

export default async function HubTasksPage() {
  const { user } = await getSession();
  if (!user) return null;

  const scope = toAuthScope(user);
  const where = taskWhere(scope);

  const tasks = await prisma.task.findMany({
    where,
    orderBy: [
      { status: "asc" },
      { dueDate: "asc" },
      { createdAt: "desc" },
    ],
    include: {
      client: { select: { id: true, companyName: true } },
      occurrences: { where: { status: "PENDING" }, orderBy: { dueDate: "asc" }, take: 1 },
    },
  });

  return (
    <section className="py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="mt-2 text-sm text-black/70">
            Create and manage tasks. Use recurrence for repeating tasks.
          </p>
        </div>
        <Link
          href="/hub/tasks/new"
          className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90"
        >
          New task
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse rounded-xl border border-black/10 bg-white text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left">
              <th className="p-3 font-medium">Title</th>
              <th className="p-3 font-medium">Client</th>
              <th className="p-3 font-medium">Due</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Recurrence</th>
              <th className="p-3 font-medium" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-black/50">
                  No tasks yet. Create one to get started.
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task.id} className="border-b border-black/5 hover:bg-black/[0.02]">
                  <td className="p-3">
                    <Link href={`/hub/tasks/${task.id}`} className="font-medium hover:underline">
                      {task.title}
                    </Link>
                  </td>
                  <td className="p-3">
                    {task.client ? (
                      <Link href={`/hub/clients/${task.client.id}`} className="text-black/70 hover:underline">
                        {task.client.companyName}
                      </Link>
                    ) : (
                      <span className="text-black/40">—</span>
                    )}
                  </td>
                  <td className="p-3">
                    {task.dueDate
                      ? task.dueDate.toLocaleDateString("en-ZA", { dateStyle: "medium" })
                      : task.occurrences[0]
                        ? task.occurrences[0].dueDate.toLocaleDateString("en-ZA", { dateStyle: "medium" })
                        : "—"}
                  </td>
                  <td className="p-3">
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
                  </td>
                  <td className="p-3">
                    {task.recurrencePattern === "NONE" ? (
                      <span className="text-black/40">—</span>
                    ) : (
                      <span className="text-black/60">
                        {task.recurrencePattern} every {task.recurrenceInterval}
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/hub/tasks/${task.id}/edit`}
                      className="text-black/60 hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
