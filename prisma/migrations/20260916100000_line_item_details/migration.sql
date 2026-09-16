-- Optional multi-line detail beneath a line item's description (newlines preserved)
ALTER TABLE "InvoiceLineItem" ADD COLUMN "details" TEXT;
ALTER TABLE "QuoteLineItem" ADD COLUMN "details" TEXT;
