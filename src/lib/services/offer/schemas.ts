import { z } from 'zod';

export const OfferPositioningSchema = z.object({
  oneLiner: z.string(),
  whoItsFor: z.string(),
  whyNow: z.string(),
  uniqueMechanism: z.string().optional(),
});

export const OfferTierSchema = z.object({
  name: z.enum(['Starter', 'Pro', 'Premium']),
  price: z.number(),
  currency: z.string(),
  billing: z.enum(['one-time', 'monthly', 'annual']),
  targetCustomer: z.string(),
  deliverables: z.array(z.string()),
  timeline: z.string(),
  primaryOutcome: z.string(),
  proofPlaceholders: z.array(z.string()),
});

export const OfferUpsellSchema = z.object({
  name: z.string(),
  price: z.number(),
  currency: z.string(),
  whyItFits: z.string(),
  whenToOffer: z.enum(['checkout', 'post-purchase', 'renewal']),
});

export const OfferGuaranteeSchema = z.object({
  type: z.string(),
  terms: z.string(),
  exclusions: z.array(z.string()).optional(),
  complianceNotes: z.string(),
});

export const OfferRationaleSchema = z.object({
  painPointMapping: z.array(z.object({
    painPoint: z.string(),
    tier: z.string(),
    deliverable: z.string(),
  })),
  objectionsAndResponses: z.array(z.object({
    objection: z.string(),
    response: z.string(),
  })),
});

export const OfferContentSchema = z.object({
  positioning: OfferPositioningSchema,
  tiers: z.array(OfferTierSchema),
  upsells: z.array(OfferUpsellSchema),
  guarantee: OfferGuaranteeSchema,
  rationale: OfferRationaleSchema,
});

export type OfferContentSchemaType = z.infer<typeof OfferContentSchema>;
