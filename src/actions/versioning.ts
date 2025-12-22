'use server';

import { prisma, getDevUser } from '../lib/db';
import { logAuditEvent } from './audit';
import { revalidatePath } from 'next/cache';

type VersionedEntity = 'ResearchReport' | 'AssetBundle' | 'Offer';

/**
 * Approve a specific version of an entity.
 * Locks it from further edits.
 */
export async function approveVersion(
  entityType: VersionedEntity,
  entityId: string,
  projectId: string,
  pathContext?: string
) {
  const user = await getDevUser();
  const now = new Date();

  try {
    // Dynamic query based on entityType
    // Note: Prisma doesn't support dynamic model access easily without raw query or mapped types.
    // We'll use a switch for type safety.
    
    if (entityType === 'ResearchReport') {
      await prisma.researchReport.update({
        where: { id: entityId },
        data: { approvedAt: now, approvedByUserId: user.id },
      });
    } else if (entityType === 'AssetBundle') {
      await prisma.assetBundle.update({
        where: { id: entityId },
        data: { approvedAt: now, approvedByUserId: user.id },
      });
    } else if (entityType === 'Offer') {
      await prisma.offer.update({
        where: { id: entityId },
        data: { approvedAt: now, approvedByUserId: user.id },
      });
    } else {
      throw new Error(`Unknown entity type: ${entityType}`);
    }

    await logAuditEvent({
      projectId,
      entityType,
      entityId,
      action: 'VERSION_APPROVED',
      meta: { approvedAt: now },
    });

    if (pathContext) {
      revalidatePath(pathContext);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Failed to approve version:', error);
    return { success: false, error: 'Failed to approve version' };
  }
}

/**
 * Create a new DRAFT version starting from an existing APPROVED version.
 * This is "Forking" or "Iterating" safely.
 */
export async function createDraftFromApproved(
  entityType: VersionedEntity,
  sourceId: string,
  projectId: string,
  pathContext?: string
) {
  try {
    // 1. Fetch source
    let sourceRecord: any;
    let newVersion = 1;

    // Helper to get max version
    const getMaxVersion = async (modelDelegate: any, pId: string) => {
      const agg = await modelDelegate.aggregate({
        where: { projectId: pId },
        _max: { version: true },
      });
      return (agg._max.version || 0) + 1;
    };

    if (entityType === 'ResearchReport') {
      sourceRecord = await prisma.researchReport.findUnique({ where: { id: sourceId } });
      if (!sourceRecord) throw new Error('Source not found');
      newVersion = await getMaxVersion(prisma.researchReport, projectId);
      
      await prisma.researchReport.create({
        data: {
          projectId,
          version: newVersion,
          status: 'DRAFT',
          content: sourceRecord.content,
          sources: sourceRecord.sources,
          inputHash: sourceRecord.inputHash, // Inherit hash initially
        },
      });

    } else if (entityType === 'AssetBundle') {
      sourceRecord = await prisma.assetBundle.findUnique({ where: { id: sourceId } });
      if (!sourceRecord) throw new Error('Source not found');
      newVersion = await getMaxVersion(prisma.assetBundle, projectId);

      await prisma.assetBundle.create({
        data: {
          projectId,
          version: newVersion,
          status: 'DRAFT',
          landingCopy: sourceRecord.landingCopy,
          emails: sourceRecord.emails,
          ads: sourceRecord.ads,
          salesScript: sourceRecord.salesScript,
          videoScript: sourceRecord.videoScript,
        },
      });

    } else if (entityType === 'Offer') {
      sourceRecord = await prisma.offer.findUnique({ where: { id: sourceId } });
      if (!sourceRecord) throw new Error('Source not found');
      newVersion = await getMaxVersion(prisma.offer, projectId);

      await prisma.offer.create({
        data: {
          projectId,
          version: newVersion,
          status: 'DRAFT',
          contentJson: sourceRecord.contentJson,
          metaJson: sourceRecord.metaJson,
          // Copy legacy fields too for now
          tiers: sourceRecord.tiers,
          upsells: sourceRecord.upsells,
          guarantee: sourceRecord.guarantee,
          rationale: sourceRecord.rationale,
          inputHash: sourceRecord.inputHash,
        },
      });
    }

    await logAuditEvent({
      projectId,
      entityType,
      entityId: sourceId, // Log against source for provenance
      action: 'DRAFT_CREATED_FROM_APPROVED',
      meta: { newVersion },
    });

    if (pathContext) {
      revalidatePath(pathContext);
    }

    return { success: true, newVersion };
  } catch {
    return { success: false, error: 'Failed to create new draft' };
  }
}

export async function getVersions(
  entityType: VersionedEntity,
  projectId: string
) {
  try {
    let versions;
    
    // Dynamic fetch based on type
    if (entityType === 'ResearchReport') {
      versions = await prisma.researchReport.findMany({
        where: { projectId },
        orderBy: { version: 'desc' },
        select: { id: true, version: true, status: true, approvedAt: true, createdAt: true }
      });
    } else if (entityType === 'AssetBundle') {
      versions = await prisma.assetBundle.findMany({
        where: { projectId },
        orderBy: { version: 'desc' },
        select: { id: true, version: true, status: true, approvedAt: true, createdAt: true }
      });
    } else if (entityType === 'Offer') {
      versions = await prisma.offer.findMany({
        where: { projectId },
        orderBy: { version: 'desc' },
        select: { id: true, version: true, status: true, approvedAt: true, createdAt: true }
      });
    }
    
    return versions || [];
  } catch (error) {
    console.error('Failed to fetch versions:', error);
    return [];
  }
}

export async function getLatestApproved(
  entityType: VersionedEntity,
  projectId: string
) {
  try {
    // Dynamic fetch
    if (entityType === 'ResearchReport') {
      return await prisma.researchReport.findFirst({
        where: { projectId, approvedAt: { not: null } },
        orderBy: { version: 'desc' },
      });
    } else if (entityType === 'AssetBundle') {
      return await prisma.assetBundle.findFirst({
        where: { projectId, approvedAt: { not: null } },
        orderBy: { version: 'desc' },
      });
    } else if (entityType === 'Offer') {
      return await prisma.offer.findFirst({
        where: { projectId, approvedAt: { not: null } },
        orderBy: { version: 'desc' },
      });
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch latest approved:', error);
    return null;
  }
}
