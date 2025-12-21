-- CreateTable
CREATE TABLE "LandingPageVariant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "slug" TEXT,
    "title" TEXT,
    "pageJson" JSONB NOT NULL,
    "metaJson" JSONB,
    "approvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LandingPageVariant_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "landingPageVariantId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT,
    "utmJson" JSONB,
    "referrer" TEXT,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Lead_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "LandingPageVariant_projectId_createdAt_idx" ON "LandingPageVariant"("projectId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "LandingPageVariant_projectId_version_key" ON "LandingPageVariant"("projectId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "LandingPageVariant_slug_key" ON "LandingPageVariant"("slug");

-- CreateIndex
CREATE INDEX "Lead_projectId_createdAt_idx" ON "Lead"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "Lead_landingPageVariantId_createdAt_idx" ON "Lead"("landingPageVariantId", "createdAt");

-- CreateIndex
CREATE INDEX "Lead_status_createdAt_idx" ON "Lead"("status", "createdAt");
