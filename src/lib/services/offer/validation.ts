import type { OfferContentJson, OfferTier, OfferGuarantee, OfferValidationResult } from './types';

// ============================================
// FORBIDDEN PHRASES (Compliance Guardrails)
// ============================================

const FORBIDDEN_PHRASES = [
  'guaranteed income',
  'guaranteed results',
  'make $',
  'earn $',
  'guaranteed to earn',
  'risk-free',
  '100% guaranteed',
  'no risk',
  'get rich',
  'easy money',
  'passive income guaranteed',
  'you will make',
  'guaranteed profit',
  'guaranteed roi',
  'guaranteed return',
];

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validate that exactly 3 tiers exist with correct names
 */
export function validateTierCount(tiers: OfferTier[]): { valid: boolean; error?: string } {
  if (tiers.length !== 3) {
    return { valid: false, error: `Expected exactly 3 tiers, got ${tiers.length}` };
  }
  
  const names = tiers.map(t => t.name);
  const requiredNames: OfferTier['name'][] = ['Starter', 'Pro', 'Premium'];
  
  for (const name of requiredNames) {
    if (!names.includes(name)) {
      return { valid: false, error: `Missing required tier: ${name}` };
    }
  }
  
  return { valid: true };
}

/**
 * Validate price monotonicity: Starter < Pro < Premium
 */
export function validatePriceMonotonicity(tiers: OfferTier[]): { valid: boolean; error?: string } {
  const starter = tiers.find(t => t.name === 'Starter');
  const pro = tiers.find(t => t.name === 'Pro');
  const premium = tiers.find(t => t.name === 'Premium');
  
  if (!starter || !pro || !premium) {
    return { valid: false, error: 'Missing one or more required tiers' };
  }
  
  if (starter.price >= pro.price) {
    return { valid: false, error: `Starter price ($${starter.price}) must be less than Pro price ($${pro.price})` };
  }
  
  if (pro.price >= premium.price) {
    return { valid: false, error: `Pro price ($${pro.price}) must be less than Premium price ($${premium.price})` };
  }
  
  return { valid: true };
}

/**
 * Validate value monotonicity: deliverables count increases by tier
 */
export function validateValueMonotonicity(tiers: OfferTier[]): { valid: boolean; error?: string } {
  const starter = tiers.find(t => t.name === 'Starter');
  const pro = tiers.find(t => t.name === 'Pro');
  const premium = tiers.find(t => t.name === 'Premium');
  
  if (!starter || !pro || !premium) {
    return { valid: false, error: 'Missing one or more required tiers' };
  }
  
  if (starter.deliverables.length >= pro.deliverables.length) {
    return { 
      valid: false, 
      error: `Starter deliverables (${starter.deliverables.length}) must be less than Pro (${pro.deliverables.length})` 
    };
  }
  
  if (pro.deliverables.length > premium.deliverables.length) {
    return { 
      valid: false, 
      error: `Pro deliverables (${pro.deliverables.length}) must not exceed Premium (${premium.deliverables.length})` 
    };
  }
  
  return { valid: true };
}

/**
 * Validate deliverables count per tier (Starter: 5-7, Pro: 8-10, Premium: 10-12)
 */
export function validateDeliverablesCount(tiers: OfferTier[]): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  
  for (const tier of tiers) {
    const count = tier.deliverables.length;
    
    if (tier.name === 'Starter' && (count < 5 || count > 7)) {
      warnings.push(`Starter tier has ${count} deliverables (recommended: 5-7)`);
    }
    if (tier.name === 'Pro' && (count < 8 || count > 10)) {
      warnings.push(`Pro tier has ${count} deliverables (recommended: 8-10)`);
    }
    if (tier.name === 'Premium' && (count < 10 || count > 12)) {
      warnings.push(`Premium tier has ${count} deliverables (recommended: 10-12)`);
    }
  }
  
  return { valid: true, warnings };
}

/**
 * Validate compliance guardrails (forbidden phrases)
 */
export function validateComplianceGuardrails(content: OfferContentJson): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const text = JSON.stringify(content).toLowerCase();
  
  for (const phrase of FORBIDDEN_PHRASES) {
    if (text.includes(phrase.toLowerCase())) {
      errors.push(`Contains forbidden phrase: "${phrase}"`);
    }
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Validate guarantee realism (no guaranteed income/outcomes)
 */
export function validateGuaranteeRealism(guarantee: OfferGuarantee): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const text = `${guarantee.type} ${guarantee.terms}`.toLowerCase();
  
  const forbiddenGuaranteeTerms = [
    'guaranteed income',
    'guaranteed results',
    'guaranteed success',
    'guaranteed roi',
    'money back if you don\'t make',
  ];
  
  for (const term of forbiddenGuaranteeTerms) {
    if (text.includes(term)) {
      errors.push(`Guarantee contains forbidden term: "${term}"`);
    }
  }
  
  // Check for missing compliance notes
  if (!guarantee.complianceNotes || guarantee.complianceNotes.trim().length === 0) {
    errors.push('Guarantee must include complianceNotes disclaimer');
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Validate proof placeholders (all testimonials/stats must be placeholders)
 */
export function validateProofPlaceholders(tiers: OfferTier[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  for (const tier of tiers) {
    for (const proof of tier.proofPlaceholders) {
      if (!proof.includes('[PLACEHOLDER')) {
        errors.push(`Tier "${tier.name}" has proof without [PLACEHOLDER] tag: "${proof.substring(0, 50)}..."`);
      }
    }
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Validate objections count (at least 5)
 */
export function validateObjectionsCount(content: OfferContentJson): { valid: boolean; error?: string } {
  const count = content.rationale.objectionsAndResponses.length;
  
  if (count < 5) {
    return { valid: false, error: `Expected at least 5 objections/responses, got ${count}` };
  }
  
  return { valid: true };
}

// ============================================
// FULL VALIDATION
// ============================================

/**
 * Run all validations on offer content
 */
export function validateOffer(content: OfferContentJson): OfferValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Tier count validation
  const tierCountResult = validateTierCount(content.tiers);
  if (!tierCountResult.valid && tierCountResult.error) {
    errors.push(tierCountResult.error);
  }
  
  // Price monotonicity validation
  const priceResult = validatePriceMonotonicity(content.tiers);
  if (!priceResult.valid && priceResult.error) {
    errors.push(priceResult.error);
  }
  
  // Value monotonicity validation
  const valueResult = validateValueMonotonicity(content.tiers);
  if (!valueResult.valid && valueResult.error) {
    errors.push(valueResult.error);
  }
  
  // Deliverables count validation (warnings only)
  const deliverablesResult = validateDeliverablesCount(content.tiers);
  warnings.push(...deliverablesResult.warnings);
  
  // Compliance guardrails validation
  const complianceResult = validateComplianceGuardrails(content);
  errors.push(...complianceResult.errors);
  
  // Guarantee realism validation
  const guaranteeResult = validateGuaranteeRealism(content.guarantee);
  errors.push(...guaranteeResult.errors);
  
  // Proof placeholders validation
  const proofResult = validateProofPlaceholders(content.tiers);
  errors.push(...proofResult.errors);
  
  // Objections count validation
  const objectionsResult = validateObjectionsCount(content);
  if (!objectionsResult.valid && objectionsResult.error) {
    errors.push(objectionsResult.error);
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
