import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { canAccessSettings } from "@/lib/rbac";

export default async function HubSettingsPage() {
  const { user } = await getSession();
  if (!user) redirect("/login");

  const scope = { role: user.role, userId: user.id, assignedClientIds: user.assignedClientIds };
  if (!canAccessSettings(scope)) {
    redirect("/hub");
  }

  return (
    <section className="py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-2 text-sm text-black/70">
        Hub settings are scaffolded and will be expanded in upcoming steps.
      </p>
    </section>
  );
}
