import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUrl = process.env.DATABASE_URL ?? "(not set)";
  const safeUrl = dbUrl.replace(/:([^@]+)@/, ":***@"); // mask password

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, db: safeUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, db: safeUrl, error: message }, { status: 500 });
  }
}
