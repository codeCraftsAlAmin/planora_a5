-- DropIndex
DROP INDEX "reviews_eventId_userId_key";

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "parentId" TEXT;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
