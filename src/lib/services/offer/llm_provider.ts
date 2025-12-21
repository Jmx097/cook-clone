import { LLMClient } from '../../llm/types';
import { OfferInput, OfferProvider, OfferResult, SectionKey, OfferContentJson } from './types';
import { OfferContentSchema, OfferPositioningSchema, OfferTierSchema, OfferUpsellSchema, OfferGuaranteeSchema, OfferRationaleSchema } from './schemas';
import { z } from 'zod';

export class LLMOfferProvider implements OfferProvider {
  private client: LLMClient;

  constructor(client: LLMClient) {
    this.client = client;
  }

  async generateOffer(input: OfferInput): Promise<OfferResult> {
    const prompt = `
      Create a compelling high-ticket offer for the following project:
      
      Project: ${input.idea}
      Market: ${input.targetMarket}
      Revenue Goal: ${input.revenueGoal}
      
      Research Insights:
      ${JSON.stringify(input.researchContent?.executiveSummary || [])}
      
      Generate a complete offer structure including positioning, tiers, upsells, guarantee, and rationale.
      Ensure prices align with the revenue goal of ${input.revenueGoal}.
    `;

    const systemPrompt = "You are an expert funnel strategist and copywriter. Create structured offers that act as a 'Grand Slam Offer'. Output valid JSON.";

    const content = await this.client.generateJson(
      prompt,
      OfferContentSchema,
      'OfferContent',
      systemPrompt
    );

    return {
      content,
      meta: {
        positioning: { generatedAt: new Date().toISOString(), provider: 'llm' },
        tiers: { generatedAt: new Date().toISOString(), provider: 'llm' },
        upsells: { generatedAt: new Date().toISOString(), provider: 'llm' },
        guarantee: { generatedAt: new Date().toISOString(), provider: 'llm' },
        rationale: { generatedAt: new Date().toISOString(), provider: 'llm' },
      }
    };
  }

  async regenerateSections(
    input: OfferInput,
    sections: SectionKey[],
    existingContent: OfferContentJson
  ): Promise<Partial<OfferContentJson>> {
    const prompt = `
      Regenerate SPECIFIC SECTIONS of this offer based on the project context.
      
      Project: ${input.idea}
      Market: ${input.targetMarket}
      
      Current Offer Summary: ${existingContent.positioning.oneLiner}
      
      Please regenerate strictly the following sections: ${sections.join(', ')}.
      Keep other sections consistent with expectations.
    `;

    // Construct a partial schema for just the requested sections
    // This is tricky with Zod. We might need to ask for a wrapper object containing just those keys.
    const shape: Record<string, z.ZodTypeAny> = {};
    if (sections.includes('positioning')) shape.positioning = OfferPositioningSchema;
    if (sections.includes('tiers')) shape.tiers = z.array(OfferTierSchema);
    if (sections.includes('upsells')) shape.upsells = z.array(OfferUpsellSchema);
    if (sections.includes('guarantee')) shape.guarantee = OfferGuaranteeSchema;
    if (sections.includes('rationale')) shape.rationale = OfferRationaleSchema;

    const PartialSchema = z.object(shape);

    const result = await this.client.generateJson(
      prompt,
      PartialSchema,
      'PartialOfferContent',
      'You are an expert funnel strategist. Regenerate only the requested sections.'
    );

    return result as Partial<OfferContentJson>;
  }
}
