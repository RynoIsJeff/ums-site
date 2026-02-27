import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { toAuthScope } from "@/lib/auth";
import { clientIdWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { toNum } from "@/lib/utils";

export const dynamic = "force-dynamic";

function escapeCsv(val: string | number): string {
  const s = String(val ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(req: NextRequest) {
  const { user } = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scope = toAuthScope(user);
  const scopeWhere = clientIdWhere(scope);
  const { searchParams } = new URL(req.url);

  const where: Prisma.PaymentWhereInput = { ...scopeWhere };
  const clientId = searchParams.get("clientId");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  if (clientId) where.clientId = clientId;
  if (dateFrom || dateTo) {
    where.paidAt = {
      ...(dateFrom && { gte: new Date(dateFrom) }),
      ...(dateTo && { lte: new Date(dateTo) }),
    };
  }

  const payments = await prisma.payment.findMany({
    where,
    orderBy: { paidAt: "desc" },
    include: {
      client: { select: { companyName: true } },
      invoice: { select: { invoiceNumber: true } },
    },
  });

  const headers = [
    "Date",
    "Client",
    "Invoice",
    "Method",
    "Amount",
    "Reference",
    "Notes",
  ];
  const rows = payments.map((p) => [
    p.paidAt.toISOString().split("T")[0],
    p.client.companyName,
    p.invoice?.invoiceNumber ?? "",
    p.method,
    toNum(p.amount),
    p.reference ?? "",
    p.notes ?? "",
  ]);

  const csv =
    headers.map(escapeCsv).join(",") +
    "\n" +
    rows.map((r) => r.map(escapeCsv).join(",")).join("\n");

  const filename = `payments-${new Date().toISOString().split("T")[0]}.csv`;
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
