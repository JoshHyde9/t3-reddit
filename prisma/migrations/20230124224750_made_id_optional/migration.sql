/*
  Warnings:

  - The primary key for the `Vote` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Vote" (
    "id" TEXT,
    "value" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "commentUserId" TEXT,
    "commentPostId" TEXT,

    PRIMARY KEY ("userId", "postId"),
    CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Vote_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Vote_id_commentUserId_commentPostId_fkey" FOREIGN KEY ("id", "commentUserId", "commentPostId") REFERENCES "Comment" ("id", "userId", "postId") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Vote" ("commentPostId", "commentUserId", "id", "postId", "userId", "value") SELECT "commentPostId", "commentUserId", "id", "postId", "userId", "value" FROM "Vote";
DROP TABLE "Vote";
ALTER TABLE "new_Vote" RENAME TO "Vote";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
