-- CreateTable
CREATE TABLE "AdAccount" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "accountName" TEXT,
    "accessTokenEncrypted" TEXT,
    "currency" TEXT,
    "timezoneName" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdAccount_accountId_key" ON "AdAccount"("accountId");

-- CreateIndex
CREATE INDEX "AdAccount_clientId_idx" ON "AdAccount"("clientId");

-- AddForeignKey
ALTER TABLE "AdAccount" ADD CONSTRAINT "AdAccount_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
