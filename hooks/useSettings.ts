
import { useState, useEffect, useCallback } from 'react';
import type { Settings } from '../types';
import { LOCAL_STORAGE_KEYS, DEFAULT_SETTINGS } from '../constants';
import { storageService } from '../services/storageService';

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(() =>
    storageService.load(LOCAL_STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)
  );

  useEffect(() => {
    storageService.save(LOCAL_STORAGE_KEYS.SETTINGS, settings);
  }, [settings]);

  const saveSettings = useCallback((newSettings: Settings) => {
    setSettings(newSettings);
  }, []);

  return { settings, saveSettings };
};
