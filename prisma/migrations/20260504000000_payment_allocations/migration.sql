-- CreateTable: PaymentAllocation junction table for multi-invoice payment splits
CREATE TABLE "PaymentAllocation" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "allocatedAmount" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentAllocation_paymentId_invoiceId_key" ON "PaymentAllocation"("paymentId", "invoiceId");
CREATE INDEX "PaymentAllocation_paymentId_idx" ON "PaymentAllocation"("paymentId");
CREATE INDEX "PaymentAllocation_invoiceId_idx" ON "PaymentAllocation"("invoiceId");

-- AddForeignKey
ALTER TABLE "PaymentAllocation" ADD CONSTRAINT "PaymentAllocation_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PaymentAllocation" ADD CONSTRAINT "PaymentAllocation_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- MigrateData: Carry over existing single-invoice payment links into PaymentAllocation
INSERT INTO "PaymentAllocation" ("id", "paymentId", "invoiceId", "allocatedAmount", "createdAt")
SELECT gen_random_uuid()::text, "id", "invoiceId", "amount", NOW()
FROM "Payment"
WHERE "invoiceId" IS NOT NULL;

-- DropIndex
DROP INDEX IF EXISTS "Payment_invoiceId_idx";

-- AlterTable: Remove the now-redundant invoiceId column from Payment
ALTER TABLE "Payment" DROP COLUMN IF EXISTS "invoiceId";
