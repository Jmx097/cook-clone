import type { ResearchReportContent } from '../research/types';
import type { OfferContentJson } from '../offer/types';

export interface AssetInput {
  projectId: string;
  idea: string;
  targetMarket: string;
  revenueGoal: string;
  brandVoiceBrief: string;
  researchContent: ResearchReportContent;
  offerContent: OfferContentJson;
}

export interface LandingPageCopy {
  headline: string;
  subheadline: string;
  heroButton: string;
  problemSection: string[];
  solutionSection: string;
  features: string[];
  testimonials: string[]; // Placeholders
  ctaSection: {
    headline: string;
    button: string;
  };
}

export interface EmailSequence {
  welcomeEmail: {
    subject: string;
    body: string;
  };
  nurtureEmail: {
    subject: string;
    body: string;
  };
  salesEmail: {
    subject: string;
    body: string;
  };
}

export interface AdCopy {
  facebookAd: {
    primaryText: string;
    headline: string;
    description: string;
  };
  googleAd: {
    headlines: string[];
    descriptions: string[];
  };
}

export interface AssetResult {
  landingCopy: LandingPageCopy;
  emails: EmailSequence;
  ads: AdCopy;
}

export interface AssetProvider {
  generateAssets(input: AssetInput): Promise<AssetResult>;
}
