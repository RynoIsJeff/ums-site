-- Add optional product code to PromoProduct for searchability
ALTER TABLE "PromoProduct" ADD COLUMN "code" TEXT;

-- Index for efficient code-based search per client
CREATE INDEX "PromoProduct_clientId_code_idx" ON "PromoProduct"("clientId", "code");
