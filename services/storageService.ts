
// A simple service for abstracting localStorage and Electron-specific storage.
const isElectron = !!window.electronAPI;

export const storageService = {
  save: async <T>(key: string, value: T): Promise<void> => {
    try {
      const stringValue = JSON.stringify(value);
      localStorage.setItem(key, stringValue);
    } catch (error) {
      console.error(`Error saving to localStorage for key "${key}":`, error);
    }
  },

  load: async <T>(key: string, defaultValue: T): Promise<T> => {
    try {
      const stringValue = localStorage.getItem(key);
      if (stringValue === null) {
        return defaultValue;
      }
      return JSON.parse(stringValue) as T;
    } catch (error) {
      console.error(`Error loading from localStorage for key "${key}":`, error);
      return defaultValue;
    }
  },

  saveLogToFile: async (content: string): Promise<void> => {
    if (isElectron && window.electronAPI?.saveLogToFile) {
        // The main process will open a save dialog and save the file.
        const result = await window.electronAPI.saveLogToFile(content);
        if (!result.success && result.error) {
            throw new Error(result.error);
        }
    } else {
        // Web fallback: download the log file
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `promptforge-log-${new Date().toISOString().slice(0, 10)}.log`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
  },
};
