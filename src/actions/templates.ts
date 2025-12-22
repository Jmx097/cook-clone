'use server';

import { prisma, getDevUser } from '../lib/db';
import { logAuditEvent } from './audit';
import { revalidatePath } from 'next/cache';

interface CreateTemplateParams {
  name: string;
  description?: string;
  tags?: string; // Comma separated
  sourceOfferId: string;
  sourceAssetBundleId: string;
}

export async function createTemplate(params: CreateTemplateParams) {
  try {
    const _user = await getDevUser(); // Required for auth check

    // 1. Verify sources exist and are APPROVED
    const offer = await prisma.offer.findUnique({ where: { id: params.sourceOfferId } });
    const assets = await prisma.assetBundle.findUnique({ where: { id: params.sourceAssetBundleId } });

    if (!offer || !assets) throw new Error('Source not found');
    
    // Guardrail: must be approved
    if (!offer.approvedAt || !assets.approvedAt) {
      return { success: false, error: 'Source Offer and Asset Bundle must be APPROVED to create a template.' };
    }

    // 2. Build Snapshot
    const templateJson = {
      offer: {
        contentJson: offer.contentJson,
        metaJson: offer.metaJson,
        legacy: {
          tiers: offer.tiers,
          upsells: offer.upsells,
          guarantee: offer.guarantee,
          rationale: offer.rationale,
        }
      },
      assets: {
        landingCopy: assets.landingCopy,
        emails: assets.emails,
        ads: assets.ads,
        salesScript: assets.salesScript,
        videoScript: assets.videoScript
      },
      meta: {
        originalProject: offer.projectId,
        createdFromVersion: { offer: offer.version, assets: assets.version }
      }
    };

    // 3. Save
    const template = await prisma.template.create({
      data: {
        name: params.name,
        description: params.description,
        tags: params.tags,
        sourceOfferId: params.sourceOfferId,
        sourceAssetBundleId: params.sourceAssetBundleId,
        templateJson: templateJson as any, // Prisma Json handling
      },
    });

    await logAuditEvent({
      entityType: 'Template',
      entityId: template.id,
      action: 'TEMPLATE_CREATED',
      meta: { name: params.name },
    });

    revalidatePath('/auth/templates'); // Future proofing path
    return { success: true, templateId: template.id };

  } catch (error) {
    console.error('Failed to create template:', error);
    return { success: false, error: 'Failed to create template' };
  }
}

export async function getTemplates() {
  return await prisma.template.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function useTemplate(templateId: string, projectIdea: string) {
  try {
    const user = await getDevUser();
    
    // 1. Get Template
    const template = await prisma.template.findUnique({ where: { id: templateId } });
    if (!template) throw new Error('Template not found');

    const data = template.templateJson as any;

    // 2. Create Project
    const project = await prisma.project.create({
      data: {
        userId: user.id,
        idea: projectIdea,
        targetMarket: "Derived from Template", // Placeholder user can edit
        revenueGoal: "TBD",
        brandVoiceBrief: "Using " + template.name + " defaults",
      },
    });

    // 3. Instantiate Draft Offer
    await prisma.offer.create({
      data: {
        projectId: project.id,
        version: 1,
        status: 'DRAFT',
        contentJson: data.offer?.contentJson,
        metaJson: data.offer?.metaJson,
        tiers: data.offer?.legacy?.tiers,
        upsells: data.offer?.legacy?.upsells,
        guarantee: data.offer?.legacy?.guarantee,
        rationale: data.offer?.legacy?.rationale,
      },
    });

    // 4. Instantiate Draft Assets
    await prisma.assetBundle.create({
      data: {
        projectId: project.id,
        version: 1,
        status: 'DRAFT',
        landingCopy: data.assets?.landingCopy,
        emails: data.assets?.emails,
        ads: data.assets?.ads,
        salesScript: data.assets?.salesScript,
        videoScript: data.assets?.videoScript,
      },
    });

    await logAuditEvent({
      projectId: project.id,
      entityType: 'Project',
      entityId: project.id,
      action: 'TEMPLATE_USED',
      meta: { templateId: template.id, templateName: template.name },
    });

    return { success: true, projectId: project.id };

  } catch (error) {
    console.error('Template usage failed:', error);
    return { success: false, error: 'Failed to use template' };
  }
}
