import { LLMClient } from './types';
import { z } from 'zod';

export class MockClient implements LLMClient {
  
  async generateJson<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    schemaName: string = 'result',
    systemPrompt: string = ' You are a helpful AI assistant.'
  ): Promise<T> {
    const start = Date.now();
    
    // Simulate latency
    await new Promise(r => setTimeout(r, 800));

    // Mock Logic
    // For now we assume the prompt might contain hints or we just return a valid default.
    // Since we can't easily generate valid complex schemas blindly, we'll try to produce a "minimal valid" object.
    // However, services usually rely on the MockProvider to fetch from a *file* or *template* in the current codebase.
    // IF the services handle mock logic by loading files, then this Client is redundant unless it can do that too.
    // BUT! The services currently do `if (!client) { // manual mock logic }`.
    // We want `client.generateJson`.
    // A generic MockClient is hard because it doesn't know the business logic.
    // compromise: We will use this MockClient to log the "run", but implementation might be sparse.
    // ACTUALLY: The services have specialized mock data. Moving that here is huge scope creep.
    // BETTER PLAN: Leave services as is, BUT make them Call `MockClient.generateJson` which just returns the data they PASS TO IT? 
    // No, that's weird.
    // ALTERNATIVE: Update `provider.ts` to return `null` as before, BUT update the SERVICES to log `GenerationRun` manually for mocks.
    // OR: Update `provider.ts` to return `MockClient`, and have MockClient support a "passthrough" or "canned response" registry?
    
    // LET'S STICK TO DoD: "Update mock provider to log to GenerationRun".
    // If I return a MockClient, I can log. But I need to return valid data.
    // I'll implement a `MockClient` that attempts to generate valid data via Zod-Mock or similar, 
    // OR just simple defaults.
    // Ideally, for the "Hardening" mission, we just want to see the logs.
    
    // I will implement a minimal `generateJson` that logs and returns a mock object based on schema defaults.
    // NOTE: This might break complex flows if they expect specific "business valid" mock data (like a coherent business plan).
    // The existing services likely have `if (mock) return hardcoded_good_data`.
    // I should probably inject that hardcoded data into the client?
    
    // DECISION: I will keep `provider.ts` returning `null` (Mock) and instead update the services to log to the DB when they run in mock mode. 
    // This minimizes regression risk for the "good" mock data while satisfying the "Log usage" requirement.
    // Wait, the DoD says "Update mock provider to log".
    // I'll create a helper `logGenerationRun` in `hardening.ts` and call it from the services.
    
    // Actually, I can wrap the "Mock Logic" in the services with a logging call.
    return {} as T; 
  }
}
