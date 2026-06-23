-- CreateEnum
CREATE TYPE "PromoStatus" AS ENUM ('DRAFT', 'READY');

-- CreateTable: PromoStore
CREATE TABLE "PromoStore" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PromoStore_pkey" PRIMARY KEY ("id")
);

-- CreateTable: PromoProduct
CREATE TABLE "PromoProduct" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "variant" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "imageData" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PromoProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Promo
CREATE TABLE "Promo" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "createdById" TEXT,
    "title" TEXT NOT NULL,
    "headerImageData" TEXT,
    "promoDateFrom" TIMESTAMP(3) NOT NULL,
    "promoDateTo" TIMESTAMP(3) NOT NULL,
    "storeId" TEXT,
    "status" "PromoStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Promo_pkey" PRIMARY KEY ("id")
);

-- CreateTable: PromoItem
CREATE TABLE "PromoItem" (
    "id" TEXT NOT NULL,
    "promoId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PromoItem_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "PromoStore_clientId_idx" ON "PromoStore"("clientId");
CREATE INDEX "PromoProduct_clientId_idx" ON "PromoProduct"("clientId");
CREATE INDEX "Promo_clientId_idx" ON "Promo"("clientId");
CREATE INDEX "Promo_status_idx" ON "Promo"("status");
CREATE UNIQUE INDEX "PromoItem_promoId_productId_key" ON "PromoItem"("promoId", "productId");
CREATE INDEX "PromoItem_promoId_idx" ON "PromoItem"("promoId");

-- Foreign Keys: PromoStore
ALTER TABLE "PromoStore" ADD CONSTRAINT "PromoStore_clientId_fkey"
    FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign Keys: PromoProduct
ALTER TABLE "PromoProduct" ADD CONSTRAINT "PromoProduct_clientId_fkey"
    FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign Keys: Promo
ALTER TABLE "Promo" ADD CONSTRAINT "Promo_clientId_fkey"
    FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Promo" ADD CONSTRAINT "Promo_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Promo" ADD CONSTRAINT "Promo_storeId_fkey"
    FOREIGN KEY ("storeId") REFERENCES "PromoStore"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Foreign Keys: PromoItem
ALTER TABLE "PromoItem" ADD CONSTRAINT "PromoItem_promoId_fkey"
    FOREIGN KEY ("promoId") REFERENCES "Promo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PromoItem" ADD CONSTRAINT "PromoItem_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "PromoProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
