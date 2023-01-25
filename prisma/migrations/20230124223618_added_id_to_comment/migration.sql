/*
  Warnings:

  - The primary key for the `Vote` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Comment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The required column `id` was added to the `Vote` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `Comment` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Vote" (
    "id" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "commentUserId" TEXT,
    "commentPostId" TEXT,

    PRIMARY KEY ("id", "userId", "postId"),
    CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Vote_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Vote_id_commentUserId_commentPostId_fkey" FOREIGN KEY ("id", "commentUserId", "commentPostId") REFERENCES "Comment" ("id", "userId", "postId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Vote" ("commentPostId", "commentUserId", "postId", "userId", "value") SELECT "commentPostId", "commentUserId", "postId", "userId", "value" FROM "Vote";
DROP TABLE "Vote";
ALTER TABLE "new_Vote" RENAME TO "Vote";
CREATE TABLE "new_Comment" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "edited" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "commentUserId" TEXT,
    "commentPostId" TEXT,

    PRIMARY KEY ("id", "userId", "postId"),
    CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Comment_id_commentUserId_commentPostId_fkey" FOREIGN KEY ("id", "commentUserId", "commentPostId") REFERENCES "Comment" ("id", "userId", "postId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Comment" ("commentPostId", "commentUserId", "createdAt", "edited", "message", "postId", "updatedAt", "userId") SELECT "commentPostId", "commentUserId", "createdAt", "edited", "message", "postId", "updatedAt", "userId" FROM "Comment";
DROP TABLE "Comment";
ALTER TABLE "new_Comment" RENAME TO "Comment";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
