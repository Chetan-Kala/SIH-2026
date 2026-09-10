/*
  Warnings:

  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CITIZEN', 'REGIONAL_HEAD', 'UNIVERSITY', 'INDUSTRY', 'ADMIN');

-- CreateEnum
CREATE TYPE "Phase" AS ENUM ('SUMMER', 'WINTER');

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_districtId_fkey";

-- AlterTable
ALTER TABLE "Problem" ADD COLUMN     "phase" "Phase" NOT NULL DEFAULT 'SUMMER',
ADD COLUMN     "visibility" TEXT NOT NULL DEFAULT 'PENDING_REVIEW';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "orgName" TEXT,
ADD COLUMN     "password" TEXT,
ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'CITIZEN',
ALTER COLUMN "districtId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;
