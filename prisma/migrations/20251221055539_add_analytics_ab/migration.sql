-- DropIndex
DROP INDEX "Lead_landingPageVariantId_createdAt_idx";

-- DropIndex
DROP INDEX "Lead_projectId_createdAt_idx";

-- CreateTable
CREATE TABLE "PageViewEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "landingPageVariantId" TEXT,
    "slug" TEXT NOT NULL,
    "referrer" TEXT,
    "utmJson" JSONB,
    "sessionKey" TEXT,
    "ipHash" TEXT,
    "userAgentHash" TEXT,
    "metaJson" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PageViewEvent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConversionEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "landingPageVariantId" TEXT,
    "leadId" TEXT,
    "revenue" REAL NOT NULL DEFAULT 0,
    "utmJson" JSONB,
    "sessionKey" TEXT,
    "ipHash" TEXT,
    "metaJson" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConversionEvent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ABTest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "controlVariantId" TEXT NOT NULL,
    "challengerVariantIds" JSONB NOT NULL,
    "trafficWeightsJson" JSONB NOT NULL,
    "winnerVariantId" TEXT,
    "startedAt" DATETIME,
    "endedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ABTest_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ABTestAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "abTestId" TEXT NOT NULL,
    "assignmentKeyHash" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ABTestAssignment_abTestId_fkey" FOREIGN KEY ("abTestId") REFERENCES "ABTest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "PageViewEvent_projectId_createdAt_idx" ON "PageViewEvent"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "PageViewEvent_landingPageVariantId_createdAt_idx" ON "PageViewEvent"("landingPageVariantId", "createdAt");

-- CreateIndex
CREATE INDEX "ConversionEvent_projectId_createdAt_idx" ON "ConversionEvent"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "ConversionEvent_landingPageVariantId_createdAt_idx" ON "ConversionEvent"("landingPageVariantId", "createdAt");

-- CreateIndex
CREATE INDEX "ABTest_projectId_status_idx" ON "ABTest"("projectId", "status");

-- CreateIndex
CREATE INDEX "ABTestAssignment_createdAt_idx" ON "ABTestAssignment"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ABTestAssignment_abTestId_assignmentKeyHash_key" ON "ABTestAssignment"("abTestId", "assignmentKeyHash");
