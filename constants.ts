

import type { Settings } from './types';

export const LOCAL_STORAGE_KEYS = {
  PROMPTS: 'promptforge_prompts',
  SETTINGS: 'promptforge_settings',
  SIDEBAR_WIDTH: 'promptforge_sidebar_width',
  LOGGER_PANEL_HEIGHT: 'promptforge_logger_panel_height',
  EXPANDED_FOLDERS: 'promptforge_expanded_folders',
};

export const DEFAULT_SETTINGS: Settings = {
  llmProviderUrl: '',
  llmModelName: '',
  llmProviderName: '',
  apiType: 'unknown',
  iconSet: 'heroicons',
  autoSaveLogs: false,
};