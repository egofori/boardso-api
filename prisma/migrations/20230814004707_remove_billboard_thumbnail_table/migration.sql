/*
  Warnings:

  - The `status` column on the `Billboard` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `size` on the `BillboardImage` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to drop the `BillboardThumbnail` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `extension` to the `BillboardImage` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('AWS_S3', 'CLOUDINARY', 'LOCAL');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('AVAILABLE', 'UNAVAILABLE');

-- DropForeignKey
ALTER TABLE "BillboardThumbnail" DROP CONSTRAINT "BillboardThumbnail_billboardId_fkey";

-- AlterTable
ALTER TABLE "Billboard" ADD COLUMN     "thumbnailId" INTEGER,
DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'AVAILABLE';

-- AlterTable
ALTER TABLE "BillboardImage" ADD COLUMN     "extension" TEXT NOT NULL,
ADD COLUMN     "provider" "Provider" NOT NULL DEFAULT 'AWS_S3',
ADD COLUMN     "providerMetadata" JSONB,
ALTER COLUMN "size" SET DATA TYPE INTEGER;

-- DropTable
DROP TABLE "BillboardThumbnail";
