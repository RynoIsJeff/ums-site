-- Reconciliation migration: idempotent guards for tables/columns that may not
-- have been applied in production due to a Session-pooler connection failure.

-- PostInsight table (safe to run even if it already exists)
CREATE TABLE IF NOT EXISTS "PostInsight" (
    "id" TEXT NOT NULL,
    "socialPostId" TEXT NOT NULL,
    "reactions" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "reach" INTEGER NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PostInsight_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PostInsight_socialPostId_key" ON "PostInsight"("socialPostId");

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'PostInsight_socialPostId_fkey'
  ) THEN
    ALTER TABLE "PostInsight" ADD CONSTRAINT "PostInsight_socialPostId_fkey"
      FOREIGN KEY ("socialPostId") REFERENCES "SocialPost"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- brandVoice column on Client (safe to run even if it already exists)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Client' AND column_name = 'brandVoice'
  ) THEN
    ALTER TABLE "Client" ADD COLUMN "brandVoice" JSONB;
  END IF;
END $$;
