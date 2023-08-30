/*
  Warnings:

  - You are about to drop the column `name` on the `BillboardLocation` table. All the data in the column will be lost.
  - You are about to drop the `BillboardDimensions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BillboardPrice` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Billboard` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `currency` to the `Billboard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `height` to the `Billboard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Billboard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rate` to the `Billboard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `width` to the `Billboard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lat` to the `BillboardLocation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lng` to the `BillboardLocation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BillboardDimensions" DROP CONSTRAINT "BillboardDimensions_billboardId_fkey";

-- DropForeignKey
ALTER TABLE "BillboardPrice" DROP CONSTRAINT "BillboardPrice_billboardId_fkey";

-- AlterTable
ALTER TABLE "Billboard" ADD COLUMN     "currency" TEXT NOT NULL,
ADD COLUMN     "height" INTEGER NOT NULL,
ADD COLUMN     "price" INTEGER NOT NULL,
ADD COLUMN     "rate" "Rate" NOT NULL,
ADD COLUMN     "width" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "BillboardLocation" DROP COLUMN "name",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "administrativeAreaLevel1" TEXT,
ADD COLUMN     "administrativeAreaLevel2" TEXT,
ADD COLUMN     "administrativeAreaLevel3" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "lat" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "lng" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "locality" TEXT,
ADD COLUMN     "neighbourhood" TEXT,
ADD COLUMN     "route" TEXT,
ADD COLUMN     "sublocality" TEXT;

-- DropTable
DROP TABLE "BillboardDimensions";

-- DropTable
DROP TABLE "BillboardPrice";

-- CreateIndex
CREATE UNIQUE INDEX "Billboard_slug_key" ON "Billboard"("slug");
