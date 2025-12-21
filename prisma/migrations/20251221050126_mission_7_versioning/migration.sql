-- AlterTable
ALTER TABLE "AssetBundle" ADD COLUMN "approvalNotes" TEXT;
ALTER TABLE "AssetBundle" ADD COLUMN "approvedAt" DATETIME;
ALTER TABLE "AssetBundle" ADD COLUMN "approvedByUserId" TEXT;

-- AlterTable
ALTER TABLE "Offer" ADD COLUMN "approvalNotes" TEXT;
ALTER TABLE "Offer" ADD COLUMN "approvedAt" DATETIME;
ALTER TABLE "Offer" ADD COLUMN "approvedByUserId" TEXT;

-- AlterTable
ALTER TABLE "ResearchReport" ADD COLUMN "approvalNotes" TEXT;
ALTER TABLE "ResearchReport" ADD COLUMN "approvedAt" DATETIME;
ALTER TABLE "ResearchReport" ADD COLUMN "approvedByUserId" TEXT;

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT,
    "sourceOfferId" TEXT,
    "sourceAssetBundleId" TEXT,
    "templateJson" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "projectId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "metaJson" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "AuditLog_projectId_createdAt_idx" ON "AuditLog"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");
