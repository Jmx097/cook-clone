import type { 
  OfferInput, 
  OfferResult, 
  OfferContentJson, 
  OfferMetaJson,
  OfferProvider, 
  SectionKey,
  OfferTier,
  OfferUpsell,
  OfferGuarantee,
  OfferRationale,
  OfferPositioning,
} from './types';

import { logGenerationRun } from '../../llm/hardening';

/**
 * Mock Offer Provider
 * 
 * Generates deterministic, compliance-safe offer content for development and testing.
 * All testimonials/stats are clearly labeled as [PLACEHOLDER].
 */
export class MockOfferProvider implements OfferProvider {
  
  async generateOffer(input: OfferInput): Promise<OfferResult> {
    const start = Date.now();
    
    // Simulate generation delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Log
    logGenerationRun('mock', 'mock-offer-v1', 'DONE', 300, 1200, Date.now() - start);
    
    const content = this.buildOfferContent(input);
    const meta = this.buildMetaJson();
    
    return { content, meta };
  }
  
  async regenerateSections(
    input: OfferInput,
    sections: SectionKey[],
    _existingContent: OfferContentJson
  ): Promise<Partial<OfferContentJson>> {
    // Simulate regeneration delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const result: Partial<OfferContentJson> = {};
    
    for (const section of sections) {
      switch (section) {
        case 'positioning':
          result.positioning = this.buildPositioning(input);
          break;
        case 'tiers':
          result.tiers = this.buildTiers(input);
          break;
        case 'upsells':
          result.upsells = this.buildUpsells(input);
          break;
        case 'guarantee':
          result.guarantee = this.buildGuarantee(input);
          break;
        case 'rationale':
          result.rationale = this.buildRationale(input);
          break;
      }
    }
    
    return result;
  }
  
  // ============================================
  // PRIVATE BUILDERS
  // ============================================
  
  private buildOfferContent(input: OfferInput): OfferContentJson {
    return {
      positioning: this.buildPositioning(input),
      tiers: this.buildTiers(input),
      upsells: this.buildUpsells(input),
      guarantee: this.buildGuarantee(input),
      rationale: this.buildRationale(input),
    };
  }
  
  private buildPositioning(input: OfferInput): OfferPositioning {
    const ideaLower = input.idea.toLowerCase();
    
    // Determine context from idea
    const isFitness = ideaLower.includes('fitness') || ideaLower.includes('health') || ideaLower.includes('workout');
    const isSaaS = ideaLower.includes('saas') || ideaLower.includes('software') || ideaLower.includes('app');
    const isCourse = ideaLower.includes('course') || ideaLower.includes('training') || ideaLower.includes('coaching');
    
    if (isFitness) {
      return {
        oneLiner: 'Transform Your Body With AI-Powered Personalization',
        whoItsFor: 'Busy professionals who want effective, time-efficient workouts without the cost of a personal trainer',
        whyNow: 'AI fitness technology has advanced to the point where personalized coaching is now accessible to everyone',
        uniqueMechanism: 'Our adaptive algorithm adjusts your program based on your recovery, schedule, and progress data',
      };
    }
    
    if (isSaaS) {
      return {
        oneLiner: 'Streamline Your Workflow, Amplify Your Results',
        whoItsFor: `${input.targetMarket} looking to eliminate manual processes and scale efficiently`,
        whyNow: 'Automation tools have matured, and early adopters are gaining competitive advantages',
        uniqueMechanism: 'Intelligent workflow automation that learns from your team\'s patterns',
      };
    }
    
    if (isCourse) {
      return {
        oneLiner: 'Master the Skills That Move Your Career Forward',
        whoItsFor: `${input.targetMarket} ready to invest in their professional development`,
        whyNow: 'The skills gap is widening, and those who upskill now will lead tomorrow',
        uniqueMechanism: 'Structured learning path with hands-on projects and expert feedback',
      };
    }
    
    // Default positioning
    return {
      oneLiner: `Unlock Your Potential With ${input.idea}`,
      whoItsFor: input.targetMarket,
      whyNow: 'Market conditions are optimal for early movers who take action now',
      uniqueMechanism: 'Our proven framework combines strategy with execution support',
    };
  }
  
  private buildTiers(input: OfferInput): OfferTier[] {
    const ideaLower = input.idea.toLowerCase();
    const isFitness = ideaLower.includes('fitness') || ideaLower.includes('health');
    const isSaaS = ideaLower.includes('saas') || ideaLower.includes('software');
    
    // Extract price hint from revenue goal (simple heuristic)
    const revenueNum = parseInt(input.revenueGoal.replace(/[^0-9]/g, '')) || 10000;
    const basePrice = Math.round(revenueNum / 100); // Rough heuristic
    const starterPrice = Math.max(47, Math.min(basePrice, 197));
    const proPrice = starterPrice * 2.5;
    const premiumPrice = proPrice * 2;
    
    if (isFitness) {
      return [
        {
          name: 'Starter',
          price: 29,
          currency: 'USD',
          billing: 'monthly',
          targetCustomer: 'Beginners who want to establish a consistent workout routine',
          deliverables: [
            'Personalized workout plan (updated weekly)',
            'Exercise video library access',
            'Progress tracking dashboard',
            'Community forum access',
            'Weekly motivation emails',
          ],
          timeline: 'Self-paced',
          primaryOutcome: 'Intended to help you build a sustainable fitness habit',
          proofPlaceholders: [
            '[PLACEHOLDER - Add real testimonial with FTC disclosure from verified user]',
            '[PLACEHOLDER - Insert verified progress photo with consent]',
          ],
        },
        {
          name: 'Pro',
          price: 79,
          currency: 'USD',
          billing: 'monthly',
          targetCustomer: 'Committed individuals seeking faster, measurable results',
          deliverables: [
            'Everything in Starter',
            'AI-adaptive workout adjustments',
            'Nutrition planning module',
            'Bi-weekly video form checks',
            'Priority email support (48hr response)',
            'Monthly goal-setting sessions',
            'Supplement guidance',
            'Recovery protocols',
          ],
          timeline: '12-week structured program',
          primaryOutcome: 'Designed to accelerate your progress toward specific fitness goals',
          proofPlaceholders: [
            '[PLACEHOLDER - Add verified before/after with consent and disclosure]',
            '[PLACEHOLDER - Insert client testimonial with material connection disclosure]',
          ],
        },
        {
          name: 'Premium',
          price: 199,
          currency: 'USD',
          billing: 'monthly',
          targetCustomer: 'High achievers who want VIP treatment and fastest possible results',
          deliverables: [
            'Everything in Pro',
            'Weekly 1:1 video coaching calls',
            'Custom meal plans with adjustments',
            'Direct messaging access to coach',
            '24-hour support response',
            'Quarterly body composition analysis',
            'Exclusive masterclass access',
            'Competition prep support (if applicable)',
            'Mindset and motivation coaching',
            'Personalized supplement stack',
          ],
          timeline: 'Ongoing with weekly check-ins',
          primaryOutcome: 'Intended to provide comprehensive transformation support',
          proofPlaceholders: [
            '[PLACEHOLDER - Add premium client case study with verified results and disclosure]',
            '[PLACEHOLDER - Insert VIP testimonial with full FTC-compliant disclosure]',
          ],
        },
      ];
    }
    
    if (isSaaS) {
      return [
        {
          name: 'Starter',
          price: 29,
          currency: 'USD',
          billing: 'monthly',
          targetCustomer: 'Solo entrepreneurs and small teams getting started',
          deliverables: [
            'Core platform access',
            'Up to 3 team members',
            '1,000 actions/month',
            'Email support',
            'Knowledge base access',
            'Basic integrations',
          ],
          timeline: 'Self-service onboarding',
          primaryOutcome: 'Intended to help streamline your basic workflows',
          proofPlaceholders: [
            '[PLACEHOLDER - Add verified user testimonial with disclosure]',
          ],
        },
        {
          name: 'Pro',
          price: 79,
          currency: 'USD',
          billing: 'monthly',
          targetCustomer: 'Growing teams that need advanced features and automation',
          deliverables: [
            'Everything in Starter',
            'Up to 10 team members',
            '10,000 actions/month',
            'Priority email support (24hr response)',
            'Advanced integrations',
            'Custom workflows',
            'Analytics dashboard',
            'API access',
          ],
          timeline: 'Guided onboarding call included',
          primaryOutcome: 'Designed to scale your operations efficiently',
          proofPlaceholders: [
            '[PLACEHOLDER - Add verified business case study with disclosure]',
            '[PLACEHOLDER - Insert efficiency metrics from real customer with consent]',
          ],
        },
        {
          name: 'Premium',
          price: 249,
          currency: 'USD',
          billing: 'monthly',
          targetCustomer: 'Established businesses requiring enterprise-grade features',
          deliverables: [
            'Everything in Pro',
            'Unlimited team members',
            'Unlimited actions',
            'Dedicated account manager',
            '4-hour support response SLA',
            'Custom integrations',
            'White-label options',
            'Advanced security features',
            'Quarterly business reviews',
            'Priority feature requests',
          ],
          timeline: 'White-glove onboarding with dedicated specialist',
          primaryOutcome: 'Intended to provide enterprise-level capabilities and support',
          proofPlaceholders: [
            '[PLACEHOLDER - Add enterprise case study with verified ROI and disclosure]',
            '[PLACEHOLDER - Insert executive testimonial with material connection disclosure]',
          ],
        },
      ];
    }
    
    // Default tiers
    return [
      {
        name: 'Starter',
        price: starterPrice,
        currency: 'USD',
        billing: 'one-time',
        targetCustomer: `${input.targetMarket} just getting started`,
        deliverables: [
          'Core framework and materials',
          'Self-paced video training',
          'Resource library access',
          'Community forum access',
          'Email support',
        ],
        timeline: 'Self-paced',
        primaryOutcome: 'Intended to provide foundational knowledge and resources',
        proofPlaceholders: [
          '[PLACEHOLDER - Add verified customer testimonial with disclosure]',
        ],
      },
      {
        name: 'Pro',
        price: proPrice,
        currency: 'USD',
        billing: 'one-time',
        targetCustomer: `Committed ${input.targetMarket} seeking comprehensive support`,
        deliverables: [
          'Everything in Starter',
          'Advanced training modules',
          'Live Q&A sessions (monthly)',
          'Implementation templates',
          'Priority email support',
          'Peer accountability group',
          'Bonus resource pack',
          'Certificate of completion',
        ],
        timeline: '8-week structured program',
        primaryOutcome: 'Designed to accelerate your implementation and results',
        proofPlaceholders: [
          '[PLACEHOLDER - Add verified case study with disclosure]',
          '[PLACEHOLDER - Insert participant testimonial with FTC disclosure]',
        ],
      },
      {
        name: 'Premium',
        price: premiumPrice,
        currency: 'USD',
        billing: 'one-time',
        targetCustomer: `High-achieving ${input.targetMarket} wanting maximum support`,
        deliverables: [
          'Everything in Pro',
          'Weekly 1:1 coaching calls',
          'Custom strategy development',
          'Direct messaging access',
          'Done-for-you templates',
          'VIP community access',
          'Lifetime updates',
          'Guest expert sessions',
          'Networking opportunities',
          'Priority implementation support',
        ],
        timeline: '12-week intensive with ongoing access',
        primaryOutcome: 'Intended to provide comprehensive, personalized transformation support',
        proofPlaceholders: [
          '[PLACEHOLDER - Add VIP client case study with verified results and disclosure]',
          '[PLACEHOLDER - Insert premium participant testimonial with full disclosure]',
        ],
      },
    ];
  }
  
  private buildUpsells(input: OfferInput): OfferUpsell[] {
    const ideaLower = input.idea.toLowerCase();
    const isFitness = ideaLower.includes('fitness') || ideaLower.includes('health');
    
    if (isFitness) {
      return [
        {
          name: 'Nutrition Quick-Start Guide',
          price: 27,
          currency: 'USD',
          whyItFits: 'Complements your workout plan with simple nutrition fundamentals',
          whenToOffer: 'checkout',
        },
        {
          name: 'Recovery Toolkit',
          price: 47,
          currency: 'USD',
          whyItFits: 'Helps maximize results by optimizing recovery between workouts',
          whenToOffer: 'post-purchase',
        },
        {
          name: 'Annual Plan Upgrade',
          price: 499,
          currency: 'USD',
          whyItFits: 'Lock in your rate and save 40% compared to monthly billing',
          whenToOffer: 'renewal',
        },
      ];
    }
    
    // Default upsells
    return [
      {
        name: 'Quick-Start Implementation Call',
        price: 97,
        currency: 'USD',
        whyItFits: 'Get personalized guidance to implement immediately',
        whenToOffer: 'checkout',
      },
      {
        name: 'Template Library Expansion',
        price: 47,
        currency: 'USD',
        whyItFits: 'Save time with additional ready-to-use templates',
        whenToOffer: 'post-purchase',
      },
      {
        name: 'VIP Upgrade',
        price: 297,
        currency: 'USD',
        whyItFits: 'Add 1:1 coaching to accelerate your results',
        whenToOffer: 'post-purchase',
      },
    ];
  }
  
  private buildGuarantee(input: OfferInput): OfferGuarantee {
    return {
      type: '30-day satisfaction',
      terms: 'If you are not completely satisfied with your purchase within 30 days, contact our support team for a full refund. We want you to feel confident in your investment.',
      exclusions: [
        'Refund requests after 30 days',
        'Abuse of guarantee (multiple purchases and refunds)',
        'Completed personalized consulting sessions are non-refundable',
      ],
      complianceNotes: 'This guarantee does not promise specific income, results, or outcomes. Individual results vary based on effort, market conditions, and other factors. This is a satisfaction guarantee, not a results guarantee.',
    };
  }
  
  private buildRationale(input: OfferInput): OfferRationale {
    // Use pain points from research if available
    const painPoints = input.researchContent?.icp?.painPoints || [
      'Current solutions are too expensive',
      'Lack of personalized guidance',
      'Overwhelmed by options and information',
      'Not enough time to figure it out alone',
    ];
    
    return {
      painPointMapping: [
        {
          painPoint: painPoints[0] || 'Current solutions are too expensive',
          tier: 'Starter',
          deliverable: 'Accessible entry point with core value delivered',
        },
        {
          painPoint: painPoints[1] || 'Lack of personalized guidance',
          tier: 'Pro',
          deliverable: 'Live Q&A sessions and implementation templates',
        },
        {
          painPoint: painPoints[2] || 'Overwhelmed by options',
          tier: 'Pro',
          deliverable: 'Structured program with clear progression path',
        },
        {
          painPoint: painPoints[3] || 'Not enough time',
          tier: 'Premium',
          deliverable: '1:1 coaching calls and done-for-you templates',
        },
      ],
      objectionsAndResponses: [
        {
          objection: 'I don\'t have time for this right now',
          response: 'Our program is designed to fit into busy schedules. Starter is self-paced, and even our Premium tier requires just 1-2 hours per week. Many of our clients work full-time jobs while completing the program.',
        },
        {
          objection: 'How do I know this will work for me?',
          response: 'We offer a 30-day satisfaction guarantee. Try it risk-free and see if it\'s a fit. Our methodology is based on proven principles, but we understand everyone\'s situation is unique.',
        },
        {
          objection: 'It\'s too expensive',
          response: 'We offer multiple tiers to fit different budgets. Starter provides incredible value at an accessible price point. Consider the cost of NOT solving this problem—what is it costing you in time, money, or opportunity?',
        },
        {
          objection: 'I\'ve tried similar things before and they didn\'t work',
          response: 'We understand that frustration. Our approach is different because we focus on implementation, not just information. Plus, our tiered support ensures you get the level of guidance you need.',
        },
        {
          objection: 'Can I achieve the same results on my own?',
          response: 'Possibly, but our program saves you months or years of trial and error. We\'ve compiled the best strategies and provide a clear roadmap so you can focus on execution, not research.',
        },
        {
          objection: 'What if I need more support than my tier provides?',
          response: 'You can upgrade to a higher tier at any time and only pay the difference. We want you to succeed, so we make it easy to get more support when you need it.',
        },
      ],
    };
  }
  
  private buildMetaJson(): OfferMetaJson {
    const now = new Date().toISOString();
    const baseProvenance = {
      generatedAt: now,
      provider: 'mock',
    };
    
    return {
      positioning: { ...baseProvenance },
      tiers: { ...baseProvenance },
      upsells: { ...baseProvenance },
      guarantee: { ...baseProvenance },
      rationale: { ...baseProvenance },
    };
  }
}
