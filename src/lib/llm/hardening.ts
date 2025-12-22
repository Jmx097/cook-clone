import { prisma } from '@/lib/db';

export interface HardeningConfig {
  maxDailyBudgetUsd: number; // e.g., 5.0
  maxDailyTokens: number;    // Alternative to USD
}

// Default limits (can serve as fallbacks)
const DEFAULT_HARDENING_CONFIG: HardeningConfig = {
  maxDailyBudgetUsd: 5.0, // $5.00 safety cap
  maxDailyTokens: 1000000,
};

export class BudgetManager {
  /**
   * Checks if the current usage is within the daily budget.
   * Returns true if allowed, false if blocked.
   */
  static async checkDailyBudget(provider: string = 'openai'): Promise<{ allowed: boolean; reason?: string }> {
    // 1. Calculate start of "today" (UTC)
    const now = new Date();
    const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    // 2. Sum up cost/tokens from GenerationRun
    // Note: We use aggregate for efficiency.
    const result = await prisma.generationRun.aggregate({
      _sum: {
        costEstimate: true,
        inputTokens: true,
        outputTokens: true,
      },
      where: {
        provider,
        createdAt: {
          gte: startOfDay,
        },
        status: {
          not: 'BLOCKED', // Don't count blocked runs against budget? Actually maybe we don't care.
        },
      },
    });

    const totalCost = result._sum.costEstimate || 0;
    // totalTokens can be calculated if needed: (result._sum.inputTokens || 0) + (result._sum.outputTokens || 0)

    // 3. Compare against limits
    // TODO: Ideally fetch these limits from a user settings table or Env Var.
    // For now, we use defaults + Env Var override.
    const budgetLimit = process.env.DAILY_BUDGET_USD ? parseFloat(process.env.DAILY_BUDGET_USD) : DEFAULT_HARDENING_CONFIG.maxDailyBudgetUsd;
    
    if (totalCost >= budgetLimit) {
      return { allowed: false, reason: `Daily budget estimate ($${totalCost.toFixed(2)}) exceeds limit ($${budgetLimit.toFixed(2)}).` };
    }

    return { allowed: true };
  }

  /**
   * Calculate approximate cost for OpenAI models.
   * This is a rough estimation for safety, not for billing.
   */
  static estimateCost(model: string, inputTokens: number, outputTokens: number): number {
    // Prices per 1M tokens (as of late 2024/2025 placeholder)
    let inputPrice = 2.50; // gpt-4o approx
    let outputPrice = 10.00;

    if (model.includes('gpt-4o-mini') || model.includes('mini')) {
      inputPrice = 0.15;
      outputPrice = 0.60;
    }

    return (inputTokens / 1_000_000) * inputPrice + (outputTokens / 1_000_000) * outputPrice;
  }
}

export class RateLimiter {
  // Ultra-simple in-memory rate limiter for this server instance.
  // In a clustered environment, you'd want Redis. For local-first, memory is fine.
  private static recentRequests: number[] = [];
  private static WINDOW_MS = 60 * 1000; // 1 minute
  private static MAX_RPM = 10; // 10 requests per minute safety cap

  static async check(throwOnLimit: boolean = true): Promise<void> {
    const now = Date.now();
    // Prune old timestamps
    this.recentRequests = this.recentRequests.filter(t => t > now - this.WINDOW_MS);

    if (this.recentRequests.length >= this.MAX_RPM) {
      if (throwOnLimit) {
        throw new Error(`Local Rate Limit Exceeded: Max ${this.MAX_RPM} RPM.`);
      } else {
        // Wait? (Simple implementation: just throw for now to trigger backoff upstream)
        throw new Error(`Local Rate Limit Exceeded: Max ${this.MAX_RPM} RPM.`);
      }
    }

    this.recentRequests.push(now);
  }
}

export async function logGenerationRun(
    provider: string,
    model: string,
    status: string,
    inputTokens: number,
    outputTokens: number,
    latencyMs: number,
    error?: string
) {
    try {
        const { prisma } = await import('@/lib/db');
        const cost = BudgetManager.estimateCost(model, inputTokens, outputTokens);
        
        await prisma.generationRun.create({
            data: {
                provider,
                model,
                status,
                inputTokens,
                outputTokens,
                latencyMs,
                error: error ? String(error).slice(0, 1000) : null,
                costEstimate: cost
            }
        });
    } catch (e) {
        console.error('Failed to log generation run', e);
    }
}
