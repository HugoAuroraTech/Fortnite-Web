/*
  Warnings:

  - You are about to drop the column `imageFeatured` on the `Cosmetic` table. All the data in the column will be lost.
  - You are about to drop the column `imageIcon` on the `Cosmetic` table. All the data in the column will be lost.
  - You are about to drop the column `isNew` on the `Cosmetic` table. All the data in the column will be lost.
  - You are about to drop the column `isOnSale` on the `Cosmetic` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Cosmetic` table. All the data in the column will be lost.
  - You are about to drop the column `bannerType` on the `ShopEntry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Cosmetic" DROP COLUMN "imageFeatured",
DROP COLUMN "imageIcon",
DROP COLUMN "isNew",
DROP COLUMN "isOnSale",
DROP COLUMN "price";

-- AlterTable
ALTER TABLE "ShopEntry" DROP COLUMN "bannerType",
ADD COLUMN     "bannerBackendValue" TEXT,
ADD COLUMN     "bannerIntensity" TEXT,
ADD COLUMN     "bannerValue" TEXT,
ADD COLUMN     "carId" TEXT,
ADD COLUMN     "devName" TEXT,
ADD COLUMN     "instrumentId" TEXT,
ADD COLUMN     "layoutId" TEXT,
ADD COLUMN     "legoKitId" TEXT,
ADD COLUMN     "offerTagId" TEXT,
ADD COLUMN     "offerTagText" TEXT,
ADD COLUMN     "trackId" TEXT;

-- CreateTable
CREATE TABLE "BRCosmetic" (
    "id" TEXT NOT NULL,
    "exclusiveDescription" TEXT,
    "unlockRequirements" TEXT,
    "customExclusiveCallout" TEXT,
    "imageSmallIcon" TEXT,
    "imageIcon" TEXT,
    "imageFeatured" TEXT,
    "imageLegoSmall" TEXT,
    "imageLegoLarge" TEXT,
    "imageLegoWide" TEXT,
    "imageBeanSmall" TEXT,
    "imageBeanLarge" TEXT,
    "variants" JSONB,
    "introduction" JSONB,
    "builtInEmoteIds" JSONB,
    "searchTags" JSONB,
    "gameplayTags" JSONB,
    "metaTags" JSONB,
    "showcaseVideo" TEXT,
    "dynamicPakId" TEXT,
    "itemPreviewHeroPath" TEXT,
    "displayAssetPath" TEXT,
    "definitionPath" TEXT,
    "path" TEXT,
    "price" INTEGER,
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "isOnSale" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BRCosmetic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Track" (
    "id" TEXT NOT NULL,
    "devName" TEXT,
    "title" TEXT,
    "artist" TEXT,
    "album" TEXT,
    "releaseYear" INTEGER,
    "bpm" INTEGER,
    "duration" INTEGER,
    "difficulty" JSONB,
    "genres" JSONB,
    "albumArt" TEXT,
    "gameplayTags" JSONB,
    "price" INTEGER,
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "isOnSale" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Instrument" (
    "id" TEXT NOT NULL,
    "imageSmall" TEXT,
    "imageLarge" TEXT,
    "gameplayTags" JSONB,
    "path" TEXT,
    "showcaseVideo" TEXT,
    "price" INTEGER,
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "isOnSale" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Instrument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Car" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT,
    "imageSmall" TEXT,
    "imageLarge" TEXT,
    "gameplayTags" JSONB,
    "path" TEXT,
    "showcaseVideo" TEXT,
    "price" INTEGER,
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "isOnSale" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Car_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegoItem" (
    "id" TEXT NOT NULL,
    "cosmeticId" TEXT,
    "soundLibraryTags" JSONB,
    "imageSmall" TEXT,
    "imageLarge" TEXT,
    "imageWide" TEXT,
    "path" TEXT,
    "price" INTEGER,
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "isOnSale" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LegoItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegoKit" (
    "id" TEXT NOT NULL,
    "imageSmall" TEXT,
    "imageLarge" TEXT,
    "imageWide" TEXT,
    "gameplayTags" JSONB,
    "path" TEXT,
    "price" INTEGER,
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "isOnSale" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LegoKit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bean" (
    "id" TEXT NOT NULL,
    "cosmeticId" TEXT,
    "gender" TEXT,
    "imageSmall" TEXT,
    "imageLarge" TEXT,
    "gameplayTags" JSONB,
    "path" TEXT,
    "price" INTEGER,
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "isOnSale" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Bean_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ShopEntry" ADD CONSTRAINT "ShopEntry_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopEntry" ADD CONSTRAINT "ShopEntry_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "Instrument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopEntry" ADD CONSTRAINT "ShopEntry_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopEntry" ADD CONSTRAINT "ShopEntry_legoKitId_fkey" FOREIGN KEY ("legoKitId") REFERENCES "LegoKit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BRCosmetic" ADD CONSTRAINT "BRCosmetic_id_fkey" FOREIGN KEY ("id") REFERENCES "Cosmetic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_id_fkey" FOREIGN KEY ("id") REFERENCES "Cosmetic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Instrument" ADD CONSTRAINT "Instrument_id_fkey" FOREIGN KEY ("id") REFERENCES "Cosmetic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Car" ADD CONSTRAINT "Car_id_fkey" FOREIGN KEY ("id") REFERENCES "Cosmetic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegoItem" ADD CONSTRAINT "LegoItem_id_fkey" FOREIGN KEY ("id") REFERENCES "Cosmetic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegoKit" ADD CONSTRAINT "LegoKit_id_fkey" FOREIGN KEY ("id") REFERENCES "Cosmetic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bean" ADD CONSTRAINT "Bean_id_fkey" FOREIGN KEY ("id") REFERENCES "Cosmetic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
