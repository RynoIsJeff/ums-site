import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { getSession, toAuthScope } from "@/lib/auth";
import { canAccessClient } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { toNum } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  context: { params: { id: string } },
) {
  const { user } = await getSession();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const scope = toAuthScope(user);

  const invoice = await prisma.invoice.findUnique({
    where: { id: context.params.id },
    include: {
      client: true,
      lineItems: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!invoice || !canAccessClient(scope, invoice.clientId)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const chunks: Buffer[] = [];

  doc.on("data", (chunk) => chunks.push(chunk as Buffer));

  const pdfBufferPromise = new Promise<Buffer>((resolve) => {
    doc.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
  });

  const total = toNum(invoice.totalAmount);
  const issueDateStr = invoice.issueDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Header
  doc
    .fontSize(20)
    .text("Invoice", { align: "right" })
    .moveDown();

  // Company info (simple, matches branding roughly)
  doc
    .fontSize(12)
    .text("ULTIMATE MARKETING SMASH (PTY) LTD.", { align: "left" })
    .moveDown(0.5);

  doc
    .fontSize(10)
    .text("Phone: +27 79 490 5070")
    .text("Email: Manager@ultimatemarketingsmash.com")
    .text("447 Suikerbekkie Ave, Pongola, 3170, KZN, South Africa")
    .moveDown();

  // Invoice meta
  doc
    .fontSize(11)
    .text(`Invoice number: ${invoice.invoiceNumber}`)
    .text(`Issue date: ${issueDateStr}`)
    .moveDown();

  // Client
  doc
    .fontSize(11)
    .text(`Bill to: ${invoice.client.companyName}`)
    .moveDown();

  // Line items header
  doc
    .fontSize(11)
    .text("Description", 50, doc.y, { continued: true })
    .text("Qty", 280, doc.y, { width: 60, align: "right", continued: true })
    .text("Unit price", 340, doc.y, { width: 80, align: "right", continued: true })
    .text("Total", 430, doc.y, { width: 100, align: "right" });

  doc.moveTo(50, doc.y + 2).lineTo(550, doc.y + 2).stroke();
  doc.moveDown(0.5);

  // Line items rows
  invoice.lineItems.forEach((line) => {
    const qty = Number(line.quantity);
    const unitPrice = toNum(line.unitPrice);
    const lineTotal = toNum(line.lineTotal);

    doc
      .fontSize(10)
      .text(line.description, 50, doc.y, {
        width: 220,
        continued: true,
      })
      .text(qty.toString(), 280, doc.y, {
        width: 60,
        align: "right",
        continued: true,
      })
      .text(`R ${unitPrice.toLocaleString("en-ZA")}`, 340, doc.y, {
        width: 80,
        align: "right",
        continued: true,
      })
      .text(`R ${lineTotal.toLocaleString("en-ZA")}`, 430, doc.y, {
        width: 100,
        align: "right",
      });

    doc.moveDown(0.5);
  });

  doc.moveDown();

  // Totals
  doc
    .fontSize(11)
    .text(`Subtotal: R ${toNum(invoice.subtotalAmount).toLocaleString("en-ZA")}`, {
      align: "right",
    });

  if (invoice.includeVat && toNum(invoice.vatAmount) > 0) {
    doc.text(
      `VAT (${Number(invoice.vatRate)}%): R ${toNum(
        invoice.vatAmount,
      ).toLocaleString("en-ZA")}`,
      { align: "right" },
    );
  }

  doc
    .fontSize(12)
    .text(`Total: R ${total.toLocaleString("en-ZA")}`, {
      align: "right",
    })
    .moveDown();

  // Bank details / notes
  doc
    .fontSize(10)
    .text("Pay to: First National Bank (FNB)")
    .text("Account Number: 63067511387")
    .text("Branch Code: 250655")
    .moveDown();

  if (invoice.notes) {
    doc.fontSize(10).text("Notes:", { underline: true }).moveDown(0.3);
    doc.fontSize(10).text(invoice.notes);
  }

  doc.end();

  const pdfBuffer = await pdfBufferPromise;
  const filename = `invoice-${invoice.invoiceNumber}.pdf`;

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

