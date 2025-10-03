-- CreateTable
CREATE TABLE "daily_compositions" (
    "id" TEXT NOT NULL,
    "compositionId" VARCHAR(255) NOT NULL,
    "dateKey" VARCHAR(10) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_compositions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_compositions_dateKey_key" ON "daily_compositions"("dateKey");

-- CreateIndex
CREATE INDEX "daily_compositions_dateKey_idx" ON "daily_compositions"("dateKey");

-- CreateIndex
CREATE INDEX "daily_compositions_compositionId_idx" ON "daily_compositions"("compositionId");

-- AddForeignKey
ALTER TABLE "daily_compositions" ADD CONSTRAINT "daily_compositions_compositionId_fkey" FOREIGN KEY ("compositionId") REFERENCES "compositions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
