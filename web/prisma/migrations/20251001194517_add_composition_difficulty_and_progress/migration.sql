-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "ProgressStatus" AS ENUM ('SOLVED', 'ATTEMPTING', 'UNSOLVED');

-- AlterTable
ALTER TABLE "composition" ADD COLUMN     "difficulty" "Difficulty" NOT NULL DEFAULT 'MEDIUM';

-- CreateTable
CREATE TABLE "composition_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "compositionId" TEXT NOT NULL,
    "status" "ProgressStatus" NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "composition_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "composition_progress_userId_status_idx" ON "composition_progress"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "composition_progress_userId_compositionId_key" ON "composition_progress"("userId", "compositionId");

-- AddForeignKey
ALTER TABLE "composition_progress" ADD CONSTRAINT "composition_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "composition_progress" ADD CONSTRAINT "composition_progress_compositionId_fkey" FOREIGN KEY ("compositionId") REFERENCES "composition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
