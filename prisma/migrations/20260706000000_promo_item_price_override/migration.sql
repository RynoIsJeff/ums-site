-- Add per-promo price override and original (was) price to PromoItem
ALTER TABLE "PromoItem" ADD COLUMN "priceOverride" DECIMAL(10,2);
ALTER TABLE "PromoItem" ADD COLUMN "originalPrice" DECIMAL(10,2);
