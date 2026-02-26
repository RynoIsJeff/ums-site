import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { publishPageFeedPost } from "@/lib/facebook";

/**
 * Worker: publish scheduled social posts (Facebook/META).
 * Call via Vercel Cron or external cron with CRON_SECRET.
 * GET or POST with header: Authorization: Bearer <CRON_SECRET>
 */
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
    return NextResponse.json(
      { error: "Cron endpoint unavailable" },
      { status: 503 }
    );
  }

  if (secret) {
    const auth = req.headers.get("authorization");
    const token = auth?.replace(/^Bearer\s+/i, "").trim();
    if (token !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const now = new Date();
  const posts = await prisma.socialPost.findMany({
    where: {
      status: "SCHEDULED",
      scheduledFor: { lte: now },
      socialPageId: { not: null },
      provider: "META",
    },
    include: {
      socialPage: true,
    },
  });

  const results: { id: string; status: string; error?: string }[] = [];

  for (const post of posts) {
    const page = post.socialPage;
    if (!page?.pageAccessTokenEncrypted || !page.pageExternalId) {
      await prisma.socialPost.update({
        where: { id: post.id },
        data: { status: "FAILED", lastError: "Page or token missing" },
      });
      results.push({ id: post.id, status: "FAILED", error: "Page or token missing" });
      continue;
    }

    await prisma.socialPost.update({
      where: { id: post.id },
      data: { status: "PROCESSING" },
    });

    const result = await publishPageFeedPost(
      page.pageExternalId,
      page.pageAccessTokenEncrypted,
      post.caption
    );

    if (result.ok) {
      await prisma.socialPost.update({
        where: { id: post.id },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
          externalPostId: result.postId,
          publishedUrl: result.permalink,
          lastError: null,
        },
      });
      results.push({ id: post.id, status: "PUBLISHED" });
    } else {
      await prisma.socialPost.update({
        where: { id: post.id },
        data: {
          status: "FAILED",
          lastError: result.error,
        },
      });
      results.push({ id: post.id, status: "FAILED", error: result.error });
    }
  }

  return NextResponse.json({
    ok: true,
    processed: results.length,
    results,
  });
}
