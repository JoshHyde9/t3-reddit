/*
  Warnings:

  - A unique constraint covering the columns `[subName]` on the table `Post` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,creatorId]` on the table `Post` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Post_id_creatorId_subName_key";

-- CreateIndex
CREATE UNIQUE INDEX "Post_subName_key" ON "Post"("subName");

-- CreateIndex
CREATE UNIQUE INDEX "Post_id_creatorId_key" ON "Post"("id", "creatorId");
