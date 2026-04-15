import { NextRequest, NextResponse } from "next/server";
import { requireHubAuth } from "@/lib/auth";
import { taskWhere, clientWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { scope } = await requireHubAuth();

    const { searchParams } = req.nextUrl;
    const q = searchParams.get("q")?.trim() ?? "";
    const clientId = searchParams.get("clientId")?.trim() ?? "";

    const baseWhere = taskWhere(scope) as Prisma.TaskWhereInput;

    const where: Prisma.TaskWhereInput = {
      ...baseWhere,
      status: { not: "DONE" },
    };

    if (clientId) {
      where.clientId = clientId;
    }

    if (q) {
      where.title = { contains: q, mode: "insensitive" };
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { title: "asc" },
      select: { id: true, title: true, clientId: true },
      take: 30,
    });

    return NextResponse.json({ tasks });
  } catch {
    return NextResponse.json({ tasks: [] }, { status: 401 });
  }
}
