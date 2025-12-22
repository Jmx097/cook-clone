import { LLMClient } from './types';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import OpenAI from 'openai';
import { RateLimiter, BudgetManager } from './hardening';

export class OpenAIClient implements LLMClient {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-4o') {
    this.model = model;
    this.client = new OpenAI({
      apiKey: apiKey, // explicitly passed, though SDK reads env too.
    });
  }

  async generateJson<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    schemaName: string = 'result',
    systemPrompt: string = 'You are a helpful AI assistant.'
  ): Promise<T> {
    const start = Date.now();
    
    // 1. Budget Check
    const budget = await BudgetManager.checkDailyBudget('openai');
    if (!budget.allowed) {
      await this.logRun('BLOCKED_BUDGET', null, null, 0, budget.reason);
      throw new Error(`Budget Exceeded: ${budget.reason}`);
    }

    // 2. Retry Loop for Rate Limits
    let attempts = 0;
    const maxAttempts = 3;
    let lastError: unknown;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        
        // 3. Rate Limit Check (Wait or Throw)
        await RateLimiter.check(false); // We can just wait theoretically, but our simple impl throws. 
        // Actually, let's just proceed if check passes. If it throws, we catch below? 
        // No, RateLimiter.check throws error if limit exceeded.
        // We might want to implement "wait" here if we wanted to be nicer, but throwing "RateLimit" is fine to trigger retry.
        
        // 4. Privacy: store: false
        const jsonSchema = zodToJsonSchema(schema as any, { name: schemaName, target: "jsonSchema7" });
        
        const response = await this.client.chat.completions.create({
            model: this.model,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt },
            ],
            // Hardening: Max Tokens
            max_completion_tokens: 4096, // or max_tokens depending on model support. gpt-4o supports max_completion_tokens
            // Hardening: Privacy
            store: false,
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: schemaName,
                    strict: true,
                    schema: jsonSchema as any
                }
            }
        });

        const content = response.choices[0].message.content;
        if (!content) {
            throw new Error("OpenAI returned null content");
        }

        // Metrics from Usage
        const inputTokens = response.usage?.prompt_tokens || 0;
        const outputTokens = response.usage?.completion_tokens || 0;
        const latency = Date.now() - start;

        // 5. Success Logging
        await this.logRun('DONE', inputTokens, outputTokens, latency);

        // Parse and Validate
        const parsed = JSON.parse(content);
        return schema.parse(parsed);

      } catch (error: unknown) {
        lastError = error;
        // Check if retryable (429, 5xx)
        // RateLimiter error is also retryable (wait for next slot)
        const errMsg = error instanceof Error ? error.message : '';
        const errStatus = (error as { status?: number })?.status;
        const isRateLimit = errMsg.includes('Rate Limit') || errStatus === 429;
        const isServerErr = errStatus !== undefined && errStatus >= 500;
        
        if (isRateLimit || isServerErr) {
           if (attempts < maxAttempts) {
             const backoff = Math.pow(2, attempts) * 1000 + (Math.random() * 500); // 1s, 2s, 4s + jitter
             console.warn(`Transient error (${errMsg}). Retrying in ${backoff}ms...`);
             await new Promise(r => setTimeout(r, backoff));
             continue;
           }
        }
        
        // If not retryable or max attempts reached:
        break;
      }
    }

    // If we're here, we failed
    const latency = Date.now() - start;
    const lastErrMsg = lastError instanceof Error ? lastError.message : String(lastError);
    await this.logRun('FAILED', 0, 0, latency, lastErrMsg);
    throw new Error(`OpenAI Error after ${attempts} attempts: ${lastErrMsg}`);
  }

  // Helper to log to DB (fire and forget generally, or await if strict)
  private async logRun(status: string, inputTokens: number | null, outputTokens: number | null, latencyMs: number, error?: string) {
    // We import prisma dynamically or use the one from lib (but wait, OpenAIClient is in lib/llm, prisma in lib/prisma).
    // Circular dependency risk? No, lib/llm depends on lib/prisma is fine.
    try {
        const { prisma } = await import('@/lib/db');
        const { BudgetManager } = await import('./hardening'); // Calculate cost

        let cost = 0;
        if (inputTokens && outputTokens) {
            cost = BudgetManager.estimateCost(this.model, inputTokens, outputTokens);
        }

        await prisma.generationRun.create({
            data: {
                provider: 'openai',
                model: this.model,
                status,
                inputTokens: inputTokens || 0,
                outputTokens: outputTokens || 0,
                latencyMs,
                error: error ? String(error).slice(0, 1000) : null,
                costEstimate: cost
            }
        });
    } catch (e) {
        console.error('Failed to log generation run', e);
        // Don't fail the generation just because logging failed? 
        // Strict adherence to DoD says "Every generation attempt writes".
        // But throwing here might hide the actual error. We log to console at minimum.
    }
  }
}
