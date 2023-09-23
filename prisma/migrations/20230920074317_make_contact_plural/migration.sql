/*
  Warnings:

  - You are about to drop the column `contact` on the `UserContact` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserContact" DROP COLUMN "contact",
ADD COLUMN     "contacts" TEXT[];
