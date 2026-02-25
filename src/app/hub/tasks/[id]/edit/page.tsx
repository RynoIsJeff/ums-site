import Link from "next/link";
import { getSession } from "@/lib/auth";
import { toAuthScope } from "@/lib/auth";
import { canAccessClient, clientWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { TaskForm } from "../../_components/TaskForm";
import { updateTask } from "../../actions";

export const metadata = {
  title: "Edit Task | UMS Hub",
};

type PageProps = { params: Promise<{ id: string }> };

function formatDate(d: Date | null): string {
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default async function EditTaskPage({ params }: PageProps) {
  const { id } = await params;
  const { user } = await getSession();
  if (!user) return null;

  const scope = toAuthScope(user);
  const [task, clientsList] = await Promise.all([
    prisma.task.findUnique({ where: { id } }),
    prisma.client.findMany({
      where: clientWhere(scope),
      orderBy: { companyName: "asc" },
      select: { id: true, companyName: true },
    }),
  ]);

  if (!task) notFound();
  if (task.clientId && !canAccessClient(scope, task.clientId)) notFound();

  const updateAction = (prev: { error?: string }, formData: FormData) =>
    updateTask(id, prev, formData);

  return (
    <section className="py-10">
      <div className="mb-6">
        <Link href={`/hub/tasks/${id}`} className="text-sm text-black/60 hover:text-black">
          ← {task.title}
        </Link>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">Edit task</h1>
      <div className="mt-6 rounded-xl border border-black/10 bg-white p-6">
        <TaskForm
          action={updateAction}
          clients={clientsList}
          defaultValues={{
            title: task.title,
            description: task.description ?? "",
            clientId: task.clientId ?? "",
            status: task.status,
            recurrencePattern: task.recurrencePattern,
            recurrenceInterval: task.recurrenceInterval,
            startDate: formatDate(task.startDate),
            dueDate: formatDate(task.dueDate),
          }}
          submitLabel="Save changes"
          backHref={`/hub/tasks/${id}`}
        />
      </div>
    </section>
  );
}
