/*
  Warnings:

  - The `status` column on the `Problem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `visibility` column on the `Problem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProblemStatus" AS ENUM ('PENDING', 'VERIFIED', 'ROUTED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ProblemVisibility" AS ENUM ('PENDING_REVIEW', 'VERIFIED', 'PUBLIC', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED');

-- CreateEnum
CREATE TYPE "HackathonStatus" AS ENUM ('OPEN', 'SHORTLISTING', 'QUARTERFINAL', 'SEMIFINAL', 'FINALE', 'COMPLETED');

-- AlterTable
ALTER TABLE "Problem" ADD COLUMN     "aiSummary" TEXT,
ADD COLUMN     "descriptionHi" TEXT,
ADD COLUMN     "hackathonId" TEXT,
ADD COLUMN     "mediaUrls" TEXT[],
ADD COLUMN     "sourceLang" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "titleHi" TEXT,
ADD COLUMN     "urgencyScore" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "status",
ADD COLUMN     "status" "ProblemStatus" NOT NULL DEFAULT 'PENDING',
DROP COLUMN "visibility",
ADD COLUMN     "visibility" "ProblemVisibility" NOT NULL DEFAULT 'PENDING_REVIEW';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Hackathon" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "HackathonStatus" NOT NULL DEFAULT 'OPEN',
    "phase" "Phase" NOT NULL DEFAULT 'SUMMER',
    "universityId" TEXT NOT NULL,
    "industryOrgName" TEXT,
    "prizePool" TEXT,
    "registrationDeadline" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hackathon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Solution" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "submitterId" TEXT NOT NULL,
    "problemId" TEXT,
    "hackathonId" TEXT,
    "isWinner" BOOLEAN NOT NULL DEFAULT false,
    "mediaUrls" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Solution_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Problem" ADD CONSTRAINT "Problem_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "Hackathon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hackathon" ADD CONSTRAINT "Hackathon_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solution" ADD CONSTRAINT "Solution_submitterId_fkey" FOREIGN KEY ("submitterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solution" ADD CONSTRAINT "Solution_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solution" ADD CONSTRAINT "Solution_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "Hackathon"("id") ON DELETE SET NULL ON UPDATE CASCADE;
