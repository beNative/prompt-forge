

import type { Settings } from './types';

export const LOCAL_STORAGE_KEYS = {
  PROMPTS: 'promptforge_prompts',
  SETTINGS: 'promptforge_settings',
};

export const DEFAULT_SETTINGS: Settings = {
  llmProviderUrl: '',
  llmModelName: '',
  apiType: 'unknown',
  iconSet: 'heroicons',
};
