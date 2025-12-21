import { prisma } from '../db';
import type { AssetBundle, ReportStatus } from '../../generated/prisma';

export interface CreateAssetBundleInput {
  projectId: string;
  landingCopy?: object;
  emails?: object;
  ads?: object;
  salesScript?: object;
  videoScript?: object;
}

// Create a new asset bundle version
export async function createAssetBundle(data: CreateAssetBundleInput): Promise<AssetBundle> {
  const latest = await prisma.assetBundle.findFirst({
    where: { projectId: data.projectId },
    orderBy: { version: 'desc' },
    select: { version: true },
  });
  
  const nextVersion = (latest?.version ?? 0) + 1;
  
  return prisma.assetBundle.create({
    data: {
      projectId: data.projectId,
      version: nextVersion,
      status: 'DRAFT',
      landingCopy: data.landingCopy,
      emails: data.emails,
      ads: data.ads,
      salesScript: data.salesScript,
      videoScript: data.videoScript,
    },
  });
}

// Get the latest asset bundle for a project
export async function getLatestAssetBundle(projectId: string): Promise<AssetBundle | null> {
  return prisma.assetBundle.findFirst({
    where: { projectId },
    orderBy: { version: 'desc' },
  });
}

// List all versions
export async function listAssetVersions(projectId: string): Promise<AssetBundle[]> {
  return prisma.assetBundle.findMany({
    where: { projectId },
    orderBy: { version: 'desc' },
  });
}

// Update asset bundle status
export async function updateAssetStatus(id: string, status: ReportStatus): Promise<AssetBundle> {
  return prisma.assetBundle.update({
    where: { id },
    data: { status },
  });
}
