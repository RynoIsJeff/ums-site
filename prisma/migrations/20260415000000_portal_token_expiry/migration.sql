-- Add portalTokenExpiresAt to Invoice for 90-day token expiry
ALTER TABLE "Invoice" ADD COLUMN "portalTokenExpiresAt" TIMESTAMP(3);
