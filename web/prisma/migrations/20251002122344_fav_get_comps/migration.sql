-- CreateTable
CREATE TABLE "composition_favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "compositionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "composition_favorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "composition_favorite_userId_idx" ON "composition_favorite"("userId");

-- CreateIndex
CREATE INDEX "composition_favorite_compositionId_idx" ON "composition_favorite"("compositionId");

-- CreateIndex
CREATE UNIQUE INDEX "composition_favorite_userId_compositionId_key" ON "composition_favorite"("userId", "compositionId");

-- AddForeignKey
ALTER TABLE "composition_favorite" ADD CONSTRAINT "composition_favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "composition_favorite" ADD CONSTRAINT "composition_favorite_compositionId_fkey" FOREIGN KEY ("compositionId") REFERENCES "composition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
