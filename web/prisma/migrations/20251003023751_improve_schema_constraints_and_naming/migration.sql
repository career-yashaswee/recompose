/*
  Warnings:

  - You are about to alter the column `userId` on the `composition_progress` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `compositionId` on the `composition_progress` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `userId` on the `daily_time_tracking` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to drop the `account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `badge` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `composition` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `composition_completion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `composition_favorite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `composition_reaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `kanban_task` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_badge` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_point` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `verification` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED');

-- DropForeignKey
ALTER TABLE "public"."account" DROP CONSTRAINT "account_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."composition" DROP CONSTRAINT "composition_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."composition_completion" DROP CONSTRAINT "composition_completion_compositionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."composition_completion" DROP CONSTRAINT "composition_completion_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."composition_favorite" DROP CONSTRAINT "composition_favorite_compositionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."composition_favorite" DROP CONSTRAINT "composition_favorite_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."composition_progress" DROP CONSTRAINT "composition_progress_compositionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."composition_progress" DROP CONSTRAINT "composition_progress_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."composition_reaction" DROP CONSTRAINT "composition_reaction_compositionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."composition_reaction" DROP CONSTRAINT "composition_reaction_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."daily_time_tracking" DROP CONSTRAINT "daily_time_tracking_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."kanban_task" DROP CONSTRAINT "kanban_task_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."notification" DROP CONSTRAINT "notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."session" DROP CONSTRAINT "session_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_badge" DROP CONSTRAINT "user_badge_badgeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_badge" DROP CONSTRAINT "user_badge_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_point" DROP CONSTRAINT "user_point_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_session" DROP CONSTRAINT "user_session_userId_fkey";

-- AlterTable
ALTER TABLE "composition_progress" ALTER COLUMN "userId" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "compositionId" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "daily_time_tracking" ALTER COLUMN "userId" SET DATA TYPE VARCHAR(255);

-- DropTable
DROP TABLE "public"."account";

-- DropTable
DROP TABLE "public"."badge";

-- DropTable
DROP TABLE "public"."composition";

-- DropTable
DROP TABLE "public"."composition_completion";

-- DropTable
DROP TABLE "public"."composition_favorite";

-- DropTable
DROP TABLE "public"."composition_reaction";

-- DropTable
DROP TABLE "public"."kanban_task";

-- DropTable
DROP TABLE "public"."notification";

-- DropTable
DROP TABLE "public"."session";

-- DropTable
DROP TABLE "public"."user";

-- DropTable
DROP TABLE "public"."user_badge";

-- DropTable
DROP TABLE "public"."user_point";

-- DropTable
DROP TABLE "public"."user_session";

-- DropTable
DROP TABLE "public"."verification";

-- CreateTable
CREATE TABLE "users" (
    "id" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(100),
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" VARCHAR(500),
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "gender" "Gender",
    "location" VARCHAR(100),
    "birthday" TIMESTAMP(3),
    "summary" TEXT,
    "website" VARCHAR(255),
    "github" VARCHAR(100),
    "linkedin" VARCHAR(255),
    "twitter" VARCHAR(100),
    "leetcodeId" VARCHAR(100),
    "work" VARCHAR(255),
    "education" VARCHAR(255),
    "technicalSkills" TEXT[],
    "timezone" VARCHAR(50) DEFAULT 'Asia/Kolkata',
    "preferences" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" VARCHAR(255) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "userId" VARCHAR(255) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" VARCHAR(255) NOT NULL,
    "accountId" VARCHAR(255) NOT NULL,
    "providerId" VARCHAR(50) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" VARCHAR(255),
    "password" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verifications" (
    "id" VARCHAR(255) NOT NULL,
    "identifier" VARCHAR(255) NOT NULL,
    "value" VARCHAR(255) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compositions" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'MEDIUM',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" VARCHAR(255),

    CONSTRAINT "compositions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "composition_completions" (
    "id" TEXT NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "compositionId" VARCHAR(255) NOT NULL,
    "dateKey" VARCHAR(10) NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "composition_completions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "composition_favorites" (
    "id" TEXT NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "compositionId" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "composition_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "composition_reactions" (
    "id" TEXT NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "compositionId" VARCHAR(255) NOT NULL,
    "value" "ReactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "composition_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "category" "NotificationCategory" NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kanban_tasks" (
    "id" TEXT NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" "KanbanStatus" NOT NULL DEFAULT 'SOURCED',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kanban_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_points" (
    "id" TEXT NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "points" INTEGER NOT NULL,
    "reason" VARCHAR(255) NOT NULL,
    "category" "PointCategory" NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badges" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "icon" VARCHAR(255),
    "criteria" JSONB NOT NULL,
    "tier" "BadgeTier" NOT NULL DEFAULT 'BRONZE',
    "category" "BadgeCategory" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badge_criteria" (
    "id" TEXT NOT NULL,
    "badgeId" VARCHAR(255) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "operator" VARCHAR(10) NOT NULL,
    "value" INTEGER NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "badge_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_badges" (
    "id" TEXT NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "badgeId" VARCHAR(255) NOT NULL,
    "isEarned" BOOLEAN NOT NULL DEFAULT false,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "earnedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "sessionId" VARCHAR(255) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActive" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "totalTime" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userAgent" TEXT,
    "ipAddress" VARCHAR(45),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- CreateIndex
CREATE INDEX "users_deletedAt_idx" ON "users"("deletedAt");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "sessions_expiresAt_idx" ON "sessions"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_providerId_accountId_key" ON "accounts"("providerId", "accountId");

-- CreateIndex
CREATE INDEX "verifications_identifier_idx" ON "verifications"("identifier");

-- CreateIndex
CREATE INDEX "verifications_expiresAt_idx" ON "verifications"("expiresAt");

-- CreateIndex
CREATE INDEX "compositions_difficulty_idx" ON "compositions"("difficulty");

-- CreateIndex
CREATE INDEX "compositions_isActive_idx" ON "compositions"("isActive");

-- CreateIndex
CREATE INDEX "compositions_createdAt_idx" ON "compositions"("createdAt");

-- CreateIndex
CREATE INDEX "compositions_createdById_idx" ON "compositions"("createdById");

-- CreateIndex
CREATE INDEX "composition_completions_userId_dateKey_idx" ON "composition_completions"("userId", "dateKey");

-- CreateIndex
CREATE INDEX "composition_completions_compositionId_idx" ON "composition_completions"("compositionId");

-- CreateIndex
CREATE INDEX "composition_completions_completedAt_idx" ON "composition_completions"("completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "composition_completions_userId_dateKey_key" ON "composition_completions"("userId", "dateKey");

-- CreateIndex
CREATE INDEX "composition_favorites_userId_idx" ON "composition_favorites"("userId");

-- CreateIndex
CREATE INDEX "composition_favorites_compositionId_idx" ON "composition_favorites"("compositionId");

-- CreateIndex
CREATE INDEX "composition_favorites_createdAt_idx" ON "composition_favorites"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "composition_favorites_userId_compositionId_key" ON "composition_favorites"("userId", "compositionId");

-- CreateIndex
CREATE INDEX "composition_reactions_compositionId_value_idx" ON "composition_reactions"("compositionId", "value");

-- CreateIndex
CREATE INDEX "composition_reactions_userId_idx" ON "composition_reactions"("userId");

-- CreateIndex
CREATE INDEX "composition_reactions_createdAt_idx" ON "composition_reactions"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "composition_reactions_userId_compositionId_key" ON "composition_reactions"("userId", "compositionId");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_userId_category_idx" ON "notifications"("userId", "category");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "kanban_tasks_userId_status_idx" ON "kanban_tasks"("userId", "status");

-- CreateIndex
CREATE INDEX "kanban_tasks_userId_order_idx" ON "kanban_tasks"("userId", "order");

-- CreateIndex
CREATE INDEX "kanban_tasks_createdAt_idx" ON "kanban_tasks"("createdAt");

-- CreateIndex
CREATE INDEX "user_points_userId_createdAt_idx" ON "user_points"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "user_points_userId_category_idx" ON "user_points"("userId", "category");

-- CreateIndex
CREATE INDEX "user_points_points_idx" ON "user_points"("points");

-- CreateIndex
CREATE INDEX "user_points_createdAt_idx" ON "user_points"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "badges_name_key" ON "badges"("name");

-- CreateIndex
CREATE INDEX "badges_category_idx" ON "badges"("category");

-- CreateIndex
CREATE INDEX "badges_tier_idx" ON "badges"("tier");

-- CreateIndex
CREATE INDEX "badges_isActive_idx" ON "badges"("isActive");

-- CreateIndex
CREATE INDEX "badge_criteria_badgeId_idx" ON "badge_criteria"("badgeId");

-- CreateIndex
CREATE INDEX "badge_criteria_type_idx" ON "badge_criteria"("type");

-- CreateIndex
CREATE INDEX "user_badges_userId_idx" ON "user_badges"("userId");

-- CreateIndex
CREATE INDEX "user_badges_badgeId_idx" ON "user_badges"("badgeId");

-- CreateIndex
CREATE INDEX "user_badges_isEarned_idx" ON "user_badges"("isEarned");

-- CreateIndex
CREATE UNIQUE INDEX "user_badges_userId_badgeId_key" ON "user_badges"("userId", "badgeId");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_sessionId_key" ON "user_sessions"("sessionId");

-- CreateIndex
CREATE INDEX "user_sessions_userId_isActive_idx" ON "user_sessions"("userId", "isActive");

-- CreateIndex
CREATE INDEX "user_sessions_userId_createdAt_idx" ON "user_sessions"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "user_sessions_sessionId_idx" ON "user_sessions"("sessionId");

-- CreateIndex
CREATE INDEX "user_sessions_startTime_idx" ON "user_sessions"("startTime");

-- CreateIndex
CREATE INDEX "composition_progress_compositionId_idx" ON "composition_progress"("compositionId");

-- CreateIndex
CREATE INDEX "daily_time_tracking_date_idx" ON "daily_time_tracking"("date");

-- CreateIndex
CREATE INDEX "daily_time_tracking_totalSeconds_idx" ON "daily_time_tracking"("totalSeconds");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compositions" ADD CONSTRAINT "compositions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "composition_completions" ADD CONSTRAINT "composition_completions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "composition_completions" ADD CONSTRAINT "composition_completions_compositionId_fkey" FOREIGN KEY ("compositionId") REFERENCES "compositions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "composition_progress" ADD CONSTRAINT "composition_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "composition_progress" ADD CONSTRAINT "composition_progress_compositionId_fkey" FOREIGN KEY ("compositionId") REFERENCES "compositions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "composition_favorites" ADD CONSTRAINT "composition_favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "composition_favorites" ADD CONSTRAINT "composition_favorites_compositionId_fkey" FOREIGN KEY ("compositionId") REFERENCES "compositions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "composition_reactions" ADD CONSTRAINT "composition_reactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "composition_reactions" ADD CONSTRAINT "composition_reactions_compositionId_fkey" FOREIGN KEY ("compositionId") REFERENCES "compositions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kanban_tasks" ADD CONSTRAINT "kanban_tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_points" ADD CONSTRAINT "user_points_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "badge_criteria" ADD CONSTRAINT "badge_criteria_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_time_tracking" ADD CONSTRAINT "daily_time_tracking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
