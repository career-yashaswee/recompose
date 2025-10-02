-- CreateEnum
CREATE TYPE "BadgeTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM');

-- CreateEnum
CREATE TYPE "BadgeCategory" AS ENUM ('COMPOSITION', 'ENGAGEMENT', 'STREAK', 'ACHIEVEMENT');

-- CreateTable
CREATE TABLE "badge" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "criteria" JSONB NOT NULL,
    "tier" "BadgeTier" NOT NULL DEFAULT 'BRONZE',
    "category" "BadgeCategory" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_badge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "isEarned" BOOLEAN NOT NULL DEFAULT false,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "earnedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_badge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "badge_name_key" ON "badge"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_badge_userId_badgeId_key" ON "user_badge"("userId", "badgeId");

-- CreateIndex
CREATE INDEX "user_badge_userId_idx" ON "user_badge"("userId");

-- CreateIndex
CREATE INDEX "user_badge_badgeId_idx" ON "user_badge"("badgeId");

-- AddForeignKey
ALTER TABLE "user_badge" ADD CONSTRAINT "user_badge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badge" ADD CONSTRAINT "user_badge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Insert default badges
INSERT INTO "badge" ("id", "name", "description", "icon", "criteria", "tier", "category", "isActive") VALUES
('badge_composition_starter', 'Composition Starter', 'Complete your first 5 compositions', '🎯', '{"type": "compositions_completed", "count": 5}', 'BRONZE', 'COMPOSITION', true),
('badge_composition_lover', 'Composition Lover', 'Like 5 compositions on the platform', '❤️', '{"type": "compositions_liked", "count": 5}', 'BRONZE', 'ENGAGEMENT', true);
