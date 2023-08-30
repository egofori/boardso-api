/*
  Warnings:

  - Added the required column `slug` to the `Billboard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Billboard" ADD COLUMN     "slug" TEXT NOT NULL;
