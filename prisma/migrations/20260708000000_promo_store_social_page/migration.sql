-- AddColumn socialPageId to PromoStore with FK to SocialPage (SET NULL on delete)
ALTER TABLE "PromoStore" ADD COLUMN "socialPageId" TEXT;
ALTER TABLE "PromoStore" ADD CONSTRAINT "PromoStore_socialPageId_fkey"
  FOREIGN KEY ("socialPageId") REFERENCES "SocialPage"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
