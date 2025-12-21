import { z } from 'zod';

export const LandingPageSchema = z.object({
  headline: z.string(),
  subheadline: z.string(),
  heroButton: z.string(),
  problemSection: z.array(z.string()),
  solutionSection: z.string(),
  features: z.array(z.string()),
  testimonials: z.array(z.string()),
  ctaSection: z.object({
    headline: z.string(),
    button: z.string(),
  }),
});

export const EmailSequenceSchema = z.object({
  welcomeEmail: z.object({
    subject: z.string(),
    body: z.string(),
  }),
  nurtureEmail: z.object({
    subject: z.string(),
    body: z.string(),
  }),
  salesEmail: z.object({
    subject: z.string(),
    body: z.string(),
  }),
});

export const AdCopySchema = z.object({
  facebookAd: z.object({
    primaryText: z.string(),
    headline: z.string(),
    description: z.string(),
  }),
  googleAd: z.object({
    headlines: z.array(z.string()),
    descriptions: z.array(z.string()),
  }),
});

export const AssetBundleSchema = z.object({
  landingCopy: LandingPageSchema,
  emails: EmailSequenceSchema,
  ads: AdCopySchema,
});
