/*
  Warnings:

  - You are about to drop the column `dimensions` on the `Billboard` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Billboard` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Billboard` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Rate" AS ENUM ('PER_MONTH', 'PER_YEAR', 'FOR_SALE');

-- AlterTable
ALTER TABLE "Billboard" DROP COLUMN "dimensions",
DROP COLUMN "location",
DROP COLUMN "price";

-- CreateTable
CREATE TABLE "BillboardDimensions" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "billboardId" INTEGER NOT NULL,

    CONSTRAINT "BillboardDimensions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillboardLocation" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "billboardId" INTEGER NOT NULL,

    CONSTRAINT "BillboardLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillboardPrice" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,
    "currency" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "rate" TEXT NOT NULL,
    "billboardId" INTEGER NOT NULL,

    CONSTRAINT "BillboardPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BillboardDimensions_billboardId_key" ON "BillboardDimensions"("billboardId");

-- CreateIndex
CREATE UNIQUE INDEX "BillboardLocation_billboardId_key" ON "BillboardLocation"("billboardId");

-- CreateIndex
CREATE UNIQUE INDEX "BillboardPrice_billboardId_key" ON "BillboardPrice"("billboardId");

-- AddForeignKey
ALTER TABLE "BillboardDimensions" ADD CONSTRAINT "BillboardDimensions_billboardId_fkey" FOREIGN KEY ("billboardId") REFERENCES "Billboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillboardLocation" ADD CONSTRAINT "BillboardLocation_billboardId_fkey" FOREIGN KEY ("billboardId") REFERENCES "Billboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillboardPrice" ADD CONSTRAINT "BillboardPrice_billboardId_fkey" FOREIGN KEY ("billboardId") REFERENCES "Billboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
