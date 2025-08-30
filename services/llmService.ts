
import type { Settings } from '../types';

interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

export const llmService = {
  refinePrompt: async (prompt: string, settings: Settings): Promise<string> => {
    const { llmProviderUrl, llmModelName } = settings;

    if (!llmProviderUrl || !llmModelName) {
      throw new Error('LLM provider URL or model name is not configured.');
    }

    const metaPrompt = `You are a world-class prompt engineering assistant. Your task is to refine the following user-provided prompt to make it more effective, clear, and comprehensive for a large language model. Do not answer the prompt, but improve it. Return only the improved prompt text.

Original Prompt:
---
${prompt}
---
Refined Prompt:`;

    try {
      const response = await fetch(llmProviderUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: llmModelName,
          prompt: metaPrompt,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`LLM provider responded with status ${response.status}: ${errorText}`);
      }

      const data = (await response.json()) as OllamaResponse;
      return data.response.trim();
    } catch (error) {
      console.error('Failed to connect to LLM provider:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to connect to LLM provider at ${llmProviderUrl}. Please check your settings and ensure the provider is running. Details: ${error.message}`);
      }
      throw new Error('An unknown error occurred while contacting the LLM provider.');
    }
  },
};
