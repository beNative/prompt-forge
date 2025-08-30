// In an Electron app, this file would be replaced by IPC (Inter-Process Communication) calls
// to the main process, which would then use Node.js `fs` module to read/write to a JSON file.

// For example, a preload script might expose the following API to the renderer process:
declare global {
  interface Window {
    electronAPI?: {
      save: (key: string, value: string) => Promise<void>;
      load: (key: string) => Promise<string | null>;
      saveLog: (filename: string, content: string) => Promise<void>;
    };
  }
}


export const storageService = {
  save: <T,>(key: string, value: T): void => {
    // In a real Electron app this would be an async call to the main process.
    // To avoid a major refactor of the synchronous hooks, we'll keep it sync for web.
    // if (window.electronAPI) { window.electronAPI.save(key, JSON.stringify(value)); }
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Error saving to localStorage for key "${key}":`, error);
    }
  },

  load: <T,>(key: string, defaultValue: T): T => {
    // In a real Electron app this would be an async call to the main process.
    // if (window.electronAPI) { ... }
    try {
      const serializedValue = localStorage.getItem(key);
      if (serializedValue === null) {
        return defaultValue;
      }
      return JSON.parse(serializedValue) as T;
    } catch (error) {
      console.error(`Error loading from localStorage for key "${key}":`, error);
      return defaultValue;
    }
  },

  saveLogToFile: async (content: string): Promise<void> => {
    const date = new Date().toISOString().split('T')[0];
    const filename = `promptforge-log-${date}.log`;

    if (window.electronAPI?.saveLog) {
      try {
        await window.electronAPI.saveLog(filename, content);
      } catch (error) {
        console.error(`Electron: Failed to save log file:`, error);
        alert('Failed to save log file.');
      }
    } else {
      // Fallback for web: download the file
      try {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Web: Failed to download log file:', error);
        alert('Failed to download log file.');
      }
    }
  },
};
