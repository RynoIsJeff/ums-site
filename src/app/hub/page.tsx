import Link from "next/link";
import { getSession } from "@/lib/auth";
import { canAccessSettings } from "@/lib/rbac";

const HUB_SECTIONS: { href: string; label: string; adminOnly?: boolean }[] = [
  { href: "/hub/clients", label: "Clients" },
  { href: "/hub/billing", label: "Billing" },
  { href: "/hub/invoices", label: "Invoices" },
  { href: "/hub/payments", label: "Payments" },
  { href: "/hub/social", label: "Social" },
  { href: "/hub/tasks", label: "Tasks" },
  { href: "/hub/settings", label: "Settings", adminOnly: true },
];

export const metadata = {
  title: "UMS Hub",
};

export default async function HubHomePage() {
  const { user } = await getSession();
  if (!user) return null;

  const scope = { role: user.role, userId: user.id, assignedClientIds: user.assignedClientIds };
  const sections = HUB_SECTIONS.filter(
    (s) => !s.adminOnly || canAccessSettings(scope)
  );

  return (
    <section className="py-10">
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-black/50">
          Internal Dashboard
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Welcome to UMS Hub
        </h1>
        <p className="mt-2 text-sm text-black/70">
          Signed in as {user.email} ({user.role})
          {user.role === "STAFF" && (
            <> — access to {user.assignedClientIds?.length ?? 0} client(s)</>
          )}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="rounded-xl border border-black/10 p-4 text-sm transition hover:border-black/25 hover:bg-black/2"
            >
              {section.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
