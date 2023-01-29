/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Sub` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Sub_name_key" ON "Sub"("name");
