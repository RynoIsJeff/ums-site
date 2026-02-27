-- AlterTable
ALTER TABLE "Payment" ADD COLUMN "paymentGateway" TEXT;
ALTER TABLE "Payment" ADD COLUMN "externalReference" TEXT;
ALTER TABLE "SocialPage" ADD COLUMN "instagramBusinessAccountId" TEXT;

-- CreateTable
CREATE TABLE "MessengerConversation" (
    "id" TEXT NOT NULL,
    "socialPageId" TEXT NOT NULL,
    "participantPsid" TEXT NOT NULL,
    "participantName" TEXT,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessengerConversation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MessengerMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "externalMid" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessengerMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TimeEntry" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskId" TEXT,
    "description" TEXT NOT NULL,
    "hours" DECIMAL(6,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "billable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('DRAFT', 'SENT', 'SIGNED', 'REJECTED');

CREATE TABLE "Proposal" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "ProposalStatus" NOT NULL DEFAULT 'DRAFT',
    "portalToken" TEXT,
    "sentAt" TIMESTAMP(3),
    "signedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MessengerConversation_socialPageId_participantPsid_key" ON "MessengerConversation"("socialPageId", "participantPsid");
CREATE INDEX "MessengerConversation_socialPageId_idx" ON "MessengerConversation"("socialPageId");
CREATE INDEX "MessengerMessage_conversationId_idx" ON "MessengerMessage"("conversationId");
CREATE UNIQUE INDEX "Proposal_portalToken_key" ON "Proposal"("portalToken");
CREATE INDEX "TimeEntry_clientId_idx" ON "TimeEntry"("clientId");
CREATE INDEX "TimeEntry_userId_idx" ON "TimeEntry"("userId");
CREATE INDEX "TimeEntry_date_idx" ON "TimeEntry"("date");
CREATE INDEX "Proposal_clientId_idx" ON "Proposal"("clientId");
CREATE INDEX "Proposal_status_idx" ON "Proposal"("status");

-- AddForeignKey
ALTER TABLE "MessengerConversation" ADD CONSTRAINT "MessengerConversation_socialPageId_fkey" FOREIGN KEY ("socialPageId") REFERENCES "SocialPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MessengerMessage" ADD CONSTRAINT "MessengerMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "MessengerConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
