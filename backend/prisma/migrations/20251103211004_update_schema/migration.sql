/*
  Warnings:

  - You are about to drop the column `bundleId` on the `Cosmetic` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Cosmetic` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "CosmeticCategory" AS ENUM ('BR', 'TRACK', 'INSTRUMENT', 'CAR', 'LEGO', 'LEGOKIT', 'BEAN');

-- DropForeignKey
ALTER TABLE "public"."Cosmetic" DROP CONSTRAINT "Cosmetic_bundleId_fkey";

-- AlterTable
ALTER TABLE "Cosmetic" DROP COLUMN "bundleId",
DROP COLUMN "imageUrl",
ADD COLUMN     "addedAt" TIMESTAMP(3),
ADD COLUMN     "category" "CosmeticCategory" NOT NULL DEFAULT 'BR',
ADD COLUMN     "description" TEXT,
ADD COLUMN     "imageFeatured" TEXT,
ADD COLUMN     "imageIcon" TEXT,
ADD COLUMN     "series" TEXT,
ADD COLUMN     "setName" TEXT,
ADD COLUMN     "shopHistory" JSONB,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "bundleId" TEXT;

-- CreateTable
CREATE TABLE "BundleCosmetic" (
    "id" TEXT NOT NULL,
    "bundleId" TEXT NOT NULL,
    "cosmeticId" TEXT NOT NULL,

    CONSTRAINT "BundleCosmetic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopEntry" (
    "id" TEXT NOT NULL,
    "offerId" TEXT,
    "regularPrice" INTEGER,
    "finalPrice" INTEGER,
    "bannerText" TEXT,
    "bannerType" TEXT,
    "inDate" TIMESTAMP(3),
    "outDate" TIMESTAMP(3),
    "layoutName" TEXT,
    "sortPriority" INTEGER,
    "isGiftable" BOOLEAN DEFAULT false,
    "isRefundable" BOOLEAN DEFAULT false,
    "bundleId" TEXT,
    "cosmeticId" TEXT,
    "category" TEXT,
    "rawData" JSONB,

    CONSTRAINT "ShopEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BundleCosmetic_bundleId_cosmeticId_key" ON "BundleCosmetic"("bundleId", "cosmeticId");

-- CreateIndex
CREATE UNIQUE INDEX "ShopEntry_offerId_key" ON "ShopEntry"("offerId");

-- AddForeignKey
ALTER TABLE "BundleCosmetic" ADD CONSTRAINT "BundleCosmetic_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundleCosmetic" ADD CONSTRAINT "BundleCosmetic_cosmeticId_fkey" FOREIGN KEY ("cosmeticId") REFERENCES "Cosmetic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopEntry" ADD CONSTRAINT "ShopEntry_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopEntry" ADD CONSTRAINT "ShopEntry_cosmeticId_fkey" FOREIGN KEY ("cosmeticId") REFERENCES "Cosmetic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
