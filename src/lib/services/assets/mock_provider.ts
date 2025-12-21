import { AssetInput, AssetProvider, AssetResult } from './types';
import { logGenerationRun } from '../../llm/hardening';

export class MockAssetProvider implements AssetProvider {
  async generateAssets(input: AssetInput): Promise<AssetResult> {
    const start = Date.now();
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Log success
    logGenerationRun('mock', 'mock-assets-v1', 'DONE', 200, 800, Date.now() - start);

    return {
      landingCopy: {
        headline: `Transform Your ${input.idea} Experience Today`,
        subheadline: "The ultimate solution for " + input.targetMarket,
        heroButton: "Get Started Now",
        problemSection: [
          "Struggling to find the right tools?",
          "Wasting time on manual processes?",
          "Not getting the results you deserve?"
        ],
        solutionSection: `Our ${input.idea} platform is designed to solve these exact problems using AI-driven technology.`,
        features: [
          "Feature 1: AI Automation",
          "Feature 2: Real-time Analytics",
          "Feature 3: One-click optimizations"
        ],
        testimonials: [
          "Verified User: 'Changed my life in 3 weeks!'",
          "CEO: 'Best investment we made this year.'"
        ],
        ctaSection: {
          headline: "Ready to take action?",
          button: "Join " + input.idea
        }
      },
      emails: {
        welcomeEmail: {
          subject: "Welcome to the future of " + input.idea,
          body: "Hi there,\n\nThanks for joining. Here is what you can expect..."
        },
        nurtureEmail: {
          subject: "3 Tips to optimize your workflow",
          body: "Did you know that 80% of users miss out on this feature?..."
        },
        salesEmail: {
          subject: "Special Offer: 50% off for 24 hours",
          body: "We rarely do this, but we want you to succeed..."
        }
      },
      ads: {
        facebookAd: {
          primaryText: "Stop struggling with the old way. There is a better solution.",
          headline: "The #1 Tool for " + input.targetMarket,
          description: "Try it risk-free today."
        },
        googleAd: {
          headlines: ["Best " + input.idea + " Solution", "Automate Your Workflow", "Get Results Fast"],
          descriptions: ["Join 10,000+ happy users.", "Starts at just $29/mo."]
        }
      }
    };
  }
}
