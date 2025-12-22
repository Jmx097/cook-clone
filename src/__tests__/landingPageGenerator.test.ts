import { generateLandingPage } from '@/services/landingPageGenerator';


// Mock dependencies
jest.mock('@/lib/db', () => ({
  prisma: {
    // we don't use prisma inside generator directly, only in actions.
    // But generator uses types.
  },
}));

jest.mock('@/lib/llm/provider', () => ({
  getLLMClient: jest.fn().mockResolvedValue(null), // Force mock path
}));

jest.mock('@/lib/llm/hardening', () => ({
  logGenerationRun: jest.fn(),
}));

describe('Landing Page Generator', () => {
  it('generates a deterministic page structure from assets', async () => {
    const mockAssetBundle = {
      landingCopy: {
        headline: 'Test Headline',
        subheadline: 'Test Sub',
        benefits: ['B1', 'B2', 'B3'],
        cta: 'Click Me',
      },
    } as any;

    const mockOffer = {
      contentJson: {
        tiers: [{ name: 'Tier 1', price: '$10', features: ['F1'] }],
        guarantee: 'Money back',
      },
    } as any;

    const result = await generateLandingPage('test-project-id', mockAssetBundle, mockOffer);

    expect(result).toBeDefined();
    expect(result.theme.brandName).toBe('My Project');
    expect(result.sections.hero.headline).toBe('Test Headline');
    expect(result.sections.hero.subheadline).toBe('Test Sub');
    expect(result.sections.hero.bulletBenefits).toContain('B1');
    expect(result.sections.offer.tierCards).toHaveLength(1);
    expect(result.sections.offer.tierCards[0].name).toBe('Tier 1');
  });

  it('handles missing asset fields gracefully', async () => {
    const mockAssetBundle = { landingCopy: {} } as unknown as any;
    const mockOffer = { contentJson: {} } as unknown as any;

    const result = await generateLandingPage('test-project-id', mockAssetBundle, mockOffer);

    expect(result.sections.hero.headline).toBe('Transform Your Business Today'); // Default
    expect(result.sections.offer.tierCards).toHaveLength(1); // Default tier
  });
});
