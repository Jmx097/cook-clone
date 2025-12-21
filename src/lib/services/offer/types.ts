import type { ResearchReportContent } from '../research/types';

// ============================================
// INPUT TYPES
// ============================================

export interface OfferInput {
  projectId: string;
  idea: string;
  targetMarket: string;
  revenueGoal: string;
  brandVoiceBrief: string;
  researchContent?: ResearchReportContent;
}

// ============================================
// CONTENT JSON TYPES
// ============================================

export interface OfferPositioning {
  oneLiner: string;
  whoItsFor: string;
  whyNow: string;
  uniqueMechanism?: string;
}

export interface OfferTier {
  name: 'Starter' | 'Pro' | 'Premium';
  price: number;
  currency: string;
  billing: 'one-time' | 'monthly' | 'annual';
  targetCustomer: string;
  deliverables: string[];
  timeline: string;
  primaryOutcome: string;
  proofPlaceholders: string[];
}

export interface OfferUpsell {
  name: string;
  price: number;
  currency: string;
  whyItFits: string;
  whenToOffer: 'checkout' | 'post-purchase' | 'renewal';
}

export interface OfferGuarantee {
  type: string;
  terms: string;
  exclusions?: string[];
  complianceNotes: string;
}

export interface OfferRationale {
  painPointMapping: Array<{
    painPoint: string;
    tier: string;
    deliverable: string;
  }>;
  objectionsAndResponses: Array<{
    objection: string;
    response: string;
  }>;
}

export interface OfferContentJson {
  positioning: OfferPositioning;
  tiers: OfferTier[];
  upsells: OfferUpsell[];
  guarantee: OfferGuarantee;
  rationale: OfferRationale;
}

// ============================================
// META JSON TYPES (Provenance Tracking)
// ============================================

export interface FieldProvenance {
  generatedAt: string;
  editedAt?: string;
  editedByUser?: boolean;
  promptHash?: string;
  provider?: string;
}

export interface OfferMetaJson {
  positioning?: FieldProvenance;
  tiers?: FieldProvenance;
  upsells?: FieldProvenance;
  guarantee?: FieldProvenance;
  rationale?: FieldProvenance;
}

// ============================================
// RESULT TYPES
// ============================================

export interface OfferResult {
  content: OfferContentJson;
  meta: OfferMetaJson;
}

export type SectionKey = 'positioning' | 'tiers' | 'upsells' | 'guarantee' | 'rationale';

// ============================================
// VALIDATION TYPES
// ============================================

export interface OfferValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ============================================
// PROVIDER INTERFACE
// ============================================

export interface OfferProvider {
  generateOffer(input: OfferInput): Promise<OfferResult>;
  regenerateSections(
    input: OfferInput,
    sections: SectionKey[],
    existingContent: OfferContentJson
  ): Promise<Partial<OfferContentJson>>;
}
