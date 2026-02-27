-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN "portalToken" TEXT;
ALTER TABLE "Invoice" ADD COLUMN "lastReminderAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_portalToken_key" ON "Invoice"("portalToken");
