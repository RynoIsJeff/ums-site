import Link from "next/link";
import { getSession } from "@/lib/auth";
import { toAuthScope } from "@/lib/auth";
import { clientIdWhere, clientWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { ConnectFacebookForm } from "./_components/ConnectFacebookForm";
import { StatusBadge } from "@/app/hub/_components/StatusBadge";
import {
  Calendar,
  Plus,
  Clock,
  CheckCircle2,
  FileText,
  Share2,
} from "lucide-react";

export const metadata = {
  title: "Social | UMS Hub",
};

export default async function HubSocialPage() {
  const { user } = await getSession();
  if (!user) return null;

  const scope = toAuthScope(user);
  const clientScope = scope.role === "ADMIN" ? {} : { clientId: { in: scope.assignedClientIds ?? [] } };

  const [posts, pages, clients] = await Promise.all([
    prisma.socialPost.findMany({
      where: clientIdWhere(scope),
      orderBy: [{ status: "asc" }, { scheduledFor: "desc" }, { createdAt: "desc" }],
      take: 20,
      include: {
        client: { select: { id: true, companyName: true } },
        socialPage: { select: { id: true, pageName: true } },
      },
    }),
    prisma.socialPage.findMany({
      where: { socialAccount: clientScope },
      include: {
        socialAccount: { select: { clientId: true } },
      },
    }),
    prisma.client.findMany({
      where: clientWhere(scope),
      orderBy: { companyName: "asc" },
      select: { id: true, companyName: true },
    }),
  ]);

  const scheduledCount = posts.filter((p) => p.status === "SCHEDULED").length;
  const draftCount = posts.filter((p) => p.status === "DRAFT").length;
  const publishedToday = posts.filter(
    (p) =>
      p.status === "PUBLISHED" &&
      p.publishedAt &&
      new Date(p.publishedAt).toDateString() === new Date().toDateString()
  ).length;

  return (
    <section className="py-6">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--hub-text)]">
            Content Planner
          </h1>
          <p className="mt-1 text-sm text-[var(--hub-muted)]">
            Schedule and manage your Facebook posts. Connected to Meta.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/hub/social/calendar"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--hub-border-light)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--hub-text)] shadow-sm transition-colors hover:bg-black/5"
          >
            <Calendar className="h-4 w-4" />
            Calendar
          </Link>
          <Link
            href="/hub/social/posts/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Create post
          </Link>
        </div>
      </div>

      {/* Stats cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[var(--hub-border-light)] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--hub-text)]">{scheduledCount}</p>
              <p className="text-sm text-[var(--hub-muted)]">Scheduled</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--hub-border-light)] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50">
              <FileText className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--hub-text)]">{draftCount}</p>
              <p className="text-sm text-[var(--hub-muted)]">Drafts</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--hub-border-light)] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--hub-text)]">{publishedToday}</p>
              <p className="text-sm text-[var(--hub-muted)]">Published today</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--hub-border-light)] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--meta-blue)]/10">
              <Share2 className="h-5 w-5 text-[var(--meta-blue)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--hub-text)]">{pages.length}</p>
              <p className="text-sm text-[var(--hub-muted)]">Connected pages</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Recent posts — Facebook-style cards */}
          <div className="rounded-xl border border-[var(--hub-border-light)] bg-white shadow-sm overflow-hidden">
            <div className="border-b border-[var(--hub-border-light)] bg-black/[0.02] px-5 py-4">
              <h2 className="text-base font-semibold text-[var(--hub-text)]">Recent posts</h2>
              <p className="text-sm text-[var(--hub-muted)]">Scheduled, published, and drafts</p>
            </div>
            <div className="divide-y divide-[var(--hub-border-light)]">
              {posts.length === 0 ? (
                <div className="p-8 text-center">
                  <Share2 className="mx-auto h-12 w-12 text-[var(--hub-muted)]" />
                  <p className="mt-3 text-sm font-medium text-[var(--hub-text)]">No posts yet</p>
                  <p className="mt-1 text-sm text-[var(--hub-muted)]">
                    Connect a Facebook page and create your first post.
                  </p>
                  <Link
                    href="/hub/social/posts/new"
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                  >
                    <Plus className="h-4 w-4" />
                    Create post
                  </Link>
                </div>
              ) : (
                posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/hub/social/posts/${post.id}`}
                    className="block px-5 py-4 transition-colors hover:bg-black/[0.02]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <p className="flex-1 text-sm text-[var(--hub-text)] line-clamp-2">
                        {post.caption}
                      </p>
                      <div className="flex shrink-0 items-center gap-2">
                        <StatusBadge status={post.status} />
                        {post.socialPage && (
                          <span className="text-xs text-[var(--hub-muted)]">{post.socialPage.pageName}</span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-[var(--hub-muted)]">
                      {post.scheduledFor && (
                        <span>
                          {post.scheduledFor.toLocaleString("en-ZA", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </span>
                      )}
                      {post.client && (
                        <Link
                          href={`/hub/clients/${post.client.id}`}
                          className="hover:text-[var(--primary)] hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {post.client.companyName}
                        </Link>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          <ConnectFacebookForm clients={clients} />
        </div>

        {/* Sidebar — Connected pages */}
        <div className="space-y-6">
          <div className="rounded-xl border border-[var(--hub-border-light)] bg-white shadow-sm overflow-hidden">
            <div className="border-b border-[var(--hub-border-light)] bg-black/[0.02] px-5 py-4">
              <h2 className="text-base font-semibold text-[var(--hub-text)]">Facebook pages</h2>
              <p className="text-sm text-[var(--hub-muted)]">Manage in Pages</p>
            </div>
            <div className="p-4">
              {pages.length === 0 ? (
                <p className="text-sm text-[var(--hub-muted)]">
                  No pages connected. Connect one below to start scheduling.
                </p>
              ) : (
                <ul className="space-y-2">
                  {pages.slice(0, 5).map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/hub/clients/${p.socialAccount.clientId}`}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-black/5"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--meta-blue)]/15 text-[var(--meta-blue)] font-semibold">
                          {p.pageName[0]}
                        </div>
                        <span className="font-medium text-[var(--hub-text)]">{p.pageName}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {pages.length > 0 && (
                <Link
                  href="/hub/social/pages"
                  className="mt-3 block text-center text-sm font-medium text-[var(--primary)] hover:underline"
                >
                  View all pages →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
