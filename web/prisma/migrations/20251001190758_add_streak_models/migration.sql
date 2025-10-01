-- CreateTable
CREATE TABLE "composition" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,

    CONSTRAINT "composition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "composition_completion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "compositionId" TEXT,
    "dateKey" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "composition_completion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "composition_completion_userId_dateKey_idx" ON "composition_completion"("userId", "dateKey");

-- CreateIndex
CREATE UNIQUE INDEX "composition_completion_userId_dateKey_key" ON "composition_completion"("userId", "dateKey");

-- AddForeignKey
ALTER TABLE "composition" ADD CONSTRAINT "composition_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "composition_completion" ADD CONSTRAINT "composition_completion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "composition_completion" ADD CONSTRAINT "composition_completion_compositionId_fkey" FOREIGN KEY ("compositionId") REFERENCES "composition"("id") ON DELETE SET NULL ON UPDATE CASCADE;
