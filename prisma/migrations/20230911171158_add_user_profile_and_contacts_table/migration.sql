/*
  Warnings:

  - You are about to drop the column `about` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `contacts` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `profileImage` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('PHONE', 'EMAIL', 'URL');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "about",
DROP COLUMN "contacts",
DROP COLUMN "profileImage",
ADD COLUMN     "zipCode" TEXT,
ALTER COLUMN "phone" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,
    "profileImage" TEXT,
    "about" TEXT,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserContact" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "type" "ContactType" NOT NULL,
    "userProfileId" INTEGER NOT NULL,

    CONSTRAINT "UserContact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserContact" ADD CONSTRAINT "UserContact_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
