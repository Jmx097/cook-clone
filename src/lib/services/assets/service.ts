import { createHash } from 'crypto';
import { prisma } from '../../db';
import { MockAssetProvider } from './mock_provider';
import { LLMAssetProvider } from './llm_provider';
import { getLLMClient } from '../../llm/provider';
import type { AssetInput, AssetResult } from './types';
import type { AssetBundle } from '../../../generated/prisma';
import type { ResearchReportContent } from '../research/types';
import type { OfferContentJson } from '../offer/types';

export class AssetService {
  
  // ============================================
  // HASH COMPUTATION
  // ============================================
  private computeInputHash(input: AssetInput, offerVersion: number): string {
    const normalized = {
      projectId: input.projectId,
      idea: input.idea.trim(),
      offerVersion: offerVersion,
      // We hash core inputs to detect changes
      brandVoice: input.brandVoiceBrief.trim(),
    };
    
    // Sort keys
    const sorted = Object.keys(normalized).sort().reduce((acc, key) => {
      acc[key] = normalized[key as keyof typeof normalized];
      return acc;
    }, {} as Record<string, unknown>);

    return createHash('sha256').update(JSON.stringify(sorted)).digest('hex');
  }

  // ============================================
  // GENERATION
  // ============================================

  async generate(projectId: string): Promise<AssetBundle> {
    // 1. Fetch Project
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });
    if (!project) throw new Error('Project not found');

    // 2. Fetch Latest FINAL Research
    const research = await prisma.researchReport.findFirst({
      where: { projectId, status: 'FINAL' },
      orderBy: { version: 'desc' }
    });
    if (!research) throw new Error('Final Research Report required to generate assets.');

    // 3. Fetch Latest FINAL Offer
    const offer = await prisma.offer.findFirst({
      where: { projectId, status: 'FINAL' },
      orderBy: { version: 'desc' }
    });
    if (!offer) throw new Error('Final Offer required to generate assets.');

    // 4. Build Input
    const input: AssetInput = {
      projectId,
      idea: project.idea,
      targetMarket: project.targetMarket,
      revenueGoal: project.revenueGoal,
      brandVoiceBrief: project.brandVoiceBrief,
      researchContent: research.content as unknown as ResearchReportContent,
      offerContent: offer.contentJson as unknown as OfferContentJson,
    };

    // 5. Create Draft Record
    const latest = await prisma.assetBundle.findFirst({
      where: { projectId },
      orderBy: { version: 'desc' },
      select: { version: true }
    });
    const nextVersion = (latest?.version ?? 0) + 1;

    const bundle = await prisma.assetBundle.create({
      data: {
        projectId,
        version: nextVersion,
        status: 'DRAFT',
      }
    });

    try {
      // 6. Select Provider & Generate
      const llmClient = await getLLMClient();
      const provider = llmClient ? new LLMAssetProvider(llmClient) : new MockAssetProvider();

      console.log(`[AssetService] Generating assets with provider: ${llmClient ? 'LLM' : 'Mock'}`);
      const result = await provider.generateAssets(input);

      // 7. Save to DB
      const finalBundle = await prisma.assetBundle.update({
        where: { id: bundle.id },
        data: {
          status: 'FINAL',
          landingCopy: result.landingCopy as object,
          emails: result.emails as object,
          ads: result.ads as object,
          // salesScript & videoScript not implemented in prompt yet, leave null
        }
      });

      return finalBundle;

    } catch (error) {
      console.error('[AssetService] Generation Failed:', error);
      await prisma.assetBundle.update({
        where: { id: bundle.id },
        data: { status: 'FAILED' }
      });
      throw error;
    }
  }

  async getLatestBundle(projectId: string): Promise<AssetBundle | null> {
    return prisma.assetBundle.findFirst({
      where: { projectId },
      orderBy: { version: 'desc' }
    });
  }
}

export const assetService = new AssetService();
