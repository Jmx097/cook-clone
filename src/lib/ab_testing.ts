import { prisma } from "@/lib/db";
import crypto from 'crypto';

export class ABTestingService {
  
  /**
   * Assigns a variant for a user in a test.
   * - Checks for existing stable assignment if sessionKey provided.
   * - Otherwise uses weighted random selection.
   * - Persists assignment if sessionKey provided.
   */
  static async assignVariant(testId: string, sessionKey?: string | null): Promise<string> {
    const test = await prisma.aBTest.findUnique({
      where: { id: testId },
      include: { assignments: sessionKey ? { where: { assignmentKeyHash: this.hashKey(sessionKey) } } : false }
    });

    if (!test) throw new Error("Test not found");
    if (test.winnerVariantId) return test.winnerVariantId;

    // 1. Check existing assignment (Stability)
    // Note: The `include` above might return an array.
    // If we passed sessionKey, we should check specifically for that key.
    // But `include` with `where` is more complex in types. 
    // Let's simpler: fetch assignment separately if needed or rely on memory if we fetched all? No, fetch specific.
    
    if (sessionKey) {
      const hash = this.hashKey(sessionKey);
      const existing = await prisma.aBTestAssignment.findUnique({
        where: {
          abTestId_assignmentKeyHash: {
            abTestId: test.id,
            assignmentKeyHash: hash
          }
        }
      });
      if (existing) return existing.variantId;
    }

    // 2. Weighted Random Selection
    const weights = test.trafficWeightsJson as Record<string, number>;
    const variants = Object.keys(weights);
    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
    
    let random = Math.random() * totalWeight;
    let selectedId = variants[0];
    
    for (const vid of variants) {
      random -= weights[vid];
      if (random <= 0) {
        selectedId = vid;
        break;
      }
    }

    // 3. Persist Assignment (if sessionKey)
    if (sessionKey) {
      await prisma.aBTestAssignment.create({
        data: {
          abTestId: test.id,
          variantId: selectedId,
          assignmentKeyHash: this.hashKey(sessionKey)
        }
      }).catch(err => {
        // Ignore unique constraint race conditions, just return selected
      });
    }

    return selectedId;
  }

  /**
   * Calculates the Wilson Score Interval Lower Bound for winner selection.
   * Returns stats and whether a winner is found.
   */
  static async checkWinner(testId: string): Promise<{ winnerId: string | null, stats: any }> {
    // 1. Get Aggregated Data
    // We need to fetch stats for this test's duration
    const test = await prisma.aBTest.findUnique({ where: { id: testId } });
    if (!test) throw new Error("Test not found");

    // Fetch views/conversions filtered by test start time
    // Note: This is an approximation. Ideally we filter by test start/end strictly.
    const startTime = test.startedAt || new Date(0);
    
    const views = await prisma.pageViewEvent.groupBy({
      by: ['landingPageVariantId'],
      where: { 
        projectId: test.projectId, 
        createdAt: { gte: startTime } 
      },
      _count: true
    });
    
    const conversions = await prisma.conversionEvent.groupBy({
      by: ['landingPageVariantId'],
      where: { 
        projectId: test.projectId, 
        createdAt: { gte: startTime } 
      },
      _count: true
    });

    // 2. Compute Scores
    const variants = (test.challengerVariantIds as string[]).concat(test.controlVariantId);
    const results: Record<string, { views: number, conversions: number, lowerBound: number }> = {};

    for (const vid of variants) {
      const vCount = views.find(v => v.landingPageVariantId === vid)?._count || 0;
      const cCount = conversions.find(c => c.landingPageVariantId === vid)?._count || 0;
      
      results[vid] = {
        views: vCount,
        conversions: cCount,
        lowerBound: this.wilsonScore(cCount, vCount)
      };
    }

    // 3. Determine Winner
    // Rule: Min 100 views, Min 10 conversions. Winner LB > RunnerUp LB + 0.01
    let winnerId: string | null = null;
    let sorted = Object.entries(results).sort((a, b) => b[1].lowerBound - a[1].lowerBound); // Descending
    
    if (sorted.length >= 2) {
      const [best, runnerUp] = sorted;
      const bestStats = best[1];
      const runnerStats = runnerUp[1];

      if (bestStats.views >= 100 && bestStats.conversions >= 10) {
        if (bestStats.lowerBound > (runnerStats.lowerBound + 0.01)) {
          winnerId = best[0];
        }
      }
    }

    return { winnerId, stats: results };
  }

  static async promoteWinner(testId: string, winnerId: string) {
    // Mark test as finished, set winner
    return prisma.aBTest.update({
      where: { id: testId },
      data: {
        status: "FINISHED",
        winnerVariantId: winnerId,
        endedAt: new Date()
      }
    });
    // Further logic to update Project's "active" variant would happen elsewhere or here
  }

  // --- Helpers ---

  private static hashKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }

  // Lower bound of Wilson score confidence interval for a Bernoulli parameter
  private static wilsonScore(successes: number, total: number, z = 1.96): number {
    if (total === 0) return 0;
    const p = successes / total;
    return (p + z*z/(2*total) - z * Math.sqrt((p*(1-p) + z*z/(4*total))/total)) / (1 + z*z/total);
  }
}
