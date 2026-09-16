import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs/promises";
import path from "path";
import { toNum } from "@/lib/utils";

/**
 * Shared A4 document renderer for invoices and quotations — same UMS letterhead,
 * items table, and totals box; the kind decides the title, the date labels, and
 * whether banking details or quote terms close the page.
 */
export type PdfDocumentKind = "INVOICE" | "QUOTATION";

export type PdfDocumentLine = {
  description: string;
  quantity: unknown;
  unitPrice: unknown;
  lineTotal: unknown;
};

export type PdfDocumentInput = {
  kind: PdfDocumentKind;
  /** Invoice number or quote number. */
  number: string;
  issueDate: Date;
  /** Due date for invoices, valid-until date for quotations. */
  endDate: Date;
  clientName: string;
  store?: { name: string; address: string | null; phone: string | null } | null;
  lineItems: PdfDocumentLine[];
  totalAmount: unknown;
};

export async function renderDocumentPdf(doc: PdfDocumentInput): Promise<Uint8Array> {
  const isQuote = doc.kind === "QUOTATION";
  const total = toNum(doc.totalAmount);
  const issueDateStr = doc.issueDate.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const endDateStr = doc.endDate.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 50;
  // UMS brand blues (primary for headings, secondary for accents)
  const primaryBlue = rgb(0.0, 0.46, 0.78); // approx #0075C7
  const accentBlue = rgb(0.0, 0.71, 0.87); // approx teal accent
  const textDark = rgb(0.07, 0.07, 0.07);
  const textMuted = rgb(0.35, 0.35, 0.35);

  // --- HEADER: logo + company info + document meta ---

  const logoPath = path.join(process.cwd(), "public", "ums-logo-icon.png");
  const logoTargetHeight = 42;
  let logoWidth = 42;
  let logoHeight = logoTargetHeight;
  const logoX = margin;
  const logoY = height - margin - logoTargetHeight;

  try {
    const logoBytes = await fs.readFile(logoPath);
    const logoImage = await pdfDoc.embedPng(logoBytes);
    const scaled = logoImage.scale(logoTargetHeight / logoImage.height);
    logoWidth = scaled.width;
    logoHeight = scaled.height;

    page.drawImage(logoImage, {
      x: logoX,
      y: logoY,
      width: logoWidth,
      height: logoHeight,
    });
  } catch {
    // Fallback: simple branded square if logo missing
    page.drawRectangle({
      x: logoX,
      y: logoY,
      width: logoWidth,
      height: logoHeight,
      color: primaryBlue,
    });

    page.drawText("UMS", {
      x: logoX + 10,
      y: logoY + logoHeight / 2 - 7,
      size: 14,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
  }

  const headerTopY = height - margin;
  const leftBlockX = logoX + logoWidth + 14;
  let y = headerTopY - 6;

  // Company name + tagline
  page.drawText("ULTIMATE MARKETING SMASH", {
    x: leftBlockX,
    y,
    size: 14,
    font: fontBold,
    color: textDark,
  });
  y -= 16;

  page.drawText("(PTY) LTD.", {
    x: leftBlockX,
    y,
    size: 10,
    font: fontBold,
    color: textDark,
  });
  y -= 14;

  page.drawText("447 Suikerbekkie Avenue", {
    x: leftBlockX,
    y,
    size: 10,
    font,
    color: textMuted,
  });
  y -= 12;
  page.drawText("Pongola, KZN, 3170", {
    x: leftBlockX,
    y,
    size: 10,
    font,
    color: textMuted,
  });
  y -= 12;
  page.drawText("South Africa", {
    x: leftBlockX,
    y,
    size: 10,
    font,
    color: textMuted,
  });

  // Contact info just beneath
  let contactY = y - 16;
  page.drawText("Phone: +27 79 490 5070", {
    x: leftBlockX,
    y: contactY,
    size: 10,
    font,
    color: textMuted,
  });
  contactY -= 12;
  page.drawText("Email: Manager@ultimatemarketingsmash.com", {
    x: leftBlockX,
    y: contactY,
    size: 10,
    font,
    color: textMuted,
  });

  // Right meta block: big title + Number/Date/Due date (or Valid until)
  const metaRightX = width - margin;
  const metaTopY = headerTopY - 4;

  const titleWidth = fontBold.widthOfTextAtSize(doc.kind, 24);
  page.drawText(doc.kind, {
    x: metaRightX - Math.max(120, titleWidth + 10),
    y: metaTopY,
    size: 24,
    font: fontBold,
    color: primaryBlue,
  });

  let metaY = metaTopY - 24;
  const metaLabelSize = 10;

  const drawMetaRow = (label: string, value: string) => {
    const labelWidth = font.widthOfTextAtSize(label, metaLabelSize);
    const valueWidth = fontBold.widthOfTextAtSize(value, metaLabelSize);
    const gap = 6;
    const valueX = metaRightX - valueWidth;
    const labelX = valueX - gap - labelWidth;

    page.drawText(label, {
      x: labelX,
      y: metaY,
      size: metaLabelSize,
      font,
      color: textMuted,
    });
    page.drawText(value, {
      x: valueX,
      y: metaY,
      size: metaLabelSize,
      font: fontBold,
      color: textDark,
    });

    metaY -= 14;
  };

  drawMetaRow("Number:", doc.number);
  drawMetaRow("Date:", issueDateStr);
  drawMetaRow(isQuote ? "Valid until:" : "Due date:", endDateStr);

  // Accent divider line just below header/content, not mid-page
  const dividerY = contactY - 24;
  page.drawLine({
    start: { x: margin, y: dividerY },
    end: { x: width - margin, y: dividerY },
    thickness: 3,
    color: accentBlue,
  });

  // --- BILL TO / QUOTE FOR section ---

  let sectionTopY = dividerY - 20;
  page.drawText(isQuote ? "QUOTE FOR" : "BILL TO", {
    x: margin,
    y: sectionTopY,
    size: 11,
    font: fontBold,
    color: primaryBlue,
  });

  sectionTopY -= 16;
  page.drawText(doc.clientName, {
    x: margin,
    y: sectionTopY,
    size: 11,
    font: fontBold,
    color: textDark,
  });

  // Store details (if linked)
  if (doc.store) {
    sectionTopY -= 20;
    page.drawText("STORE", {
      x: margin,
      y: sectionTopY,
      size: 9,
      font: fontBold,
      color: primaryBlue,
    });
    sectionTopY -= 14;
    page.drawText(doc.store.name, {
      x: margin,
      y: sectionTopY,
      size: 11,
      font: fontBold,
      color: textDark,
    });
    if (doc.store.address) {
      sectionTopY -= 13;
      page.drawText(doc.store.address, {
        x: margin,
        y: sectionTopY,
        size: 10,
        font,
        color: textMuted,
      });
    }
    if (doc.store.phone) {
      sectionTopY -= 13;
      page.drawText(doc.store.phone, {
        x: margin,
        y: sectionTopY,
        size: 10,
        font,
        color: textMuted,
      });
    }
  }

  // --- ITEMS TABLE ---

  const tableY = sectionTopY - 26;

  const tableLeftX = margin;
  const tableRightX = width - margin;

  // Define four column regions: DESCRIPTION (left, wraps) + three numeric columns
  const descLeft = tableLeftX + 10;
  const descWidth = 260;
  const qtyRight = descLeft + descWidth + 40;
  const unitRight = qtyRight + 80;
  const totalRight = tableRightX - 10;

  const headerHeight = 20;

  // Header background
  page.drawRectangle({
    x: tableLeftX,
    y: tableY - headerHeight,
    width: tableRightX - tableLeftX,
    height: headerHeight,
    color: primaryBlue,
  });

  const headerTextY = tableY - headerHeight + 5;

  // DESCRIPTION header (left-aligned)
  page.drawText("DESCRIPTION", {
    x: descLeft,
    y: headerTextY,
    size: 10,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  // QTY header (right-aligned to qtyRight)
  const qtyHeader = "QTY";
  const qtyHeaderWidth = fontBold.widthOfTextAtSize(qtyHeader, 10);
  page.drawText(qtyHeader, {
    x: qtyRight - qtyHeaderWidth,
    y: headerTextY,
    size: 10,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  // UNIT PRICE header (right-aligned to unitRight)
  const unitHeader = "UNIT PRICE";
  const unitHeaderWidth = fontBold.widthOfTextAtSize(unitHeader, 10);
  page.drawText(unitHeader, {
    x: unitRight - unitHeaderWidth,
    y: headerTextY,
    size: 10,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  // TOTAL header (right-aligned to totalRight)
  const totalHeader = "TOTAL";
  const totalHeaderWidth = fontBold.widthOfTextAtSize(totalHeader, 10);
  page.drawText(totalHeader, {
    x: totalRight - totalHeaderWidth,
    y: headerTextY,
    size: 10,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  // helper to wrap description text within its column width
  const wrapText = (text: string, maxWidth: number, size: number): string[] => {
    const words = text.split(" ");
    const lines: string[] = [];
    let current = "";

    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(test, size);
      if (testWidth > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
    return lines;
  };

  let rowY = headerTextY - 18;

  doc.lineItems.forEach((line) => {
    if (rowY < margin + 100) {
      // In this version, we assume documents fit on one page;
      // add basic guard to avoid overlapping footer.
      return;
    }

    const lines = wrapText(line.description, descWidth, 10);
    const lineHeight = 12;

    // Description (wrapped, top-aligned within row)
    lines.forEach((ln, idx) => {
      const textY = rowY - idx * lineHeight;
      page.drawText(ln, {
        x: descLeft,
        y: textY,
        size: 10,
        font,
        color: textDark,
      });
    });

    const rowBottomY = rowY - (lines.length - 1) * lineHeight;
    const baselineY = rowY; // align numeric columns with first line of description

    const qty = toNum(line.quantity);
    const unitPrice = toNum(line.unitPrice);
    const lineTotal = toNum(line.lineTotal);

    // Qty (right-aligned under QTY header)
    const qtyText = qty.toFixed(0);
    const qtyWidth = font.widthOfTextAtSize(qtyText, 10);
    page.drawText(qtyText, {
      x: qtyRight - qtyWidth,
      y: baselineY,
      size: 10,
      font,
      color: textDark,
    });

    // Unit price (right-aligned under UNIT PRICE header)
    const unitText = `R ${unitPrice.toLocaleString("en-ZA")}`;
    const unitWidth = font.widthOfTextAtSize(unitText, 10);
    page.drawText(unitText, {
      x: unitRight - unitWidth,
      y: baselineY,
      size: 10,
      font,
      color: textDark,
    });

    // Total (right-aligned under TOTAL header)
    const totalText = `R ${lineTotal.toLocaleString("en-ZA")}`;
    const totalWidth = font.widthOfTextAtSize(totalText, 10);
    page.drawText(totalText, {
      x: totalRight - totalWidth,
      y: baselineY,
      size: 10,
      font,
      color: textDark,
    });

    // advance to next row: full height of this row plus extra spacing
    rowY = rowBottomY - (lineHeight + 6);
  });

  // --- TOTALS BOX (single total) ---

  const totalsTopY = rowY - 10;
  const totalsWidth = 260;
  const totalsX = tableRightX - totalsWidth;

  // Accent line above totals
  page.drawLine({
    start: { x: totalsX, y: totalsTopY },
    end: { x: tableRightX, y: totalsTopY },
    thickness: 3,
    color: accentBlue,
  });

  const totalLabelY = totalsTopY - 18;
  page.drawText(isQuote ? "Total Quoted:" : "Total Amount Due:", {
    x: totalsX + 10,
    y: totalLabelY,
    size: 11,
    font: fontBold,
    color: textMuted,
  });

  const totalValueText = `R ${total.toLocaleString("en-ZA")}`;
  const totalValueWidth = fontBold.widthOfTextAtSize(totalValueText, 13);
  page.drawText(totalValueText, {
    x: tableRightX - 10 - totalValueWidth,
    y: totalLabelY,
    size: 13,
    font: fontBold,
    color: textDark,
  });

  // --- FOOTER: banking details (invoice) or acceptance terms (quote) ---

  const footerTopY = totalLabelY - 40;
  page.drawLine({
    start: { x: margin, y: footerTopY },
    end: { x: width - margin, y: footerTopY },
    thickness: 3,
    color: accentBlue,
  });

  let footerY = footerTopY - 20;
  const drawFooterHeading = (text: string) => {
    page.drawText(text, {
      x: margin,
      y: footerY,
      size: 11,
      font: fontBold,
      color: primaryBlue,
    });
    footerY -= 16;
  };
  const drawFooterLine = (text: string) => {
    page.drawText(text, {
      x: margin,
      y: footerY,
      size: 10,
      font,
      color: textMuted,
    });
    footerY -= 12;
  };

  if (isQuote) {
    drawFooterHeading("QUOTATION TERMS");
    drawFooterLine(`This quotation is valid until ${endDateStr}.`);
    drawFooterLine("Prices are subject to change after the validity date.");
    drawFooterLine(
      "To accept, reply to this quotation in writing and an invoice will follow.",
    );
  } else {
    drawFooterHeading("BANKING DETAILS");
    drawFooterLine("Acc Holder: Ultimate Marketing Smash (Pty) Ltd");
    drawFooterLine("Bank: First National Bank (FNB)");
    drawFooterLine("Acc No: 63067511387");
    drawFooterLine("Branch Code: 250655");
    drawFooterLine(`Reference: ${doc.number}`);
  }

  return pdfDoc.save();
}
