-- Backfill promoId on existing SocialPost rows created from a promo.
-- Match by the promo's store socialPageId and scheduledFor within the promo date window.
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
