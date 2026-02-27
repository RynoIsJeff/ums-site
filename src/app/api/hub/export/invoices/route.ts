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

  const where: Prisma.InvoiceWhereInput = { ...scopeWhere };
  const search = searchParams.get("search");
  const status = searchParams.get("status");
  const clientId = searchParams.get("clientId");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  if (search) where.invoiceNumber = { contains: search, mode: "insensitive" };
  if (status) where.status = status as "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "VOID";
  if (clientId) where.clientId = clientId;
  if (dateFrom || dateTo) {
    where.dueDate = {
      ...(dateFrom && { gte: new Date(dateFrom) }),
      ...(dateTo && { lte: new Date(dateTo) }),
    };
  }

  const invoices = await prisma.invoice.findMany({
    where,
    orderBy: [{ status: "asc" }, { dueDate: "desc" }],
    include: { client: { select: { companyName: true } } },
  });

  const headers = [
    "Invoice Number",
    "Client",
    "Issue Date",
    "Due Date",
    "Status",
    "Subtotal",
    "VAT",
    "Total",
    "Currency",
  ];
  const rows = invoices.map((inv) => [
    inv.invoiceNumber,
    inv.client.companyName,
    inv.issueDate.toISOString().split("T")[0],
    inv.dueDate.toISOString().split("T")[0],
    inv.status,
    toNum(inv.subtotalAmount),
    toNum(inv.vatAmount),
    toNum(inv.totalAmount),
    inv.currency,
  ]);

  const csv =
    headers.map(escapeCsv).join(",") +
    "\n" +
    rows.map((r) => r.map(escapeCsv).join(",")).join("\n");

  const filename = `invoices-${new Date().toISOString().split("T")[0]}.csv`;
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
