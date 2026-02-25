import Link from "next/link";
import { getSession } from "@/lib/auth";
import { toAuthScope } from "@/lib/auth";
import { clientWhere, canAccessClient } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { TaskForm } from "../_components/TaskForm";
import { createTask } from "../actions";

export const metadata = {
  title: "New Task | UMS Hub",
};

type PageProps = { searchParams: Promise<{ clientId?: string }> };

export default async function NewTaskPage({ searchParams }: PageProps) {
  const { user } = await getSession();
  if (!user) return null;

  const { clientId: prefillClientId } = await searchParams;
  const scope = toAuthScope(user);
  const clients = await prisma.client.findMany({
    where: clientWhere(scope),
    orderBy: { companyName: "asc" },
    select: { id: true, companyName: true },
  });

  return (
    <section className="py-10">
      <div className="mb-6">
        <Link href="/hub/tasks" className="text-sm text-black/60 hover:text-black">
          ← Tasks
        </Link>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">New task</h1>
      <p className="mt-2 text-sm text-black/70">
        Add a title and optional client, dates, and recurrence (daily/weekly/monthly).
      </p>
      <div className="mt-6 rounded-xl border border-black/10 bg-white p-6">
        <TaskForm
          action={createTask}
          clients={clients}
          defaultValues={prefillClientId && canAccessClient(scope, prefillClientId) ? { clientId: prefillClientId } : undefined}
          submitLabel="Create task"
          backHref="/hub/tasks"
        />
      </div>
    </section>
  );
}
