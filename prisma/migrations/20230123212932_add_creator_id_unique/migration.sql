/*
  Warnings:

  - A unique constraint covering the columns `[creatorId]` on the table `Post` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Post_creatorId_key" ON "Post"("creatorId");
