-- Add SCHEDULED and DONE values to PromoStatus enum
-- These must be in their own transaction before they can be used in DML
ALTER TYPE "PromoStatus" ADD VALUE IF NOT EXISTS 'SCHEDULED';
ALTER TYPE "PromoStatus" ADD VALUE IF NOT EXISTS 'DONE';
