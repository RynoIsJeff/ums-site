-- The previous backfill (migration 0002) was too broad and linked old social posts
-- that happened to share a store page + date range with unrelated promos.
-- This migration reverts the bad links and re-backfills using only posts created
-- on 2026-07-10, which is when posts were actually first scheduled from a promo.

-- Step 1: clear all promoId links set by the bad backfill
UPDATE "SocialPost" SET "promoId" = NULL WHERE "promoId" IS NOT NULL;

-- Step 2: reset all promo statuses that were incorrectly set
UPDATE "Promo" SET status = 'DRAFT' WHERE status = 'SCHEDULED';

-- Step 3: re-backfill using only posts created on 2026-07-10 (when the promo
-- scheduling feature was first used) to avoid matching old unrelated posts
UPDATE "SocialPost" sp
SET "promoId" = p.id
FROM "Promo" p
JOIN "PromoStore" ps ON p."storeId" = ps.id
WHERE sp."promoId" IS NULL
  AND sp."socialPageId" = ps."socialPageId"
  AND sp."scheduledFor" >= p."promoDateFrom"
  AND sp."scheduledFor" <= p."promoDateTo" + INTERVAL '7 days'
  AND sp."createdAt" >= '2026-07-10 00:00:00'::timestamp;

-- Step 4: mark promos as SCHEDULED where they now have correctly-linked posts
UPDATE "Promo" p
SET status = 'SCHEDULED'
WHERE status = 'DRAFT'
  AND EXISTS (
    SELECT 1 FROM "SocialPost" sp
    WHERE sp."promoId" = p.id
      AND sp.status IN ('SCHEDULED', 'PROCESSING', 'PUBLISHED')
  );
