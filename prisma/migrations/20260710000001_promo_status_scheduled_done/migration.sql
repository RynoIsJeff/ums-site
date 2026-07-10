-- Add SCHEDULED and DONE values to PromoStatus enum
ALTER TYPE "PromoStatus" ADD VALUE IF NOT EXISTS 'SCHEDULED';
ALTER TYPE "PromoStatus" ADD VALUE IF NOT EXISTS 'DONE';

-- Backfill promoId on existing SocialPost rows that were scheduled from a promo
-- Match by store's socialPageId and scheduledFor within the promo's date window (+7 days buffer)
UPDATE "SocialPost" sp
SET "promoId" = p.id
FROM "Promo" p
JOIN "PromoStore" ps ON p."storeId" = ps.id
WHERE sp."promoId" IS NULL
  AND sp."socialPageId" = ps."socialPageId"
  AND sp."scheduledFor" >= p."promoDateFrom"
  AND sp."scheduledFor" <= p."promoDateTo" + INTERVAL '7 days';

-- Mark promos as SCHEDULED when they have linked social posts
UPDATE "Promo" p
SET status = 'SCHEDULED'
WHERE status = 'DRAFT'
  AND EXISTS (
    SELECT 1 FROM "SocialPost" sp
    WHERE sp."promoId" = p.id
      AND sp.status IN ('SCHEDULED', 'PROCESSING', 'PUBLISHED')
  );
