import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { toAuthScope } from "@/lib/auth";
import { clientIdWhere, clientWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const scope = toAuthScope(user);
  const clientScope = scope.role === "ADMIN" ? {} : { clientId: { in: scope.assignedClientIds ?? [] } };

  const results: Record<string, unknown> = {};

  // ── Planner page queries ──────────────────────────────────────────────────

  try {
    await prisma.socialPost.findMany({
      where: clientIdWhere(scope),
      orderBy: [{ status: "asc" }, { scheduledFor: "desc" }, { createdAt: "desc" }],
      take: 20,
      include: {
        client: { select: { id: true, companyName: true } },
        socialPage: { select: { id: true, pageName: true } },
      },
    });
    results.planner_postsOk = true;
  } catch (e) {
    results.planner_postsError = e instanceof Error ? e.message : String(e);
  }

  try {
    await prisma.socialPage.findMany({
      where: { socialAccount: clientScope },
      include: { socialAccount: { select: { clientId: true } } },
    });
    results.planner_pagesOk = true;
  } catch (e) {
    results.planner_pagesError = e instanceof Error ? e.message : String(e);
  }

  try {
    await prisma.client.findMany({
      where: clientWhere(scope),
      orderBy: { companyName: "asc" },
      select: { id: true, companyName: true },
    });
    results.planner_clientsOk = true;
  } catch (e) {
    results.planner_clientsError = e instanceof Error ? e.message : String(e);
  }

  // ── Calendar page queries ─────────────────────────────────────────────────

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);

  try {
    await prisma.socialPost.findMany({
      where: {
        ...clientIdWhere(scope),
        status: { in: ["DRAFT", "SCHEDULED", "PUBLISHED", "FAILED"] },
        scheduledFor: { gte: startOfMonth, lte: endOfMonth },
      },
      include: {
        client: { select: { id: true, companyName: true } },
        socialPage: { select: { id: true, pageName: true } },
      },
      orderBy: { scheduledFor: "asc" },
    });
    results.calendar_postsOk = true;
  } catch (e) {
    results.calendar_postsError = e instanceof Error ? e.message : String(e);
  }

  try {
    // This is the exact query from calendar/page.tsx — note nested client inside socialAccount
    await prisma.socialPage.findMany({
      where: { socialAccount: clientIdWhere(scope), provider: "META" },
      include: {
        socialAccount: {
          select: { clientId: true, client: { select: { companyName: true } } },
        },
      },
    });
    results.calendar_pagesOk = true;
  } catch (e) {
    results.calendar_pagesError = e instanceof Error ? e.message : String(e);
  }

  // ── Post detail query (includes media) ───────────────────────────────────

  try {
    // Just check the first post if any
    const firstPost = await prisma.socialPost.findFirst({
      where: clientIdWhere(scope),
      include: {
        client: { select: { id: true, companyName: true } },
        socialPage: { select: { id: true, pageName: true } },
        media: true,
      },
    });
    results.postDetail_mediaCount = firstPost?.media?.length ?? 0;
    results.postDetail_ok = true;
  } catch (e) {
    results.postDetail_error = e instanceof Error ? e.message : String(e);
  }

  // ── SocialPostMedia table ─────────────────────────────────────────────────

  try {
    await prisma.socialPostMedia.count();
    results.socialPostMediaTableOk = true;
  } catch (e) {
    results.socialPostMediaTableError = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json(results, { status: 200 });
}
