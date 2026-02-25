import Link from "next/link";
import type { AppUser } from "@/lib/auth";
import { canAccessSettings } from "@/lib/rbac";

const HUB_LINKS: { href: string; label: string; adminOnly?: boolean }[] = [
  { href: "/hub/clients", label: "Clients" },
  { href: "/hub/billing", label: "Billing" },
  { href: "/hub/invoices", label: "Invoices" },
  { href: "/hub/payments", label: "Payments" },
  { href: "/hub/social", label: "Social" },
  { href: "/hub/tasks", label: "Tasks" },
  { href: "/hub/settings", label: "Settings", adminOnly: true },
];

type HubNavProps = {
  user: AppUser;
};

export function HubNav({ user }: HubNavProps) {
  const scope = { role: user.role, userId: user.id, assignedClientIds: user.assignedClientIds };
  const links = HUB_LINKS.filter(
    (link) => !link.adminOnly || canAccessSettings(scope)
  );

  return (
    <nav className="flex flex-wrap items-center gap-2" aria-label="Hub navigation">
      <Link
        href="/hub"
        className="rounded-md px-3 py-2 text-sm font-medium text-black/80 hover:bg-black/5"
      >
        Dashboard
      </Link>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-md px-3 py-2 text-sm font-medium text-black/80 hover:bg-black/5"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
