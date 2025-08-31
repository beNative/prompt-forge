

export interface PromptOrFolder {
  id: string;
  type: 'prompt' | 'folder';
  title: string;
  content?: string;
  createdAt: string;
  updatedAt: string;
  parentId: string | null;
}

export interface Settings {
  llmProviderUrl: string;
  llmModelName: string;
  apiType: 'ollama' | 'openai' | 'unknown';
  iconSet: 'heroicons' | 'lucide';
}

export type LogLevel = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';

export interface LogMessage {
  id: number;
  timestamp: string;
  level: LogLevel;
  message: string;
}

export type LLMStatus = 'checking' | 'connected' | 'error';

export interface Command {
  id:string;
  name: string;
  keywords?: string;
  action: () => void;
}

export interface DiscoveredLLMService {
  id: string; // e.g., 'ollama-11434'
  name: string; // e.g., 'Ollama (localhost:11434)'
  modelsUrl: string; // Full URL to fetch models
  generateUrl: string; // Full URL to generate content
  apiType: 'ollama' | 'openai';
}

export interface DiscoveredLLMModel {
  id: string; // The model name/id from the API
  name: string; // A user-friendly name, often the same as id
}