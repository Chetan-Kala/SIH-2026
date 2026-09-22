/*
  Warnings:

  - You are about to drop the column `isWinner` on the `Solution` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "RoutingPath" AS ENUM ('MINISTRY', 'HUB');

-- CreateEnum
CREATE TYPE "SolutionStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'WINNER', 'REJECTED');

-- CreateEnum
CREATE TYPE "IndustryAppRole" AS ENUM ('MENTOR', 'FUNDER');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('PROBLEM_VERIFIED', 'PROBLEM_REJECTED', 'PROBLEM_ROUTED', 'HACKATHON_CREATED', 'HACKATHON_STATUS_CHANGED', 'SOLUTION_SUBMITTED', 'SOLUTION_WON', 'INDUSTRY_APPLICATION', 'POINTS_AWARDED', 'GENERAL');

-- CreateEnum
CREATE TYPE "PointsReason" AS ENUM ('PROBLEM_SUBMITTED', 'PROBLEM_VERIFIED', 'HACKATHON_CREATED', 'SOLUTION_SUBMITTED', 'SOLUTION_WON', 'INDUSTRY_MENTORED', 'INDUSTRY_FUNDED');

-- AlterTable
ALTER TABLE "Problem" ADD COLUMN     "aiClassifiedDomain" TEXT,
ADD COLUMN     "dedupGroupId" TEXT,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "routingPath" "RoutingPath";

-- AlterTable
ALTER TABLE "Solution" DROP COLUMN "isWinner",
ADD COLUMN     "status" "SolutionStatus" NOT NULL DEFAULT 'SUBMITTED';

-- CreateTable
CREATE TABLE "TeamRegistration" (
    "id" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "problemId" TEXT,
    "submissionUrl" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teamRegistrationId" TEXT NOT NULL,
    "isLeader" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndustryApplication" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "industryId" TEXT NOT NULL,
    "role" "IndustryAppRole" NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndustryApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PointsTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "reason" "PointsReason" NOT NULL,
    "refId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PointsTransaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TeamRegistration" ADD CONSTRAINT "TeamRegistration_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "Hackathon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamRegistration" ADD CONSTRAINT "TeamRegistration_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_teamRegistrationId_fkey" FOREIGN KEY ("teamRegistrationId") REFERENCES "TeamRegistration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndustryApplication" ADD CONSTRAINT "IndustryApplication_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "Hackathon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndustryApplication" ADD CONSTRAINT "IndustryApplication_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointsTransaction" ADD CONSTRAINT "PointsTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
