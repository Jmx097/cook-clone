import { createHash } from 'crypto';
import { prisma } from '../../db';
import { MockOfferProvider } from './mock_provider';
import { validateOffer } from './validation';
import { getLLMClient } from '../../llm/provider';
import { LLMOfferProvider } from './llm_provider';
import type { 
  OfferInput, 
  OfferProvider, 
  OfferContentJson, 
  OfferMetaJson,
  SectionKey,
  FieldProvenance,
  OfferTier,
  OfferUpsell,
  OfferGuarantee,
} from './types';
import type { ResearchReportContent } from '../research/types';
import type { Offer } from '../../../generated/prisma';

const OFFER_BUILDER_VERSION = '1.0.0';

export class OfferService {
  // Dynamic provider support


  // ============================================
  // HASH COMPUTATION
  // ============================================

  private computeInputHash(input: OfferInput, researchVersion: number): string {
    const normalized = {
      idea: input.idea.trim(),
      targetMarket: input.targetMarket.trim(),
      revenueGoal: input.revenueGoal.trim(),
      brandVoiceBrief: input.brandVoiceBrief.trim(),
      researchVersion,
      offerBuilderVersion: OFFER_BUILDER_VERSION,
    };
    
    // Sort keys to ensure stable JSON
    const sorted = Object.keys(normalized).sort().reduce((acc, key) => {
      acc[key] = normalized[key as keyof typeof normalized];
      return acc;
    }, {} as Record<string, unknown>);

    return createHash('sha256').update(JSON.stringify(sorted)).digest('hex');
  }

  // ============================================
  // LEGACY MIGRATION HELPER
  // ============================================

  /**
   * Auto-migrate legacy Offer records (from Mission 2) to new contentJson structure.
   * Called transparently when reading an offer.
   */
  private migrateLegacyOffer(offer: Offer): OfferContentJson | null {
    // If new contentJson exists, use it
    if (offer.contentJson) {
      return offer.contentJson as unknown as OfferContentJson;
    }
    
    // Check if legacy fields exist
    if (!offer.tiers && !offer.upsells && !offer.guarantee) {
      return null;
    }
    
    // Transform legacy → new structure
    const legacyContent: OfferContentJson = {
      positioning: { 
        oneLiner: '', 
        whoItsFor: '', 
        whyNow: '' 
      },
      tiers: (offer.tiers as unknown as OfferTier[]) || [],
      upsells: (offer.upsells as unknown as OfferUpsell[]) || [],
      guarantee: offer.guarantee 
        ? { 
            type: 'custom', 
            terms: offer.guarantee as string, 
            complianceNotes: 'Legacy guarantee - please review for compliance.' 
          }
        : { type: '', terms: '', complianceNotes: '' },
      rationale: { 
        painPointMapping: [], 
        objectionsAndResponses: [] 
      },
    };
    
    return legacyContent;
  }

  // ============================================
  // MAIN OPERATIONS
  // ============================================

  /**
   * Generate a complete new offer for a project.
   * Creates a new version, validates, and sets status.
   */
  async generate(projectId: string): Promise<Offer> {
    // 1. Fetch project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // 2. Fetch latest FINAL research report (required)
    const researchReport = await prisma.researchReport.findFirst({
      where: { 
        projectId, 
        status: 'FINAL' 
      },
      orderBy: { version: 'desc' },
    });

    if (!researchReport) {
      throw new Error('Research report required for offer generation. Please generate research first.');
    }

    if (researchReport.status !== 'FINAL') {
      throw new Error('Research report must be FINAL status for offer generation.');
    }

    // 3. Build input
    const input: OfferInput = {
      projectId: project.id,
      idea: project.idea,
      targetMarket: project.targetMarket,
      revenueGoal: project.revenueGoal,
      brandVoiceBrief: project.brandVoiceBrief,
      researchContent: researchReport.content as unknown as ResearchReportContent,
    };

    const inputHash = this.computeInputHash(input, researchReport.version);

    // 4. Get next version
    const latest = await prisma.offer.findFirst({
      where: { projectId },
      orderBy: { version: 'desc' },
      select: { version: true },
    });
    
    const nextVersion = (latest?.version ?? 0) + 1;

    console.log(`[OfferService] Generating offer v${nextVersion} for project ${projectId}`);

    // 5. Create DRAFT offer
    const offer = await prisma.offer.create({
      data: {
        projectId,
        version: nextVersion,
        status: 'DRAFT',
        inputHash,
      },
    });

    try {
      // 6. Generate content via provider
      const llmClient = await getLLMClient();
      const provider = llmClient ? new LLMOfferProvider(llmClient) : new MockOfferProvider();
      
      const result = await provider.generateOffer(input);

      // 7. Validate content
      const validation = validateOffer(result.content);
      
      if (!validation.valid) {
        console.error('[OfferService] Validation failed:', validation.errors);
        
        // Update to FAILED status with errors in meta
        await prisma.offer.update({
          where: { id: offer.id },
          data: {
            status: 'FAILED',
            contentJson: result.content as object,
            metaJson: {
              ...result.meta,
              validationErrors: validation.errors,
            } as object,
          },
        });
        
        throw new Error(`Offer validation failed: ${validation.errors.join(', ')}`);
      }

      // Log warnings if any
      if (validation.warnings.length > 0) {
        console.warn('[OfferService] Validation warnings:', validation.warnings);
      }

      // 8. Update to FINAL with content
      const finalOffer = await prisma.offer.update({
        where: { id: offer.id },
        data: {
          status: 'FINAL',
          contentJson: result.content as object,
          metaJson: result.meta as object,
        },
      });

      console.log(`[OfferService] Offer v${nextVersion} generated successfully`);
      return finalOffer;

    } catch (error) {
      console.error('[OfferService] Generation failed:', error);
      
      // Mark as FAILED if not already
      await prisma.offer.update({
        where: { id: offer.id },
        data: { status: 'FAILED' },
      });

      throw error;
    }
  }

  /**
   * Save user edits to an existing offer.
   * Updates only changed fields, updates metaJson provenance.
   * Does NOT change version number.
   */
  async saveEdits(offerId: string, patch: Partial<OfferContentJson>): Promise<Offer> {
    // 1. Fetch existing offer
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
    });

    if (!offer) {
      throw new Error('Offer not found');
    }

    // 2. Get existing content (with legacy migration)
    const existingContent = this.migrateLegacyOffer(offer);
    if (!existingContent) {
      throw new Error('Offer has no content to edit');
    }

    // 3. Merge patch into existing content
    const updatedContent: OfferContentJson = {
      ...existingContent,
      ...patch,
    };

    // 4. Update metaJson with edit provenance
    const existingMeta = (offer.metaJson as unknown as OfferMetaJson) || {};
    const now = new Date().toISOString();
    const updatedMeta: OfferMetaJson = { ...existingMeta };

    // Mark edited sections
    for (const key of Object.keys(patch) as SectionKey[]) {
      updatedMeta[key] = {
        ...updatedMeta[key],
        editedAt: now,
        editedByUser: true,
      } as FieldProvenance;
    }

    // 5. Validate updated content
    const validation = validateOffer(updatedContent);
    if (!validation.valid) {
      throw new Error(`Edit validation failed: ${validation.errors.join(', ')}`);
    }

    // 6. Save updates
    const updatedOffer = await prisma.offer.update({
      where: { id: offerId },
      data: {
        contentJson: updatedContent as object,
        metaJson: updatedMeta as object,
      },
    });

    console.log(`[OfferService] Saved edits to offer ${offerId}`);
    return updatedOffer;
  }

  /**
   * Regenerate specific sections of an offer.
   * Creates a NEW version (OPTION A), preserving other sections.
   */
  async regenerateSections(offerId: string, sections: SectionKey[]): Promise<Offer> {
    // 1. Fetch existing offer
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
    });

    if (!offer) {
      throw new Error('Offer not found');
    }

    // 2. Get existing content
    const existingContent = this.migrateLegacyOffer(offer);
    if (!existingContent) {
      throw new Error('Offer has no content to regenerate');
    }

    // 3. Fetch project and research
    const project = await prisma.project.findUnique({
      where: { id: offer.projectId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const researchReport = await prisma.researchReport.findFirst({
      where: { 
        projectId: offer.projectId, 
        status: 'FINAL' 
      },
      orderBy: { version: 'desc' },
    });

    if (!researchReport) {
      throw new Error('Research report required for regeneration');
    }

    // 4. Build input
    const input: OfferInput = {
      projectId: project.id,
      idea: project.idea,
      targetMarket: project.targetMarket,
      revenueGoal: project.revenueGoal,
      brandVoiceBrief: project.brandVoiceBrief,
      researchContent: researchReport.content as unknown as ResearchReportContent,
    };

    const inputHash = this.computeInputHash(input, researchReport.version);

    // 5. Get next version
    const latest = await prisma.offer.findFirst({
      where: { projectId: offer.projectId },
      orderBy: { version: 'desc' },
      select: { version: true },
    });
    
    const nextVersion = (latest?.version ?? 0) + 1;

    console.log(`[OfferService] Regenerating sections [${sections.join(', ')}] → v${nextVersion}`);

    // 6. Regenerate specified sections via provider
    const llmClient = await getLLMClient();
    const provider = llmClient ? new LLMOfferProvider(llmClient) : new MockOfferProvider();

    const regeneratedSections = await provider.regenerateSections(
      input, 
      sections, 
      existingContent
    );

    // 7. Merge: keep existing content, replace only regenerated sections
    const newContent: OfferContentJson = {
      ...existingContent,
      ...regeneratedSections,
    };

    // 8. Build new metaJson (copy existing, update regenerated sections)
    const existingMeta = (offer.metaJson as unknown as OfferMetaJson) || {};
    const now = new Date().toISOString();
    const newMeta: OfferMetaJson = { ...existingMeta };

    for (const section of sections) {
      newMeta[section] = {
        generatedAt: now,
        provider: 'mock', // Update if using different provider
      };
    }

    // 9. Validate new content
    const validation = validateOffer(newContent);
    if (!validation.valid) {
      throw new Error(`Regeneration validation failed: ${validation.errors.join(', ')}`);
    }

    // 10. Create new version
    const newOffer = await prisma.offer.create({
      data: {
        projectId: offer.projectId,
        version: nextVersion,
        status: 'FINAL',
        contentJson: newContent as object,
        metaJson: newMeta as object,
        inputHash,
      },
    });

    console.log(`[OfferService] Created offer v${nextVersion} with regenerated sections`);
    return newOffer;
  }

  /**
   * Get the latest offer for a project, with legacy migration applied.
   */
  async getLatestOffer(projectId: string): Promise<{ offer: Offer; content: OfferContentJson | null } | null> {
    const offer = await prisma.offer.findFirst({
      where: { projectId },
      orderBy: { version: 'desc' },
    });

    if (!offer) {
      return null;
    }

    const content = this.migrateLegacyOffer(offer);
    return { offer, content };
  }
}

// Singleton instance
export const offerService = new OfferService();
