/*
  Warnings:

  - You are about to drop the column `emailVerifed` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerifed",
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false;
