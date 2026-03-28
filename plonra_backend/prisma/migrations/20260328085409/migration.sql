/*
  Warnings:

  - Made the column `fee` on table `events` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "maxMembers" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "status" "EventStatus" NOT NULL DEFAULT 'UPCOMING',
ADD COLUMN     "totalMembers" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "fee" SET NOT NULL;

-- CreateIndex
CREATE INDEX "idx_events_status" ON "events"("status");
