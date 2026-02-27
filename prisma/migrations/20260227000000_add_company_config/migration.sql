-- CreateTable
CREATE TABLE "CompanyConfig" (
    "id" TEXT NOT NULL,
    "companyName" TEXT,
    "supportEmail" TEXT,
    "defaultCurrency" TEXT NOT NULL DEFAULT 'ZAR',
    "defaultVatRate" DECIMAL(5,2) NOT NULL DEFAULT 15.00,
    "invoicePrefix" TEXT,
    "billingAddress" TEXT,
    "phone" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyConfig_pkey" PRIMARY KEY ("id")
);
