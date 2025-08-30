
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
