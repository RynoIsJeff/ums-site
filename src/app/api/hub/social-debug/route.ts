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

  try {
    results.posts = await prisma.socialPost.findMany({
      where: clientIdWhere(scope),
      orderBy: [{ status: "asc" }, { scheduledFor: "desc" }, { createdAt: "desc" }],
      take: 20,
      include: {
        client: { select: { id: true, companyName: true } },
        socialPage: { select: { id: true, pageName: true } },
      },
    });
    results.postsOk = true;
  } catch (e) {
    results.postsError = e instanceof Error ? e.message : String(e);
  }

  try {
    results.pages = await prisma.socialPage.findMany({
      where: { socialAccount: clientScope },
      include: {
        socialAccount: { select: { clientId: true } },
      },
    });
    results.pagesOk = true;
  } catch (e) {
    results.pagesError = e instanceof Error ? e.message : String(e);
  }

  try {
    results.clients = await prisma.client.findMany({
      where: clientWhere(scope),
      orderBy: { companyName: "asc" },
      select: { id: true, companyName: true },
    });
    results.clientsOk = true;
  } catch (e) {
    results.clientsError = e instanceof Error ? e.message : String(e);
  }

  // Check if SocialPostMedia table exists
  try {
    await prisma.socialPostMedia.count();
    results.socialPostMediaTableOk = true;
  } catch (e) {
    results.socialPostMediaTableError = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json(results, { status: 200 });
}
