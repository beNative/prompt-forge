import { useState, useEffect, useCallback } from 'react';
import type { Settings } from '../types';
import { LOCAL_STORAGE_KEYS, DEFAULT_SETTINGS } from '../constants';
import { storageService } from '../services/storageService';
import { useLogger } from './useLogger';

export const useSettings = () => {
  const { addLog } = useLogger();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    storageService.load(LOCAL_STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS).then(loadedSettings => {
        setSettings(loadedSettings);
        addLog('DEBUG', 'Settings loaded from storage.');
    });
  }, [addLog]);

  const saveSettings = useCallback(async (newSettings: Settings) => {
    setSettings(newSettings);
    await storageService.save(LOCAL_STORAGE_KEYS.SETTINGS, newSettings);
    addLog('INFO', 'Application settings updated and saved.');
  }, [addLog]);

  return { settings, saveSettings };
};
