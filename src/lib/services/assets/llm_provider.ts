import { LLMClient } from '../../llm/types';
import { AssetInput, AssetProvider, AssetResult } from './types';
import { AssetBundleSchema } from './schemas';

export class LLMAssetProvider implements AssetProvider {
  private client: LLMClient;

  constructor(client: LLMClient) {
    this.client = client;
  }

  async generateAssets(input: AssetInput): Promise<AssetResult> {
    const prompt = `
      Act as a world-class marketing copywriter. Generate a complete marketing asset bundle for the following project:

      Project: ${input.idea}
      Market: ${input.targetMarket}
      Revenue Goal: ${input.revenueGoal}
      Brand Brief: ${input.brandVoiceBrief}

      Offer Strategy: 
      One-Liner: ${input.offerContent.positioning.oneLiner}
      Who For: ${input.offerContent.positioning.whoItsFor}
      
      Required Assets:
      1. Landing Page Copy (Headline, problem/solution, features, testimonials placeholder, CTA)
      2. Email Sequence (Welcome, Nurture, Sales)
      3. Ad Copy (Facebook & Google)

      Tone: Persuasive, professional, and aligned with brand brief.
    `;

    const systemPrompt = "You are an expert copywriter. Output strictly valid JSON matching the requested structure.";

    return await this.client.generateJson(
      prompt,
      AssetBundleSchema,
      'AssetBundle',
      systemPrompt
    );
  }
}
