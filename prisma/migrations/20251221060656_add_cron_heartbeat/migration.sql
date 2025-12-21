-- CreateTable
CREATE TABLE "CronHeartbeat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "lastRunAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "CronHeartbeat_key_key" ON "CronHeartbeat"("key");
