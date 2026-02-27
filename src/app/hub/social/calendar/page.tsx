import Link from "next/link";
import { getSession } from "@/lib/auth";
import { toAuthScope } from "@/lib/auth";
import { clientIdWhere, clientWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { SocialCalendarClient } from "./_components/SocialCalendarClient";

export const metadata = {
  title: "Scheduling Calendar | UMS Hub",
};

type PageProps = { searchParams: Promise<{ month?: string; year?: string; pages?: string }> };

export default async function SocialCalendarPage({ searchParams }: PageProps) {
  const { user } = await getSession();
  if (!user) return null;

  const params = await searchParams;
  const now = new Date();
  const month = Math.min(12, Math.max(1, parseInt(params.month ?? String(now.getMonth() + 1), 10) || now.getMonth() + 1));
  const year = parseInt(params.year ?? String(now.getFullYear()), 10) || now.getFullYear();

  const selectedPageIds = params.pages ? params.pages.split(",").filter(Boolean) : [];

  const scope = toAuthScope(user);

  const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);

  const [posts, pages, clients] = await Promise.all([
    prisma.socialPost.findMany({
      where: {
        ...clientIdWhere(scope),
        status: { in: ["DRAFT", "SCHEDULED"] },
        scheduledFor: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        ...(selectedPageIds.length > 0 ? { socialPageId: { in: selectedPageIds } } : {}),
      },
      include: {
        client: { select: { id: true, companyName: true } },
        socialPage: { select: { id: true, pageName: true } },
      },
      orderBy: { scheduledFor: "asc" },
    }),
    prisma.socialPage.findMany({
      where: { socialAccount: clientIdWhere(scope), provider: "META" },
      include: { socialAccount: { select: { clientId: true, client: { select: { companyName: true } } } } },
    }),
    prisma.client.findMany({
      where: clientWhere(scope),
      orderBy: { companyName: "asc" },
      select: { id: true, companyName: true },
    }),
  ]);

  const pageOptions = pages.map((p) => ({
    id: p.id,
    pageName: p.pageName,
    clientId: p.socialAccount.clientId,
    clientName: p.socialAccount.client.companyName,
  }));

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  const baseUrl = "/hub/social/calendar";

  return (
    <section className="py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link href="/hub/social" className="text-sm text-(--hub-muted) hover:text-(--hub-text)">
          ← Content Planner
        </Link>
        <Link
          href="/hub/social/posts/new"
          className="rounded-lg bg-(--primary) px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90"
        >
          New post
        </Link>
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-(--hub-text)">Scheduling Calendar</h1>
      <p className="mt-1 text-sm text-(--hub-muted)">
        Filter by page, click a date to schedule, or click a post to view or edit.
      </p>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link
            href={`${baseUrl}?month=${prevMonth}&year=${prevYear}${selectedPageIds.length ? `&pages=${selectedPageIds.join(",")}` : ""}`}
            className="rounded-lg border border-(--hub-border-light) px-3 py-2 text-sm font-medium hover:bg-black/5"
          >
            ← {new Date(prevYear, prevMonth - 1).toLocaleString("default", { month: "short" })} {prevYear}
          </Link>
          <span className="px-2 text-sm font-semibold">
            {new Date(year, month - 1).toLocaleString("default", { month: "long" })} {year}
          </span>
          <Link
            href={`${baseUrl}?month=${nextMonth}&year=${nextYear}${selectedPageIds.length ? `&pages=${selectedPageIds.join(",")}` : ""}`}
            className="rounded-lg border border-(--hub-border-light) px-3 py-2 text-sm font-medium hover:bg-black/5"
          >
            {new Date(nextYear, nextMonth - 1).toLocaleString("default", { month: "short" })} {nextYear} →
          </Link>
        </div>
        <Link
          href={`${baseUrl}?month=${now.getMonth() + 1}&year=${now.getFullYear()}${selectedPageIds.length ? `&pages=${selectedPageIds.join(",")}` : ""}`}
          className="text-sm text-(--hub-muted) hover:text-(--hub-text)"
        >
          Today
        </Link>
      </div>

      <div className="mt-6">
        <SocialCalendarClient
          month={month}
          year={year}
          posts={posts.map((p) => ({
            id: p.id,
            caption: p.caption,
            status: p.status,
            scheduledFor: p.scheduledFor!.toISOString(),
            clientName: p.client.companyName,
            clientId: p.client.id,
            pageId: p.socialPage?.id ?? "",
            pageName: p.socialPage?.pageName ?? "—",
          }))}
          pages={pageOptions}
          clients={clients}
          selectedPageIds={selectedPageIds}
          baseUrl={baseUrl}
        />
      </div>
    </section>
  );
}
