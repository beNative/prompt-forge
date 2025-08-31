

import type { Settings } from './types';

export const LOCAL_STORAGE_KEYS = {
  PROMPTS: 'promptforge_prompts',
  SETTINGS: 'promptforge_settings',
  SIDEBAR_WIDTH: 'promptforge_sidebar_width',
};

export const DEFAULT_SETTINGS: Settings = {
  llmProviderUrl: '',
  llmModelName: '',
  apiType: 'unknown',
  iconSet: 'heroicons',
};