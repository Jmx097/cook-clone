import { prisma } from '../db';
import type { Offer, ReportStatus } from '../../generated/prisma';
import type { OfferContentJson, OfferMetaJson } from '../services/offer/types';

export interface CreateOfferInput {
  projectId: string;
  contentJson?: OfferContentJson;
  metaJson?: OfferMetaJson;
  inputHash?: string;
  // Legacy fields (for backward compatibility)
  tiers?: object[];
  upsells?: object[];
  guarantee?: string;
  rationale?: string;
}

// Create a new offer version
export async function createOffer(data: CreateOfferInput): Promise<Offer> {
  const latest = await prisma.offer.findFirst({
    where: { projectId: data.projectId },
    orderBy: { version: 'desc' },
    select: { version: true },
  });
  
  const nextVersion = (latest?.version ?? 0) + 1;
  
  return prisma.offer.create({
    data: {
      projectId: data.projectId,
      version: nextVersion,
      status: 'DRAFT',
      // New structured fields
      contentJson: data.contentJson as object,
      metaJson: data.metaJson as object,
      inputHash: data.inputHash,
      // Legacy fields
      tiers: data.tiers,
      upsells: data.upsells,
      guarantee: data.guarantee,
      rationale: data.rationale,
    },
  });
}

// Get offer by ID
export async function getOfferById(id: string): Promise<Offer | null> {
  return prisma.offer.findUnique({
    where: { id },
  });
}

// Get the latest offer for a project
export async function getLatestOffer(projectId: string): Promise<Offer | null> {
  return prisma.offer.findFirst({
    where: { projectId },
    orderBy: { version: 'desc' },
  });
}

// List all versions
export async function listOfferVersions(projectId: string): Promise<Offer[]> {
  return prisma.offer.findMany({
    where: { projectId },
    orderBy: { version: 'desc' },
  });
}

// Update offer status
export async function updateOfferStatus(id: string, status: ReportStatus): Promise<Offer> {
  return prisma.offer.update({
    where: { id },
    data: { status },
  });
}

// Update offer content and meta
export async function updateOfferContent(
  id: string, 
  contentJson: OfferContentJson, 
  metaJson: OfferMetaJson
): Promise<Offer> {
  return prisma.offer.update({
    where: { id },
    data: {
      contentJson: contentJson as object,
      metaJson: metaJson as object,
    },
  });
}

