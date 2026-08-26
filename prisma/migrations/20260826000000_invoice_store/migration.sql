-- Add optional store link to Invoice
ALTER TABLE "Invoice" ADD COLUMN "storeId" TEXT;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_storeId_fkey"
  FOREIGN KEY ("storeId") REFERENCES "PromoStore"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "Invoice_storeId_idx" ON "Invoice"("storeId");
