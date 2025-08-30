export interface Prompt {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  llmProviderUrl: string;
  llmModelName: string;
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
  id: string;
  name: string;
  keywords?: string;
  action: () => void;
}