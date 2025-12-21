import { z } from 'zod';
import { AssetBundle, Offer, ResearchReport } from '@prisma/client';
import { getLLMClient } from '../lib/llm/provider';
import { logGenerationRun } from '../lib/llm/hardening';

// ============================================
// SCHEMAS
// ============================================

const HeroSectionSchema = z.object({
  headline: z.string(),
  subheadline: z.string(),
  bulletBenefits: z.array(z.string()),
  ctaText: z.string(),
});

const SocialProofSectionSchema = z.object({
  proofPlaceholders: z.array(z.string()),
});

const ProblemSectionSchema = z.object({
  paragraphs: z.array(z.string()),
});

const SolutionSectionSchema = z.object({
  paragraphs: z.array(z.string()),
  featureBullets: z.array(z.string()),
});

const OfferSectionSchema = z.object({
  tierCards: z.array(z.object({
    name: z.string(),
    price: z.string(),
    features: z.array(z.string()),
    cta: z.string(),
    highlight: z.boolean().optional(),
  })),
});

const FaqSectionSchema = z.object({
  items: z.array(z.object({
    q: z.string(),
    a: z.string(),
  })),
});

const LeadFormSectionSchema = z.object({
  headline: z.string(),
  subheadline: z.string(),
  fieldsEnabled: z.object({
    phone: z.boolean(),
    message: z.boolean(),
  }),
});

const FooterSectionSchema = z.object({
  disclaimerText: z.string().optional(),
  links: z.array(z.object({ label: z.string(), url: z.string() })).optional(),
});

export const LandingPageSchema = z.object({
  theme: z.object({
    brandName: z.string(),
    logoUrl: z.string().optional(),
    primaryCTA: z.string(),
    colors: z.object({
      primary: z.string().optional(),
      secondary: z.string().optional(),
    }).optional(),
  }),
  sections: z.object({
    hero: HeroSectionSchema,
    socialProof: SocialProofSectionSchema,
    problem: ProblemSectionSchema,
    solution: SolutionSectionSchema,
    offer: OfferSectionSchema,
    faq: FaqSectionSchema,
    leadForm: LeadFormSectionSchema,
    footer: FooterSectionSchema,
  }),
});

export type LandingPageContent = z.infer<typeof LandingPageSchema>;

// ============================================
// GENERATOR
// ============================================

export async function generateLandingPage(
  projectId: string,
  assetBundle: AssetBundle,
  offer: Offer,
  research?: ResearchReport
): Promise<LandingPageContent> {
  const client = await getLLMClient();
  const startTime = Date.now();

  try {
    if (client) {
      // Use LLM
      const prompt = buildPrompt(assetBundle, offer, research);
      const result = await client.generateJson(
        prompt,
        LandingPageSchema,
        'LandingPageContent',
        'You are an expert copywriter and web designer. Generate a high-converting landing page structure.'
      );
      
      await logGenerationRun({
        projectId,
        provider: 'openai', // or infer from client type? client doesn't expose it easily yet without cast.
        // Assuming we can fix this or just generic 'llm'
        model: 'unknown',
        status: 'DONE',
        inputTokens: prompt.length / 4, // rough est
        outputTokens: JSON.stringify(result).length / 4,
        latencyMs: Date.now() - startTime,
      });

      return result;
    }
  } catch (error) {
    console.error('LLM Generation failed, falling back to mock', error);
    await logGenerationRun({
      projectId,
      provider: 'llm',
      status: 'FAILED',
      error: error instanceof Error ? error.message : String(error),
      latencyMs: Date.now() - startTime,
    });
  }

  // Fallback / Default: Deterministic method
  const mockResult = generateDeterministicPage(assetBundle, offer);
  
  // Log mock run
  await logGenerationRun({
    projectId,
    provider: 'mock',
    status: 'DONE',
    latencyMs: Date.now() - startTime,
  });

  return mockResult;
}

// ============================================
// MOCK / DETERMINISTIC LOGIC
// ============================================

function generateDeterministicPage(assetBundle: AssetBundle, offer: Offer): LandingPageContent {
  const assets = (assetBundle.landingCopy as any) || {};
  const offerContent = (offer.contentJson as any) || {};
  
  // Safe extraction helper
  const getArr = (v: any) => (Array.isArray(v) ? v : []);
  const getStr = (v: any, def: string) => (typeof v === 'string' ? v : def);

  const brandVoice = "Professional, Friendly"; // Could grab from Project if passed

  return {
    theme: {
      brandName: "My Project", // Should pass project too? Or just generic
      primaryCTA: "Get Started Now",
    },
    sections: {
      hero: {
        headline: getStr(assets.headline, "Transform Your Business Today"),
        subheadline: getStr(assets.subheadline, "The ultimate solution for your needs."),
        bulletBenefits: getArr(assets.benefits).length > 0 ? getArr(assets.benefits) : ["Save Time", "Save Money", "Growth"],
        ctaText: getStr(assets.cta, "Get Started"),
      },
      socialProof: {
        proofPlaceholders: ["Trust Badge 1", "Client Testimonial Placeholder"],
      },
      problem: {
        paragraphs: ["Are you struggling with X?", "It prevents you from achieving Y."],
      },
      solution: {
        paragraphs: ["Our solution solves X by doing Z."],
        featureBullets: ["Feature 1", "Feature 2", "Feature 3"],
      },
      offer: {
        tierCards: Array.isArray(offerContent.tiers) ? offerContent.tiers.map((t: any) => ({
          name: t.name || 'Tier',
          price: t.price || '$99',
          features: Array.isArray(t.features) ? t.features : [],
          cta: 'Buy Now',
          highlight: false
        })) : [
          { name: 'Standard', price: '$99', features: ['Core Feature'], cta: 'Buy Now' }
        ],
      },
      faq: {
        items: [
          { q: "Is there a guarantee?", a: getStr(offerContent.guarantee, "Yes, 30 days money back.") },
          { q: "How do I start?", a: "Click the button above." },
        ],
      },
      leadForm: {
        headline: "Have questions?",
        subheadline: "Contact us directly.",
        fieldsEnabled: {
          phone: true,
          message: true,
        },
      },
      footer: {
        disclaimerText: "Copyright 2025. All rights reserved.",
        links: [],
      },
    },
  };
}

function buildPrompt(assetBundle: AssetBundle, offer: Offer, research?: ResearchReport): string {
  const assets = JSON.stringify(assetBundle.landingCopy || {});
  const offerC = JSON.stringify(offer.contentJson || {});
  
  return `
    Based on the following marketing assets and offer, generate a JSON structure for a landing page.
    
    ASSETS:
    ${assets}
    
    OFFER:
    ${offerC}
    
    Ensure the copy is persuasive and fits the structure.
  `;
}
