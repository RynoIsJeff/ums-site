import Link from "next/link";
import { getSession } from "@/lib/auth";
import { canAccessSettings } from "@/lib/rbac";
import {
  Users,
  CreditCard,
  FileText,
  Wallet,
  Share2,
  Megaphone,
  CheckSquare,
  Settings,
  ArrowRight,
} from "lucide-react";

const HUB_SECTIONS: {
  href: string;
  label: string;
  description: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}[] = [
  { href: "/hub/clients", label: "Clients", description: "Manage client accounts and contacts", icon: Users },
  { href: "/hub/billing", label: "Billing", description: "Track plans, renewals and revenue", icon: CreditCard },
  { href: "/hub/invoices", label: "Invoices", description: "Create and send invoices", icon: FileText },
  { href: "/hub/payments", label: "Payments", description: "Record and reconcile payments", icon: Wallet },
  { href: "/hub/social", label: "Social", description: "Schedule and publish social posts", icon: Share2 },
  { href: "/hub/ads", label: "Ads", description: "Manage Meta ad campaigns and insights", icon: Megaphone },
  { href: "/hub/tasks", label: "Tasks", description: "Assign and track work items", icon: CheckSquare },
  { href: "/hub/settings", label: "Settings", description: "Users, permissions and config", icon: Settings, adminOnly: true },
];

export const metadata = {
  title: "Dashboard — UMS Hub",
};

export default async function HubHomePage() {
  const { user } = await getSession();
  if (!user) return null;

  const scope = { role: user.role, userId: user.id, assignedClientIds: user.assignedClientIds };
  const sections = HUB_SECTIONS.filter(
    (s) => !s.adminOnly || canAccessSettings(scope)
  );

  const greeting = getGreeting();

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-black/40 uppercase tracking-wider">
          {greeting}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-black/90">
          {user.name ?? user.email.split("@")[0]}
        </h1>
        <p className="mt-1 text-sm text-black/50">
          {user.role === "ADMIN" ? "Full access" : `${user.assignedClientIds?.length ?? 0} client(s) assigned`}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.href}
              href={section.href}
              className="group relative rounded-xl border border-black/6 bg-white p-5 shadow-sm transition-all hover:border-black/12 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-(--primary)/10 to-(--accent)/10">
                  <Icon className="h-5 w-5" style={{ color: "var(--primary)" }} />
                </div>
                <ArrowRight className="h-4 w-4 text-black/20 transition-transform group-hover:translate-x-0.5 group-hover:text-black/40" />
              </div>
              <h2 className="mt-3 text-sm font-semibold text-black/85">
                {section.label}
              </h2>
              <p className="mt-0.5 text-xs text-black/50">
                {section.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
