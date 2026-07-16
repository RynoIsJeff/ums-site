-- Add isRead and status to MessengerConversation
ALTER TABLE "MessengerConversation" ADD COLUMN "isRead" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "MessengerConversation" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'OPEN';

-- Mark all existing conversations as read (they were already managed in Business Suite)
UPDATE "MessengerConversation" SET "isRead" = true;

CREATE INDEX "MessengerConversation_socialPageId_status_idx" ON "MessengerConversation"("socialPageId", "status");
