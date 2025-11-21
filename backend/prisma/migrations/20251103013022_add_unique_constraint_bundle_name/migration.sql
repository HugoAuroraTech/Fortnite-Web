-- AlterTable
ALTER TABLE "Cosmetic" ADD COLUMN     "bundleId" TEXT;

-- CreateTable
CREATE TABLE "Bundle" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "info" TEXT,
    "imageUrl" TEXT,
    "price" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bundle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bundle_name_key" ON "Bundle"("name");

-- AddForeignKey
ALTER TABLE "Cosmetic" ADD CONSTRAINT "Cosmetic_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
