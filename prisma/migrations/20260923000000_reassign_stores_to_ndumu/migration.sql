-- One-off data fix.
--
-- Until the previous migration's UI change, /hub/promos/stores/new pinned every
-- new store to the alphabetically first client, so all existing stores landed on
-- "Gone Camping". They are in fact Ndumu Trading's branches (Manguzi, Mbazwana,
-- Mkuze, Pongola, Ulundi), confirmed by the account owner.
--
-- Moves only stores currently sitting on a "Gone Camping" client, and only when
-- exactly one Ndumu Trading client exists. Anything else is left untouched, so
-- this is a no-op on a fresh database or if the names do not match.
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
UPDATE "PromoStore"
SET "clientId" = (SELECT "id" FROM target),
    "updatedAt" = NOW()
WHERE (SELECT count(*) FROM target) = 1
  AND "clientId" IN (SELECT "id" FROM misassigned);
