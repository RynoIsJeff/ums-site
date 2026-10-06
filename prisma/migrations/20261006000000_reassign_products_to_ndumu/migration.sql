-- One-off data fix, the product-library twin of 20260923000000_reassign_stores_to_ndumu.
--
-- /hub/promos/products/new pinned every product to the alphabetically first
-- client, exactly as the store form did, so the whole promo product library
-- sits on "Gone Camping" while the branches it is promoted in belong to Ndumu
-- Trading. The promo form lists products for the promo's own client, so the
-- library came up empty once the stores moved.
--
-- Moves only products currently on a "Gone Camping" client, and only when
-- exactly one Ndumu Trading client exists. No-op otherwise, so a fresh database
-- or different client names are left alone.
WITH target AS (
  SELECT "id"
  FROM "Client"
  WHERE "companyName" ILIKE 'Ndumu Trading%'
),
misassigned AS (
  SELECT "id"
  FROM "Client"
  WHERE "companyName" ILIKE 'Gone Camping%'
)
UPDATE "PromoProduct"
SET "clientId" = (SELECT "id" FROM target),
    "updatedAt" = NOW()
WHERE (SELECT count(*) FROM target) = 1
  AND "clientId" IN (SELECT "id" FROM misassigned);
