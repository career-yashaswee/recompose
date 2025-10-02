-- CreateEnum
CREATE TYPE "PointCategory" AS ENUM ('COMPOSITION_COMPLETE', 'DAILY_STREAK', 'WEEKLY_STREAK', 'MONTHLY_STREAK', 'FIRST_COMPLETION', 'DIFFICULTY_BONUS', 'ACHIEVEMENT');

-- CreateTable
CREATE TABLE "user_point" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "category" "PointCategory" NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_point_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_point_userId_createdAt_idx" ON "user_point"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "user_point_userId_category_idx" ON "user_point"("userId", "category");

-- AddForeignKey
ALTER TABLE "user_point" ADD CONSTRAINT "user_point_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
