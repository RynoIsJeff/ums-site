import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Worker: delete Supabase Storage files for social media posts older than 60 days.
 * Runs daily at 03:00 UTC via Vercel Cron.
 * GET or POST with header: Authorization: Bearer <CRON_SECRET>
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BUCKET = "social-media";
const RETENTION_DAYS = 60;

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

  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);

    const oldMedia = await prisma.socialPostMedia.findMany({
      where: { createdAt: { lt: cutoff } },
      select: { id: true, mediaUrl: true },
    });

    if (oldMedia.length === 0) {
      return NextResponse.json({ deleted: 0, message: "Nothing to clean up." });
    }

    // Extract the path-within-bucket from each full public URL.
    // URL shape: https://<project>.supabase.co/storage/v1/object/public/social-media/<path>
    const bucketPrefix = `/storage/v1/object/public/${BUCKET}/`;
    const paths: string[] = [];
    for (const m of oldMedia) {
      try {
        const url = new URL(m.mediaUrl);
        const idx = url.pathname.indexOf(bucketPrefix);
        if (idx !== -1) paths.push(decodeURIComponent(url.pathname.slice(idx + bucketPrefix.length)));
      } catch {
        // Unparseable URL — skip storage delete but still clean the DB row
      }
    }

    // Remove files from Storage in batches of 100 (SDK limit)
    const supabase = createAdminClient();
    let storageDeleted = 0;
    let storageErrors = 0;

    for (let i = 0; i < paths.length; i += 100) {
      const batch = paths.slice(i, i + 100);
      const { error } = await supabase.storage.from(BUCKET).remove(batch);
      if (error) {
        console.error("[storage-cleanup] batch remove error:", error.message);
        storageErrors += batch.length;
      } else {
        storageDeleted += batch.length;
      }
    }

    // Always delete the DB records — even if a file was already missing from Storage
    const { count } = await prisma.socialPostMedia.deleteMany({
      where: { id: { in: oldMedia.map((m) => m.id) } },
    });

    console.log(`[storage-cleanup] deleted ${count} media rows, ${storageDeleted} storage files`);

    return NextResponse.json({
      deleted: count,
      storageDeleted,
      storageErrors,
      cutoff: cutoff.toISOString(),
      message: `Cleaned up ${count} media records (${storageDeleted} files removed from storage).`,
    });
  } catch (err) {
    console.error("[storage-cleanup]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
