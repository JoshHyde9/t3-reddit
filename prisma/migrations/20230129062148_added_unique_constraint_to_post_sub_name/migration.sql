/*
  Warnings:

  - A unique constraint covering the columns `[subName]` on the table `Post` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Post_subName_key" ON "Post"("subName");
