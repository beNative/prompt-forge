import { useState, useEffect, useCallback } from 'react';
import type { Settings } from '../types';
import { LOCAL_STORAGE_KEYS, DEFAULT_SETTINGS } from '../constants';
import { storageService } from '../services/storageService';
import { useLogger } from './useLogger';

export const useSettings = () => {
  const { addLog } = useLogger();
  const [settings, setSettings] = useState<Settings>(() => {
    const loadedSettings = storageService.load(LOCAL_STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    addLog('DEBUG', 'Settings loaded from storage.');
    return loadedSettings;
  });

  useEffect(() => {
    storageService.save(LOCAL_STORAGE_KEYS.SETTINGS, settings);
    addLog('DEBUG', 'Settings saved to storage.');
  }, [settings, addLog]);

  const saveSettings = useCallback((newSettings: Settings) => {
    setSettings(newSettings);
    addLog('INFO', 'Application settings updated.');
  }, [addLog]);

  return { settings, saveSettings };
};
