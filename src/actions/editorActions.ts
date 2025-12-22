'use server';

import { prisma } from '@/lib/db';
import { generateLandingPage } from '@/services/landingPageGenerator';
import { revalidatePath } from 'next/cache';


export async function generateLandingPageVariant(projectId: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        assetBundles: { orderBy: { version: 'desc' }, take: 1 },
        offers: { orderBy: { version: 'desc' }, take: 1 },
        researchReports: { orderBy: { version: 'desc' }, take: 1 },
      },
    });

    if (!project) throw new Error('Project not found');
    
    // We need at least Assets and Offer to generate a page
    const assetBundle = project.assetBundles[0];
    const offer = project.offers[0];
    
    if (!assetBundle || !offer) {
      throw new Error('Project must have at least one Asset Bundle and Offer to generate a page.');
    }

    const research = project.researchReports[0];

    const content = await generateLandingPage(projectId, assetBundle, offer, research);

    // Create new Variant
    // Get max version
    const lastVariant = await prisma.landingPageVariant.findFirst({
      where: { projectId },
      orderBy: { version: 'desc' },
    });
    const version = (lastVariant?.version || 0) + 1;

    const variant = await prisma.landingPageVariant.create({
      data: {
        projectId,
        version,
        status: 'DRAFT',
        title: `Landing Page v${version}`,
        pageJson: content as any,
        metaJson: {
          generatedAt: new Date(),
          sourceAssetBundleId: assetBundle.id,
          sourceOfferId: offer.id,
        },
      },
    });

    revalidatePath(`/project/${projectId}/pages`);
    return { success: true, data: variant };
  } catch (error) {
    console.error('Failed to generate landing page', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function updateLandingPageVariant(id: string, pageJson: any) {
  try {
    const variant = await prisma.landingPageVariant.findUnique({ where: { id } });
    if (!variant) throw new Error('Variant not found');
    if (variant.status !== 'DRAFT') throw new Error('Cannot edit a non-draft variant.');

    await prisma.landingPageVariant.update({
      where: { id },
      data: {
        pageJson: pageJson,
      },
    });

    revalidatePath(`/project/${variant.projectId}/pages`);
    return { success: true };
  } catch (error) {
    console.error('Failed to update variant', error);
    return { success: false, error: String(error) };
  }
}

export async function publishLandingPageVariant(id: string, slug: string) {
  try {
    const variant = await prisma.landingPageVariant.findUnique({ where: { id } });
    if (!variant) throw new Error('Variant not found');
    if (variant.status !== 'DRAFT') throw new Error('Only drafts can be published.');

    // Validate Slug uniqueness (globally or per project? Directive says unique published)
    // Schema has @@unique([slug])
    const existing = await prisma.landingPageVariant.findUnique({ where: { slug } });
    if (existing && existing.id !== id) {
       // If existing is this project, archive it?
       // Directive: "If there is an existing PUBLISHED variant for this project/slug, it flips to ARCHIVED."
       // But if it's ANOTHER project's slug, we can't use it.
       if (existing.projectId !== variant.projectId && existing.status === 'PUBLISHED') {
           throw new Error('Slug is already taken by another project.');
       }
    }

    // Archive current published for this project
    await prisma.landingPageVariant.updateMany({
      where: { projectId: variant.projectId, status: 'PUBLISHED' },
      data: { status: 'ARCHIVED', slug: null }, // Free up the slug? Or keep it? 
      // If we keep slug, we violate unique constraint unless we change it.
      // Easiest: append timestamp to old slug or nullify. Schema allows null slug.
      // Let's nullify slug for archived.
    });

    // Publish new
    await prisma.landingPageVariant.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        slug,
        approvedAt: new Date(),
      },
    });
    
    // Audit Log
    await prisma.auditLog.create({
      data: {
        projectId: variant.projectId, // Assuming AuditLog has projectId
        entityType: 'LandingPageVariant',
        entityId: id,
        action: 'PAGE_PUBLISHED',
        metaJson: { slug },
      },
    });

    revalidatePath(`/project/${variant.projectId}/pages`);
    return { success: true };

  } catch (error) {
    console.error('Failed to publish', error);
    return { success: false, error: String(error) };
  }
}

export async function createDraftFromPublished(publishedId: string) {
  try {
    const old = await prisma.landingPageVariant.findUnique({ where: { id: publishedId } });
    if (!old) throw new Error('Variant not found');

    // Get new version
    const last = await prisma.landingPageVariant.findFirst({
      where: { projectId: old.projectId },
      orderBy: { version: 'desc' },
    });
    const version = (last?.version || 0) + 1;

    const draft = await prisma.landingPageVariant.create({
      data: {
        projectId: old.projectId,
        version,
        status: 'DRAFT',
        title: `${old.title} (Draft)`,
        pageJson: old.pageJson!, // clone content
        metaJson: old.metaJson || {},
      },
    });

    revalidatePath(`/project/${old.projectId}/pages`);
    return { success: true, data: draft };
  } catch (error) {
    console.error('Failed to create draft', error);
    return { success: false, error: String(error) };
  }
}
