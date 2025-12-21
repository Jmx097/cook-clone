import { z } from 'zod';

export type ProviderType = 'mock' | 'openai';

export interface GenerationConfig {
  provider: ProviderType;
  model?: string;
  apiKey?: string; // For OpenAI

}

/**
 * Validates that the provider configuration is sufficient.
 */
export function validateConfig(config: GenerationConfig): { valid: boolean; error?: string } {
  if (config.provider === 'openai') {
    if (!config.apiKey || config.apiKey.trim() === '') {
      return { valid: false, error: 'OpenAI API Key is required.' };
    }
  }
  return { valid: true };
}

export type JsonSchema = Record<string, any>;

/**
 * Generic interface for a low-level LLM client (OpenAI).
 * It validates output against a Zod schema.
 */
export interface LLMClient {
  generateJson<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    schemaName?: string,
    systemPrompt?: string
  ): Promise<T>;
}
