-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Song" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "partyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "externalID" TEXT NOT NULL,
    "artworkUrl" TEXT NOT NULL,
    "previewUrl" TEXT NOT NULL,
    "addedById" TEXT NOT NULL,
    "played" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Song_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Song_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "Participant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Song" ("addedById", "artist", "artworkUrl", "createdAt", "externalID", "id", "partyId", "previewUrl", "title") SELECT "addedById", "artist", "artworkUrl", "createdAt", "externalID", "id", "partyId", "previewUrl", "title" FROM "Song";
DROP TABLE "Song";
ALTER TABLE "new_Song" RENAME TO "Song";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
