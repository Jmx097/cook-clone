import { cookies } from 'next/headers';
import { LLMClient, GenerationConfig } from './types';
import { OpenAIClient } from './openai';


export const SETTINGS_COOKIE = 'llm_settings';

export async function getGenerationConfig(): Promise<GenerationConfig> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SETTINGS_COOKIE);

  let config: GenerationConfig = { provider: 'mock' };

  if (cookie?.value) {
    try {
      // Simple base64 decode for obfuscation
      const decoded = Buffer.from(cookie.value, 'base64').toString('utf-8');
      config = JSON.parse(decoded) as GenerationConfig;
    } catch (e) {
      console.error('Failed to parse generation settings cookie', e);
    }
  }

  // Check environment variable (Server-side only)
  // This takes precedence for the key
  if (config.provider === 'openai' || !config.provider || config.provider === 'mock') {
     const envKey = process.env.OPENAI_API_KEY;
     if (envKey) {
       // If we have a key, and we are on mock (default) or undefined, strictly speaking we could stay on mock unless user chose OpenAI.
       // However, for BYOK, we usually want to enable it if the user configures it.
       // But to avoid "surprise", let's only inject the key if provider is 'openai', OR if the user hasn't explicitly set a provider (cookie missing) but provided a key (maybe dev mode).
       
       // Priority:
       // 1. If provider is 'openai', use env key.
       if (config.provider === 'openai') {
          config.apiKey = envKey;
       }
     }
  }

  return config;
}

/**
 * Registry to get the appropriate LLM Client.
 * Note: Returns undefined if provider is 'mock' (services should handle mock internal logic)
 * OR returns a client if we want a "MockClient"?
 * Actually, services implement MockProvider themselves.
 * This registry is for getting a REAL LLM client when configured.
 */
export async function getLLMClient(): Promise<LLMClient | null> {
  const config = await getGenerationConfig();

  if (config.provider === 'openai' && config.apiKey) {
    return new OpenAIClient(config.apiKey, config.model || 'gpt-4o');
  }



  return null; // Mock or invalid
}
