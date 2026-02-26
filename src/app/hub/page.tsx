import Link from "next/link";
import { getSession } from "@/lib/auth";
import { toAuthScope } from "@/lib/auth";
import { canAccessSettings } from "@/lib/rbac";
import { clientWhere, clientIdWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
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
  FilePlus,
  UserPlus,
  Calendar,
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

const QUICK_ACTIONS = [
  { href: "/hub/invoices/new", label: "New invoice", icon: FilePlus },
  { href: "/hub/clients/new", label: "New client", icon: UserPlus },
  { href: "/hub/social/posts/new", label: "New post", icon: Share2 },
  { href: "/hub/tasks/new", label: "New task", icon: CheckSquare },
];

export const metadata = {
  title: "Dashboard — UMS Hub",
};

function toNum(d: unknown): number {
  if (d == null) return 0;
  if (typeof d === "number" && !Number.isNaN(d)) return d;
  return Number(d) || 0;
}

type ActivityItem =
  | { type: "payment"; at: Date; clientName: string; amount: number; id: string }
  | { type: "invoice_sent"; at: Date; clientName: string; invoiceNumber: string; id: string }
  | { type: "post_published"; at: Date; clientName: string; caption: string; id: string };

function mergeActivity(
  payments: { paidAt: Date; client: { companyName: string }; amount: unknown; id: string }[],
  invoices: { sentAt: Date | null; client: { companyName: string }; invoiceNumber: string; id: string }[],
  posts: { publishedAt: Date | null; client: { companyName: string }; caption: string; id: string }[]
): ActivityItem[] {
  const items: ActivityItem[] = [];
  payments.forEach((p) => items.push({ type: "payment", at: p.paidAt, clientName: p.client.companyName, amount: toNum(p.amount), id: p.id }));
  invoices.filter((i) => i.sentAt).forEach((i) => items.push({ type: "invoice_sent", at: i.sentAt!, clientName: i.client.companyName, invoiceNumber: i.invoiceNumber, id: i.id }));
  posts.filter((p) => p.publishedAt).forEach((p) => items.push({ type: "post_published", at: p.publishedAt!, clientName: p.client.companyName, caption: p.caption, id: p.id }));
  return items.sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, 10);
}

export default async function HubHomePage() {
  const { user } = await getSession();
  if (!user) return null;

  const scope = toAuthScope(user);
  const clientWhereClause = clientWhere(scope);
  const clientIdClause = clientIdWhere(scope);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const in7Days = new Date(now);
  in7Days.setDate(in7Days.getDate() + 7);

  // Mark overdue invoices
  await prisma.invoice.updateMany({
    where: { ...clientIdClause, status: "SENT", dueDate: { lt: now } },
    data: { status: "OVERDUE" },
  });

  const [
    clientCount,
    renewalsNext7,
    invoicesDueOrOverdue,
    paymentsThisMonth,
    outstandingInvoices,
    recentPayments,
    recentSentInvoices,
    recentPublishedPosts,
  ] = await Promise.all([
    prisma.client.count({ where: clientWhereClause }),
    prisma.client.findMany({
      where: { ...clientWhereClause, status: "ACTIVE", renewalDate: { gte: now, lte: in7Days } },
      orderBy: { renewalDate: "asc" },
      select: { id: true },
    }),
    prisma.invoice.findMany({
      where: { ...clientIdClause, status: { in: ["SENT", "OVERDUE"] } },
      orderBy: { dueDate: "asc" },
      take: 5,
      include: { client: { select: { companyName: true } } },
    }),
    prisma.payment.findMany({
      where: { ...clientIdClause, paidAt: { gte: startOfMonth, lte: endOfMonth } },
      select: { amount: true },
    }),
    prisma.invoice.findMany({
      where: { ...clientIdClause, status: { in: ["SENT", "OVERDUE"] } },
      select: { totalAmount: true },
    }),
    prisma.payment.findMany({
      where: clientIdClause,
      orderBy: { paidAt: "desc" },
      take: 5,
      include: { client: { select: { companyName: true } } },
    }),
    prisma.invoice.findMany({
      where: { ...clientIdClause, sentAt: { not: null }, status: { in: ["SENT", "OVERDUE", "PAID"] } },
      orderBy: { sentAt: "desc" },
      take: 5,
      include: { client: { select: { companyName: true } } },
    }),
    prisma.socialPost.findMany({
      where: { ...clientIdClause, status: "PUBLISHED", publishedAt: { not: null } },
      orderBy: { publishedAt: "desc" },
      take: 5,
      include: { client: { select: { companyName: true } } },
    }),
  ]);

  const paymentsThisMonthTotal = paymentsThisMonth.reduce((s, p) => s + toNum(p.amount), 0);
  const outstandingTotal = outstandingInvoices.reduce((s, i) => s + toNum(i.totalAmount), 0);
  const activityItems = mergeActivity(recentPayments, recentSentInvoices, recentPublishedPosts);
  const sections = HUB_SECTIONS.filter((s) => !s.adminOnly || canAccessSettings(scope));
  const greeting = getGreeting();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--hub-muted)] uppercase tracking-wider">
            {greeting}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--hub-text)]">
            {user.name ?? user.email.split("@")[0]}
          </h1>
          <p className="mt-1 text-sm text-[var(--hub-muted)]">
            {scope.role === "ADMIN" ? "Full access" : `${scope.assignedClientIds?.length ?? 0} client(s) assigned`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--hub-border-light)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--hub-text)] shadow-sm transition-colors hover:bg-black/5"
              >
                <Icon className="h-4 w-4" />
                {action.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* KPI cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[var(--hub-border-light)] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10">
              <Users className="h-5 w-5" style={{ color: "var(--primary)" }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--hub-text)]">{clientCount}</p>
              <p className="text-sm text-[var(--hub-muted)]">Total clients</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--hub-border-light)] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <FileText className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--hub-text)]">
                R {outstandingTotal.toLocaleString("en-ZA")}
              </p>
              <p className="text-sm text-[var(--hub-muted)]">Outstanding invoices</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--hub-border-light)] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <Wallet className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--hub-text)]">
                R {paymentsThisMonthTotal.toLocaleString("en-ZA")}
              </p>
              <p className="text-sm text-[var(--hub-muted)]">Payments this month</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--hub-border-light)] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10">
              <Calendar className="h-5 w-5" style={{ color: "var(--primary)" }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--hub-text)]">{renewalsNext7.length}</p>
              <p className="text-sm text-[var(--hub-muted)]">Renewals (next 7 days)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main: Section cards */}
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--hub-muted)]">
            Sections
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Link
                  key={section.href}
                  href={section.href}
                  className="group relative rounded-xl border border-[var(--hub-border-light)] bg-white p-5 shadow-sm transition-all hover:border-black/12 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-(--primary)/10 to-(--accent)/10">
                      <Icon className="h-5 w-5" style={{ color: "var(--primary)" }} />
                    </div>
                    <ArrowRight className="h-4 w-4 text-black/20 transition-transform group-hover:translate-x-0.5 group-hover:text-black/40" />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-[var(--hub-text)]">
                    {section.label}
                  </h3>
                  <p className="mt-0.5 text-xs text-[var(--hub-muted)]">
                    {section.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Sidebar: Invoices due + Recent activity */}
        <div className="space-y-6">
          {/* Invoices due / overdue */}
          <div className="rounded-xl border border-[var(--hub-border-light)] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[var(--hub-text)]">Invoices due / overdue</h2>
              <Link href="/hub/billing" className="text-xs font-medium text-[var(--primary)] hover:underline">
                View all
              </Link>
            </div>
            <p className="mt-1 text-xs text-[var(--hub-muted)]">Sent and not yet paid</p>
            <ul className="mt-4 space-y-2">
              {invoicesDueOrOverdue.length === 0 ? (
                <li className="text-sm text-[var(--hub-muted)]">No invoices due or overdue.</li>
              ) : (
                invoicesDueOrOverdue.map((inv) => {
                  const isOverdue = inv.dueDate < now;
                  return (
                    <li key={inv.id} className="flex items-center justify-between text-sm">
                      <Link
                        href={`/hub/invoices/${inv.id}`}
                        className="font-medium text-[var(--hub-text)] hover:underline"
                      >
                        {inv.invoiceNumber}
                      </Link>
                      <span className={isOverdue ? "text-red-600" : "text-[var(--hub-muted)]"}>
                        {inv.client.companyName} · R {toNum(inv.totalAmount).toLocaleString("en-ZA")} · due {inv.dueDate.toLocaleDateString("en-ZA")}
                      </span>
                    </li>
                  );
                })
              )}
            </ul>
          </div>

          {/* Recent activity */}
          <div className="rounded-xl border border-[var(--hub-border-light)] bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-[var(--hub-text)]">Recent activity</h2>
            <p className="mt-1 text-xs text-[var(--hub-muted)]">Payments, invoices, and posts</p>
            <ul className="mt-4 space-y-3">
              {activityItems.length === 0 ? (
                <li className="text-sm text-[var(--hub-muted)]">No recent activity.</li>
              ) : (
                activityItems.map((item) => (
                  <li key={`${item.type}-${item.id}`} className="flex gap-3 text-sm">
                    <span className="mt-0.5 flex h-2 w-2 shrink-0 rounded-full bg-[var(--primary)]" aria-hidden />
                    <div className="min-w-0 flex-1">
                      {item.type === "payment" && (
                        <>
                          <p className="font-medium text-[var(--hub-text)]">
                            Payment received · R {item.amount.toLocaleString("en-ZA")}
                          </p>
                          <p className="text-xs text-[var(--hub-muted)]">{item.clientName} · {item.at.toLocaleDateString("en-ZA", { dateStyle: "short" })}</p>
                        </>
                      )}
                      {item.type === "invoice_sent" && (
                        <>
                          <p className="font-medium text-[var(--hub-text)]">Invoice sent · {item.invoiceNumber}</p>
                          <p className="text-xs text-[var(--hub-muted)]">{item.clientName} · {item.at.toLocaleDateString("en-ZA", { dateStyle: "short" })}</p>
                        </>
                      )}
                      {item.type === "post_published" && (
                        <>
                          <p className="font-medium text-[var(--hub-text)]">Post published</p>
                          <p className="truncate text-xs text-[var(--hub-muted)]">{item.clientName} · {item.caption.slice(0, 40)}{item.caption.length > 40 ? "…" : ""} · {item.at.toLocaleDateString("en-ZA", { dateStyle: "short" })}</p>
                        </>
                      )}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
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
