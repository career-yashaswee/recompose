-- AlterTable
ALTER TABLE "composition" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
