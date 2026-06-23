import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extendUserToken, listManagedPages } from "@/lib/facebook";

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

  try {
    // Find accounts with a user token that expires within 15 days
    const soon = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
    const accounts = await prisma.socialAccount.findMany({
      where: {
        accessTokenEncrypted: { not: null },
        tokenExpiresAt: { not: null, lt: soon },
      },
      include: {
        pages: { select: { id: true, pageExternalId: true } },
      },
    });

    const results: { accountId: string; status: string; pagesUpdated?: number; error?: string }[] = [];

    for (const account of accounts) {
      if (!account.accessTokenEncrypted) continue;

      const extendResult = await extendUserToken(account.accessTokenEncrypted);
      if (!extendResult.ok) {
        results.push({ accountId: account.id, status: "FAILED", error: extendResult.error });
        continue;
      }

      const newExpiresAt = new Date(Date.now() + extendResult.expiresIn * 1000);
      await prisma.socialAccount.update({
        where: { id: account.id },
        data: {
          accessTokenEncrypted: extendResult.accessToken,
          tokenExpiresAt: newExpiresAt,
        },
      });

      // Refresh page tokens for all linked pages
      const pagesResult = await listManagedPages(extendResult.accessToken);
      if (!pagesResult.ok) {
        results.push({
          accountId: account.id,
          status: "TOKEN_REFRESHED_PAGES_FAILED",
          error: pagesResult.error,
        });
        continue;
      }

      let pagesUpdated = 0;
      for (const page of account.pages) {
        const fresh = pagesResult.pages.find((p) => p.id === page.pageExternalId);
        if (fresh) {
          await prisma.socialPage.update({
            where: { id: page.id },
            data: { pageAccessTokenEncrypted: fresh.accessToken },
          });
          pagesUpdated++;
        }
      }

      results.push({ accountId: account.id, status: "OK", pagesUpdated });
    }

    return NextResponse.json({ ok: true, checked: accounts.length, results });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[social-token-refresh cron] Unhandled error:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
