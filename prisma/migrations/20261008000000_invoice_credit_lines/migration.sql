-- Credit/discount lines on an invoice: stored as line items with negative
-- amounts, flagged so they can be shown as a deduction rather than a charge.
ALTER TABLE "InvoiceLineItem" ADD COLUMN "isCredit" BOOLEAN NOT NULL DEFAULT false;
