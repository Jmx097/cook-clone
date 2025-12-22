import { createHash } from 'crypto';
import { prisma } from '../../db';
import { MockResearchProvider } from './mock_provider';
import { ResearchInput } from './types';
import { getLLMClient } from '../../llm/provider';
import { LLMResearchProvider } from './llm_provider';

export class ResearchService {
  // Dynamic provider selection per request


  // Generate a stable hash from input fields
  private computeInputHash(input: ResearchInput): string {
    const normalized = {
      idea: input.idea.trim(),
      targetMarket: input.targetMarket.trim(),
      revenueGoal: input.revenueGoal.trim(),
      brandVoiceBrief: input.brandVoiceBrief.trim(),
    };
    
    // Sort keys to ensure stable JSON
    const sorted = Object.keys(normalized).sort().reduce((acc, key) => {
      acc[key as keyof typeof normalized] = normalized[key as keyof typeof normalized];
      return acc;
    }, {} as Record<string, string>);

    return createHash('sha256').update(JSON.stringify(sorted)).digest('hex');
  }

  async generate(projectId: string, forceRefresh = false) {
    // 1. Fetch project to get inputs
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) throw new Error('Project not found');

    const input: ResearchInput = {
      projectId: project.id,
      idea: project.idea,
      targetMarket: project.targetMarket,
      revenueGoal: project.revenueGoal,
      brandVoiceBrief: project.brandVoiceBrief,
    };

    const inputHash = this.computeInputHash(input);

    // 2. Check cache (unless force refresh)
    if (!forceRefresh) {
      const cached = await prisma.researchReport.findFirst({
        where: {
          projectId,
          inputHash,
          status: 'FINAL',
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
        orderBy: { version: 'desc' },
      });

      if (cached) {
        console.log(`[ResearchService] Cache HIT for project ${projectId}`);
        return cached;
      }
    }

    console.log(`[ResearchService] Generating NEW report for ${projectId}`);

    // 3. Create new draft version
    const latest = await prisma.researchReport.findFirst({
      where: { projectId },
      orderBy: { version: 'desc' },
      select: { version: true },
    });
    
    const nextVersion = (latest?.version ?? 0) + 1;

    // Create DRAFT
    const report = await prisma.researchReport.create({
      data: {
        projectId,
        version: nextVersion,
        status: 'DRAFT',
        inputHash,
      },
    });

    try {
      // 4. Generate content
      // 4. Generate content
      const llmClient = await getLLMClient();
      const provider = llmClient ? new LLMResearchProvider(llmClient) : new MockResearchProvider();
      
      const result = await provider.generate(input);

      // 5. Update to FINAL
      const finalReport = await prisma.researchReport.update({
        where: { id: report.id },
        data: {
          status: 'FINAL',
          content: result.content as object,
          sources: result.sources as object,
        },
      });

      return finalReport;

    } catch (error) {
      console.error('[ResearchService] Generation Failed:', error);
      
      // Mark as FAILED
      await prisma.researchReport.update({
        where: { id: report.id },
        data: { status: 'FAILED' },
      });

      throw error;
    }
  }
}

// Singleton instance
export const researchService = new ResearchService();
