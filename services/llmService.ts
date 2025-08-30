import type { Settings } from '../types';

interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

export const llmService = {
  refinePrompt: async (prompt: string, settings: Settings, addLog: (level: 'INFO' | 'ERROR', message: string) => void): Promise<string> => {
    const { llmProviderUrl, llmModelName } = settings;

    if (!llmProviderUrl || !llmModelName) {
      const errorMsg = 'LLM provider URL or model name is not configured.';
      addLog('ERROR', errorMsg);
      throw new Error(errorMsg);
    }

    const metaPrompt = `You are a world-class prompt engineering assistant. Your task is to refine the following user-provided prompt to make it more effective, clear, and comprehensive for a large language model. Do not answer the prompt, but improve it. Return only the improved prompt text.

Original Prompt:
---
${prompt}
---
Refined Prompt:`;

    try {
      addLog('INFO', `Sending refine request to ${llmProviderUrl} with model ${llmModelName}.`);
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
        const errorMsg = `LLM provider responded with status ${response.status}: ${errorText}`;
        addLog('ERROR', errorMsg);
        throw new Error(errorMsg);
      }

      const data = (await response.json()) as OllamaResponse;
      addLog('INFO', 'Successfully received refined prompt from LLM provider.');
      return data.response.trim();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      const connectionError = `Failed to connect to LLM provider at ${llmProviderUrl}. Please check your settings and ensure the provider is running. Details: ${errorMessage}`;
      
      console.error('Failed to connect to LLM provider:', error);
      addLog('ERROR', connectionError);
      
      if (error instanceof Error) {
        throw new Error(connectionError);
      }
      throw new Error('An unknown error occurred while contacting the LLM provider.');
    }
  },
};
