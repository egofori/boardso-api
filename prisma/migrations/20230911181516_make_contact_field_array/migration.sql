/*
  Warnings:

  - The `contact` column on the `UserContact` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "UserContact" DROP COLUMN "contact",
ADD COLUMN     "contact" TEXT[];
