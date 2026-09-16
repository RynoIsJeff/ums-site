import { NextRequest, NextResponse } from "next/server";
import { getSession, toAuthScope } from "@/lib/auth";
import { canAccessClient } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { renderDocumentPdf } from "@/lib/document-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const { user } = await getSession();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const scope = toAuthScope(user);

  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      client: true,
      lineItems: { orderBy: { createdAt: "asc" } },
      store: true,
    },
  });

  if (!quote || !canAccessClient(scope, quote.clientId)) {
    return new NextResponse("Not found", { status: 404 });
  }

  // Decide if this should be inline (view) or attachment (download)
  const url = new URL(_req.url);
  const asAttachment = url.searchParams.get("download") === "1";

  const pdfBytes = await renderDocumentPdf({
    kind: "QUOTATION",
    number: quote.quoteNumber,
    issueDate: quote.issueDate,
    endDate: quote.validUntil,
    clientName: quote.client.companyName,
    store: quote.store,
    lineItems: quote.lineItems,
    totalAmount: quote.totalAmount,
  });
  const filename = `quote-${quote.quoteNumber}.pdf`;

  return new NextResponse(pdfBytes as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${asAttachment ? "attachment" : "inline"}; filename="${filename}"`,
    },
  });
}
