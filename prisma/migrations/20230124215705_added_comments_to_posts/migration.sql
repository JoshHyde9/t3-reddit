-- CreateTable
CREATE TABLE "Comment" (
    "message" TEXT NOT NULL,
    "edited" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "commentUserId" TEXT,
    "commentPostId" TEXT,

    PRIMARY KEY ("userId", "postId"),
    CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Comment_commentUserId_commentPostId_fkey" FOREIGN KEY ("commentUserId", "commentPostId") REFERENCES "Comment" ("userId", "postId") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Vote" (
    "value" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "commentUserId" TEXT,
    "commentPostId" TEXT,

    PRIMARY KEY ("userId", "postId"),
    CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Vote_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Vote_commentUserId_commentPostId_fkey" FOREIGN KEY ("commentUserId", "commentPostId") REFERENCES "Comment" ("userId", "postId") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Vote" ("postId", "userId", "value") SELECT "postId", "userId", "value" FROM "Vote";
DROP TABLE "Vote";
ALTER TABLE "new_Vote" RENAME TO "Vote";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
