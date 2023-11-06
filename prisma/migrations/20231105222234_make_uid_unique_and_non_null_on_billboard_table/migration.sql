/*
  Warnings:

  - A unique constraint covering the columns `[uid]` on the table `Billboard` will be added. If there are existing duplicate values, this will fail.
  - Made the column `uid` on table `Billboard` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Billboard" ALTER COLUMN "uid" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Billboard_uid_key" ON "Billboard"("uid");
