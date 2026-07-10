-- AddColumn promoId to SocialPost with FK to Promo (SET NULL on delete)
ALTER TABLE "SocialPost" ADD COLUMN "promoId" TEXT;
ALTER TABLE "SocialPost" ADD CONSTRAINT "SocialPost_promoId_fkey"
  FOREIGN KEY ("promoId") REFERENCES "Promo"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "SocialPost_promoId_idx" ON "SocialPost"("promoId");
