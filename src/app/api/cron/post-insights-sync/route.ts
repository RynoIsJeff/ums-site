import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPostInsights, getPageFansOnline } from "@/lib/facebook";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  return runWorker(req);
}

export async function POST(req: Request) {
  return runWorker(req);
}

async function runWorker(req: Request) {
  const secret = process.env.CRON_SECRET;
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction && !secret) {
    return NextResponse.json({ error: "Cron endpoint unavailable" }, { status: 503 });
  }
  if (secret) {
    const auth = req.headers.get("authorization");
    const token = auth?.replace(/^Bearer\s+/i, "").trim();
    if (token !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  let insightsSynced = 0;
  let insightsFailed = 0;
  let pagesSynced = 0;

  try {
    // --- 1. Sync post insights for recently published posts without insights yet ---
    const postsToSync = await prisma.socialPost.findMany({
      where: {
        status: "PUBLISHED",
        externalPostId: { not: null },
        publishedAt: { gte: thirtyDaysAgo },
        socialPage: { isNot: null },
        postInsight: null,
      },
      include: {
        socialPage: { select: { pageAccessTokenEncrypted: true } },
      },
      take: 100,
      orderBy: { publishedAt: "desc" },
    });

    for (const post of postsToSync) {
      if (!post.externalPostId || !post.socialPage?.pageAccessTokenEncrypted) continue;
      try {
        const pageToken = post.socialPage.pageAccessTokenEncrypted;
        const insights = await getPostInsights(post.externalPostId, pageToken);
        await prisma.postInsight.upsert({
          where: { socialPostId: post.id },
          create: { socialPostId: post.id, ...insights },
          update: { ...insights, fetchedAt: now },
        });
        insightsSynced++;
      } catch {
        insightsFailed++;
      }
    }

    // --- 2. Refresh fans-online data for stale pages ---
    const allMetaPages = await prisma.socialPage.findMany({
      where: { provider: "META" },
      select: {
        id: true,
        pageExternalId: true,
        pageAccessTokenEncrypted: true,
        metadata: true,
      },
      take: 10,
    });

    for (const page of allMetaPages) {
      if (!page.pageAccessTokenEncrypted) continue;

      const meta = (page.metadata ?? {}) as Record<string, unknown>;
      const lastFetched = meta.fansOnlineFetchedAt
        ? new Date(meta.fansOnlineFetchedAt as string)
        : null;

      if (lastFetched && lastFetched > sevenDaysAgo) continue;

      try {
        const fansOnline = await getPageFansOnline(page.pageExternalId, page.pageAccessTokenEncrypted);

        if (Object.keys(fansOnline).length > 0) {
          await prisma.socialPage.update({
            where: { id: page.id },
            data: {
              metadata: {
                ...meta,
                fansOnline,
                fansOnlineFetchedAt: now.toISOString(),
              },
            },
          });
          pagesSynced++;
        }
      } catch {
        // non-fatal
      }
    }

    return NextResponse.json({
      ok: true,
      insightsSynced,
      insightsFailed,
      pagesSynced,
    });
  } catch (err) {
    console.error("[post-insights-sync]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
