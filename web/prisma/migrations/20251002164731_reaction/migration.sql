-- CreateEnum
CREATE TYPE "ReactionType" AS ENUM ('LIKE', 'DISLIKE');

-- CreateTable
CREATE TABLE "composition_reaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "compositionId" TEXT NOT NULL,
    "value" "ReactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "composition_reaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "composition_reaction_compositionId_value_idx" ON "composition_reaction"("compositionId", "value");

-- CreateIndex
CREATE INDEX "composition_reaction_userId_idx" ON "composition_reaction"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "composition_reaction_userId_compositionId_key" ON "composition_reaction"("userId", "compositionId");

-- AddForeignKey
ALTER TABLE "composition_reaction" ADD CONSTRAINT "composition_reaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "composition_reaction" ADD CONSTRAINT "composition_reaction_compositionId_fkey" FOREIGN KEY ("compositionId") REFERENCES "composition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
