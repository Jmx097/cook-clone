import { ResearchInput, ResearchProvider, ResearchResult } from './types';
import { logGenerationRun } from '../../llm/hardening';

export class MockResearchProvider implements ResearchProvider {
  async generate(input: ResearchInput): Promise<ResearchResult> {
    const start = Date.now();
    // Simulate generation delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Hardcoded mock stats
    const inputTokens = 500;
    const outputTokens = 1500;

    // Log success (fire and forget)
    logGenerationRun('mock', 'mock-research-v1', 'DONE', inputTokens, outputTokens, Date.now() - start);

    // Deterministic mock data based on input
    const isFitness = input.idea.toLowerCase().includes('fitness') || input.idea.toLowerCase().includes('health');
    const isSaaS = input.idea.toLowerCase().includes('saas') || input.idea.toLowerCase().includes('software');

    if (isFitness) {
      return {
        content: {
          executiveSummary: [
            "The personalized fitness market is growing rapidly, driven by AI adoption.",
            "Target audience seeks convenience and personalization over generic plans.",
            "Key opportunity lies in bridging the gap between automated apps and human coaching.",
            "Revenue goal of $50k/month is achievable with ~2,500 subscribers at $20.",
            "Main threat is high churn rate common in consumer fitness apps."
          ],
          icp: {
            demographics: ["Age 25-40", "Urban/Suburban", "Income $60k+", "Smartphone power users"],
            psychographics: ["Health-conscious", "Time-poor", "Data-driven", "Valves self-improvement"],
            painPoints: [
              "Generic apps don't adapt to injuries or schedule changes",
              "Personal trainers are too expensive ($100+/hr)",
              "Lack of accountability in DIY programs",
              "Confusion about nutrition alongside training"
            ]
          },
          marketAnalysis: {
            tam: "$14B Global Fitness App Market",
            sam: "$4.5B Personalized Digital Coaching Segment",
            som: "$10M Serviceable Market (Year 1-3)",
            growthRate: "17.6% CAGR"
          },
          competitors: [
            {
              name: "MyFitnessPal",
              strengths: ["Huge database", "Brand recognition"],
              weaknesses: ["Generic advice", "Poor UX"],
              pricing: "$19.99/mo"
            },
            {
              name: "Fitbod",
              strengths: ["Good algorithm", "Clean UI"],
              weaknesses: ["Lack of nutrition focus", "No human element"],
              pricing: "$12.99/mo"
            },
            {
              name: "Future.co",
              strengths: ["Real human coaches", "Premium accountability"],
              weaknesses: ["Prohibitively expensive ($199/mo)"],
              pricing: "$199/mo"
            }
          ],
          opportunities: [
            "Integrate wearable data for real-time load adjustment",
            "Offer 'hybrid' model with AI daily + human monthly check-in",
            "Focus on niche: 'Post-rehab strength training'"
          ],
          marketingAngles: [
            "Your Personal Trainer, for the price of Netflix",
            "Stop guessing at the gym. let AI build your perfect workout.",
            "The precision of data meets the motivation of a coach."
          ]
        },
        sources: [
          { title: "Global Fitness App Market Report 2024", url: "https://example.com/fitness-market" },
          { title: "Competitor Analysis: Fitbod vs Future", url: "https://example.com/competitor-growth" }
        ]
      };
    }

    // Default mock for other ideas
    return {
      content: {
        executiveSummary: [
          `Market validation for '${input.idea}' shows strong potential in the ${input.targetMarket} segment.`,
          "Competitors are established but suffer from legacy tech debt.",
          "Revenue goal requires capturing <1% of the total addressable market.",
          "Differentiation should focus on specific workflow automation.",
          "Early adoption likely from tech-forward small businesses."
        ],
        icp: {
          demographics: ["SMB Owners", "Decision Makers", "Remote Teams"],
          psychographics: ["Efficiency-focused", "Growth-oriented", "Frustrated with manual tools"],
          painPoints: [
            "Current solutions are too complex/enterprise-focused",
            "Pricing models don't scale with small team usage",
            "Lack of integration with modern stack",
            "Poor customer support for smaller accounts"
          ]
        },
        marketAnalysis: {
          tam: "$50B+ Global Market",
          sam: "$2B Target Segment",
          som: "$5M Initial Traction Target",
          growthRate: "12% CAGR"
        },
        competitors: [
          {
            name: "Industry Giant A",
            strengths: ["Complete feature set", "Enterprise security"],
            weaknesses: ["Slow/bloated", "Expensive", "Bad UX"],
            pricing: "$50/user/mo"
          },
          {
            name: "Startup B",
            strengths: ["Modern UI", "Cheaper"],
            weaknesses: ["Feature gaps", "Unstable"],
            pricing: "$15/user/mo"
          }
        ],
        opportunities: [
          "Focus on superior UX/speed",
          "Build 'done-for-you' onboarding templates",
          "Target switching users with easy migration tools"
        ],
        marketingAngles: [
          "The tool you wish you had 5 years ago",
          "Enterprise power, consumer simplicity",
          "Stop fighting your software."
        ]
      },
      sources: [
        { title: "Market Size Analysis 2024", url: "Validation Query: Market size for " + input.idea },
        { title: "Competitor Pricing Survey", url: "Validation Query: Alternatives to major players" }
      ]
    };
  }
}
