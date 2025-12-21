import { LLMClient } from './types';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export class OllamaClient implements LLMClient {
  private baseUrl: string;
  private model: string;

  constructor(baseUrl: string = 'http://localhost:11434', model: string = 'llama3.2') {
    this.baseUrl = baseUrl;
    this.model = model;
  }

  async generateJson<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    schemaName: string = 'result',
    systemPrompt: string = 'You are a helpful AI assistant.'
  ): Promise<T> {
    const jsonSchema = zodToJsonSchema(schema, { name: schemaName });
    const schemaObj = (jsonSchema as any).definitions ? (jsonSchema as any).definitions[schemaName] || jsonSchema : jsonSchema;

    // Ollama uses 'format' parameter with JSON schema
    const payload = {
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      format: schemaObj,
      stream: false,
    };

    // Retry logic for local models which might be flaky
    let lastError: any;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Ollama API Error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const content = data.message?.content;

        if (!content) {
          throw new Error('Ollama returned empty content.');
        }

        // Parse & Validate
        const parsed = JSON.parse(content);
        return schema.parse(parsed);

      } catch (error) {
        lastError = error;
        console.warn(`Ollama Attempt ${attempt} failed:`, error);
        // Clean up prompt or add instructions on retry?
        // For now, just retry raw
      }
    }

    throw lastError || new Error('Ollama generation failed after retries.');
  }
}
