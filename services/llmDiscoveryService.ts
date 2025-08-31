

import type { DiscoveredLLMService, DiscoveredLLMModel } from '../types';

// --- Type definitions for API responses ---

interface OllamaTagsResponse {
  models: {
    name: string;
    modified_at: string;
    size: number;
  }[];
}

interface OpenAIModelsResponse {
  data: {
    id: string;
    object: string;
    created: number;
    owned_by: string;
  }[];
}


// --- Service Definitions ---

const potentialServices: (Omit<DiscoveredLLMService, 'id' | 'apiType'> & { apiType: 'ollama' | 'openai' })[] = [
  {
    name: 'Ollama (localhost:11434)',
    modelsUrl: 'http://localhost:11434/api/tags',
    generateUrl: 'http://localhost:11434/api/generate',
    apiType: 'ollama',
  },
  {
    name: 'LM Studio / OpenAI-compatible (localhost:1234)',
    modelsUrl: 'http://localhost:1234/v1/models',
    generateUrl: 'http://localhost:1234/v1/chat/completions',
    apiType: 'openai',
  }
];


// --- Discovery and Fetching Logic ---

export const llmDiscoveryService = {
  /**
   * Probes a list of potential local LLM services to see which are running.
   */
  discoverServices: async (): Promise<DiscoveredLLMService[]> => {
    const checks = potentialServices.map(async (service) => {
      try {
        // We check the models URL as it's typically a lightweight GET request.
        const response = await fetch(service.modelsUrl, {
          method: 'GET',
          signal: AbortSignal.timeout(1000) // Timeout after 1 second
        });
        if (response.ok) {
          return { ...service, id: `${service.apiType}-${new URL(service.modelsUrl).port}` };
        }
      } catch (error) {
        // This is expected if the service isn't running, so we can ignore the error.
      }
      return null;
    });

    const results = await Promise.all(checks);
    // FIX: Removed incorrect type predicate and explicitly typed `discovered` as DiscoveredLLMService[]
    // to allow for adding the Gemini service later, which resolves multiple downstream type errors.
    const discovered: DiscoveredLLMService[] = results.filter(result => result !== null);

    // Check for Gemini API Key in Electron environment
    if (window.electronAPI) {
        try {
            const result = await window.electronAPI.getApiKey();
            if (result.success && result.apiKey) {
                discovered.push({
                    id: 'gemini-api',
                    name: 'Google Gemini',
                    // These URLs are placeholders as they aren't used for API calls
                    modelsUrl: 'gemini-models',
                    generateUrl: 'gemini-generate',
                    apiType: 'gemini',
                });
            }
        } catch (error) {
            console.error('Failed to check for Gemini API key:', error);
        }
    }

    return discovered;
  },

  /**
   * Fetches the list of available models for a given discovered service.
   */
  fetchModels: async (service: DiscoveredLLMService): Promise<DiscoveredLLMModel[]> => {
    try {
      if (service.apiType === 'gemini') {
        return Promise.resolve([
            { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' }
        ]);
      }
      
      const response = await fetch(service.modelsUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch models from ${service.name}. Status: ${response.status}`);
      }
      const data = await response.json();

      if (service.apiType === 'ollama') {
        const ollamaData = data as OllamaTagsResponse;
        return ollamaData.models.map(model => ({
          id: model.name,
          name: model.name,
        }));
      }
      
      if (service.apiType === 'openai') {
        const openAIData = data as OpenAIModelsResponse;
        return openAIData.data.map(model => ({
          id: model.id,
          name: model.id,
        }));
      }

      return [];
    } catch (error) {
      console.error(`Error fetching models for ${service.name}:`, error);
      throw error;
    }
  },
};
