-- Mark promos as DONE when their end date has already passed
UPDATE "Promo"
SET "status" = 'DONE'
WHERE "status" IN ('SCHEDULED', 'READY')
AND "promoDateTo" < NOW();
