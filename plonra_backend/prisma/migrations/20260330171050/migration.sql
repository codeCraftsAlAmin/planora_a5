/*
  Warnings:

  - A unique constraint covering the columns `[eventId,inviteeId]` on the table `invitations` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "invitations_eventId_inviteeId_key" ON "invitations"("eventId", "inviteeId");
