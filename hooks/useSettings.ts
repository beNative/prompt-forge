




// FIX: Correcting module imports. These will work once `types.ts` and `storageService.ts` are created.
import { useState, useEffect, useCallback } from 'react';
import type { Settings } from '../types';
import { LOCAL_STORAGE_KEYS, DEFAULT_SETTINGS } from '../constants';
import { storageService } from '../services/storageService';
import { useLogger } from './useLogger';
import { llmDiscoveryService } from '../services/llmDiscoveryService';

// FIX: This check is correct and relies on the preload script. The TS error will be fixed by declaring `electronAPI` on the `Window` interface in `types.ts`.
const isElectron = !!window.electronAPI;

export const useSettings = () => {
  const { addLog } = useLogger();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadAndEnhanceSettings = async () => {
        let loadedSettings = await storageService.load(LOCAL_STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
        
        // Migration for older settings missing the apiType
        if (!loadedSettings.apiType) {
          loadedSettings.apiType = loadedSettings.llmProviderUrl ? 'ollama' : 'unknown';
        }
        // Migration for iconSet
        if (!loadedSettings.iconSet) {
          loadedSettings.iconSet = 'heroicons';
        }
        // Migration for llmProviderName
        if (loadedSettings.llmProviderName === undefined) {
          loadedSettings.llmProviderName = '';
        }
        // Migration for autoSaveLogs
        if (loadedSettings.autoSaveLogs === undefined) {
          loadedSettings.autoSaveLogs = false;
        }
        // Migration for allowPrerelease
        if (loadedSettings.allowPrerelease === undefined) {
          loadedSettings.allowPrerelease = false;
        }
        // Migration for appIcon
        if (loadedSettings.appIcon === undefined) {
          loadedSettings.appIcon = 'default';
        }


        // If provider name is missing but URL is present, try to discover it.
        // This handles older settings where only the URL was stored.
        if (loadedSettings.llmProviderUrl && !loadedSettings.llmProviderName) {
            addLog('DEBUG', 'LLM provider name is missing, attempting to discover it.');
            try {
                const services = await llmDiscoveryService.discoverServices();
                const matchingService = services.find(s => s.generateUrl === loadedSettings.llmProviderUrl);
                if (matchingService) {
                    loadedSettings.llmProviderName = matchingService.name;
                    loadedSettings.apiType = matchingService.apiType; // Also ensure apiType is correct
                    addLog('INFO', `Discovered and set provider name to: "${matchingService.name}"`);
                } else {
                    addLog('WARNING', `Could not find a matching running service for the saved URL: ${loadedSettings.llmProviderUrl}`);
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                addLog('ERROR', `Error during settings enhancement discovery: ${message}`);
            }
        }


        setSettings(loadedSettings);
        setLoaded(true);
        addLog('DEBUG', 'Settings loaded from storage.');
    }

    loadAndEnhanceSettings();

  }, [addLog]);

  // Effect to notify main process of prerelease setting changes
  useEffect(() => {
    // FIX: This check is correct and relies on the preload script.
    if (loaded && isElectron && window.electronAPI?.updaterSetAllowPrerelease) {
      addLog('DEBUG', `Notifying main process: allowPrerelease is ${settings.allowPrerelease}`);
      // FIX: This check is correct and relies on the preload script.
      window.electronAPI.updaterSetAllowPrerelease(settings.allowPrerelease);
    }
  }, [settings.allowPrerelease, loaded, addLog]);


  const saveSettings = useCallback(async (newSettings: Settings) => {
    const oldSettings = settings;
    setSettings(newSettings);
    await storageService.save(LOCAL_STORAGE_KEYS.SETTINGS, newSettings);
    addLog('INFO', 'Application settings updated and saved.');

    // Notify main process if app icon has changed
    // FIX: This check is correct and relies on the preload script.
    if (isElectron && window.electronAPI?.setAppIcon && oldSettings.appIcon !== newSettings.appIcon) {
        addLog('DEBUG', `Notifying main process: appIcon changed to ${newSettings.appIcon}`);
        // FIX: This check is correct and relies on the preload script.
        window.electronAPI.setAppIcon(newSettings.appIcon);
    }
  }, [addLog, settings]);

  return { settings, saveSettings, loaded };
};