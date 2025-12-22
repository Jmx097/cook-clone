import { MockAssetProvider } from './mock_provider';
import { AssetBundleSchema } from './schemas';
import { AssetInput } from './types';

describe('MockAssetProvider', () => {
  it('generates valid assets matching the schema', async () => {
    const provider = new MockAssetProvider();
    
    const input: AssetInput = {
      projectId: 'test-project-id',
      idea: 'AI Dog Walker',
      targetMarket: 'Busy Pet Owners',
      revenueGoal: '$10k/mo',
      brandVoiceBrief: 'Friendly and Trustworthy',
      researchContent: {} as unknown as any, // Mock doesn't use deep fields
      offerContent: {
        positioning: { oneLiner: 'Walks done right', whoItsFor: 'Pet owners', whyNow: 'Now' },
      } as unknown as any
    };

    const result = await provider.generateAssets(input);

    // 1. Verify Structure
    expect(result).toBeDefined();
    expect(result.landingCopy).toBeDefined();
    expect(result.emails).toBeDefined();
    expect(result.ads).toBeDefined();

    // 2. Validate against Zod Schema
    const validation = AssetBundleSchema.safeParse(result);
    if (!validation.success) {
        console.error(validation.error);
    }
    expect(validation.success).toBe(true);
    
    // 3. Verify Deterministic Content
    expect(result.landingCopy.headline).toContain('AI Dog Walker');
  });
});
