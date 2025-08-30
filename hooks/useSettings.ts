
import { useState, useEffect, useCallback } from 'react';
import type { Settings } from '../types';
import { LOCAL_STORAGE_KEYS, DEFAULT_SETTINGS } from '../constants';
import { storageService } from '../services/storageService';
import { useLogger } from './useLogger';

export const useSettings = () => {
  const { addLog } = useLogger();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    storageService.load(LOCAL_STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS).then(loadedSettings => {
        // Migration for older settings missing the apiType
        if (!loadedSettings.apiType) {
          // If a URL exists, assume it was for the old Ollama default.
          loadedSettings.apiType = loadedSettings.llmProviderUrl ? 'ollama' : 'unknown';
        }
        setSettings(loadedSettings);
        setLoaded(true);
        addLog('DEBUG', 'Settings loaded from storage.');
    });
  }, [addLog]);

  const saveSettings = useCallback(async (newSettings: Settings) => {
    setSettings(newSettings);
    await storageService.save(LOCAL_STORAGE_KEYS.SETTINGS, newSettings);
    addLog('INFO', 'Application settings updated and saved.');
  }, [addLog]);

  return { settings, saveSettings, loaded };
};
