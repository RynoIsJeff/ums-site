import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getSession, toAuthScope } from "@/lib/auth";
import { canAccessClient } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { toNum } from "@/lib/utils";

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

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      client: true,
      lineItems: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!invoice || !canAccessClient(scope, invoice.clientId)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 50;
  let y = height - margin;

  const drawText = (text: string, options?: { x?: number; y?: number; size?: number; bold?: boolean }) => {
    const size = options?.size ?? 11;
    const x = options?.x ?? margin;
    const fontToUse = options?.bold ? fontBold : font;
    const yPos = options?.y ?? y;

    page.drawText(text, {
      x,
      y: yPos,
      size,
      font: fontToUse,
      color: rgb(0, 0, 0),
    });

    if (!options?.y) {
      y -= size + 6;
    }
  };

  const total = toNum(invoice.totalAmount);
  const issueDateStr = invoice.issueDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Header
  drawText("Invoice", { x: width - margin - 80, size: 20, bold: true });
  y -= 10;

  // Company info
  drawText("ULTIMATE MARKETING SMASH (PTY) LTD.", { bold: true });
  drawText("Phone: +27 79 490 5070", { size: 10 });
  drawText("Email: Manager@ultimatemarketingsmash.com", { size: 10 });
  drawText("447 Suikerbekkie Ave, Pongola, 3170, KZN, South Africa", { size: 10 });
  y -= 6;

  // Invoice meta
  drawText(`Invoice number: ${invoice.invoiceNumber}`, { size: 11 });
  drawText(`Issue date: ${issueDateStr}`, { size: 11 });
  y -= 6;

  // Client
  drawText(`Bill to: ${invoice.client.companyName}`, { size: 11, bold: true });
  y -= 6;

  // Line items header
  const descX = margin;
  const qtyX = width - margin - 200;
  const unitX = width - margin - 120;
  const totalX = width - margin - 40;

  drawText("Description", { x: descX, size: 11, bold: true });
  drawText("Qty", { x: qtyX, size: 11, bold: true });
  drawText("Unit price", { x: unitX, size: 11, bold: true });
  drawText("Total", { x: totalX, size: 11, bold: true });
  y -= 4;

  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 1,
    color: rgb(0.7, 0.7, 0.7),
  });
  y -= 12;

  // Line items rows
  invoice.lineItems.forEach((line) => {
    if (y < margin + 80) {
      // new page if we run out of space
      y = height - margin;
    }

    const qty = Number(line.quantity);
    const unitPrice = toNum(line.unitPrice);
    const lineTotal = toNum(line.lineTotal);

    drawText(line.description, { x: descX, size: 10 });
    drawText(qty.toString(), { x: qtyX, size: 10 });
    drawText(`R ${unitPrice.toLocaleString("en-ZA")}`, { x: unitX, size: 10 });
    drawText(`R ${lineTotal.toLocaleString("en-ZA")}`, { x: totalX, size: 10 });
  });

  y -= 10;

  // Totals
  drawText(`Subtotal: R ${toNum(invoice.subtotalAmount).toLocaleString("en-ZA")}`, {
    x: unitX,
    size: 11,
  });

  if (invoice.includeVat && toNum(invoice.vatAmount) > 0) {
    drawText(
      `VAT (${Number(invoice.vatRate)}%): R ${toNum(invoice.vatAmount).toLocaleString("en-ZA")}`,
      { x: unitX, size: 11 },
    );
  }

  drawText(`Total: R ${total.toLocaleString("en-ZA")}`, {
    x: unitX,
    size: 12,
    bold: true,
  });

  y -= 6;

  // Bank details / notes
  drawText("Pay to: First National Bank (FNB)", { size: 10 });
  drawText("Account Number: 63067511387", { size: 10 });
  drawText("Branch Code: 250655", { size: 10 });

  if (invoice.notes) {
    y -= 6;
    drawText("Notes:", { size: 10, bold: true });
    drawText(invoice.notes, { size: 10 });
  }

  const pdfBytes = await pdfDoc.save();
  const filename = `invoice-${invoice.invoiceNumber}.pdf`;

  return new NextResponse(pdfBytes as any, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

