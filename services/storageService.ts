// For type hints
declare global {
  interface Window {
    electronAPI?: {
      save: (key: string, value: string) => Promise<{ success: boolean; error?: string }>;
      load: (key: string) => Promise<{ success: boolean; data: string | null; error?: string }>;
      saveLog: (filename: string, content: string) => Promise<{ success: boolean; error?: string }>;
      readDoc: (filename: string) => Promise<{ success: boolean; content?: string; error?: string }>;
      appendLog: (content: string) => Promise<{ success: boolean; error?: string }>;
      updaterSetAllowPrerelease?: (allow: boolean) => void;
      getAppVersion?: () => Promise<string>;
      onUpdateDownloaded?: (callback: (version: string) => void) => () => void;
      quitAndInstallUpdate?: () => void;
      settingsExport: (content: string) => Promise<{ success: boolean; error?: string }>;
      settingsImport: () => Promise<{ success: boolean; content?: string; error?: string }>;
      getPlatform?: () => string;
      minimizeWindow?: () => void;
      maximizeWindow?: () => void;
      closeWindow?: () => void;
      onWindowStateChange?: (callback: (state: { isMaximized: boolean }) => void) => () => void;
    };
  }
}

const isElectron = !!window.electronAPI;

export const storageService = {
  save: async <T,>(key: string, value: T): Promise<void> => {
    const serializedValue = JSON.stringify(value);
    if (isElectron) {
      const result = await window.electronAPI!.save(key, serializedValue);
      if (!result.success) {
        console.error(`Electron: Failed to save data for key "${key}":`, result.error);
      }
    } else {
      try {
        localStorage.setItem(key, serializedValue);
      } catch (error) {
        console.error(`Web: Error saving to localStorage for key "${key}":`, error);
      }
    }
  },

  load: async <T,>(key: string, defaultValue: T): Promise<T> => {
    if (isElectron) {
      const result = await window.electronAPI!.load(key);
      if (result.success && result.data !== null) {
        try {
          return JSON.parse(result.data) as T;
        } catch (error) {
          console.error(`Electron: Error parsing loaded data for key "${key}":`, error);
          return defaultValue;
        }
      }
      if (!result.success) {
        console.error(`Electron: Failed to load data for key "${key}":`, result.error);
      }
      return defaultValue;
    } else {
      try {
        const serializedValue = localStorage.getItem(key);
        if (serializedValue === null) {
          return defaultValue;
        }
        return JSON.parse(serializedValue) as T;
      } catch (error) {
        console.error(`Web: Error loading from localStorage for key "${key}":`, error);
        return defaultValue;
      }
    }
  },

  saveLogToFile: async (content: string): Promise<void> => {
    const date = new Date().toISOString().split('T')[0];
    const filename = `promptforge-log-${date}.log`;

    if (isElectron) {
      const result = await window.electronAPI!.saveLog(filename, content);
      if (!result.success) {
        console.error('Electron: Failed to save log file:', result.error);
        alert(`Failed to save log file: ${result.error}`);
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

  appendLogToFile: async (content: string): Promise<void> => {
    if (isElectron) {
      const result = await window.electronAPI!.appendLog(content);
      if (!result.success) {
        console.error('Electron: Failed to append to log file:', result.error);
      }
    }
    // This feature is not supported in the web version, so we can silently ignore it or log a warning.
  },

  exportSettings: async (content: string): Promise<void> => {
    if (isElectron) {
      const result = await window.electronAPI!.settingsExport(content);
      if (!result.success) {
        console.error('Electron: Failed to export settings:', result.error);
        alert(`Failed to export settings: ${result.error}`);
      }
    } else {
      // Fallback for web: download the file
      try {
        const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'promptforge_settings.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Web: Failed to download settings file:', error);
        alert('Failed to download settings file.');
      }
    }
  },

  importSettings: (): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      if (isElectron) {
        window.electronAPI!.settingsImport().then(result => {
          if (result.success && result.content) {
            resolve(result.content);
          } else {
            // Can be null on user cancellation, which is not an error.
            if(result.error && result.error !== 'Import dialog was canceled.') {
                console.error('Electron: Failed to import settings:', result.error);
            }
            resolve(null);
          }
        });
      } else {
        try {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.json,application/json';
          input.onchange = (e: Event) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (readerEvent) => {
                resolve(readerEvent.target?.result as string);
              };
              reader.onerror = (error) => reject(error);
              reader.readAsText(file);
            } else {
              resolve(null); // No file selected
            }
          };
          input.click();
        } catch (error) {
          reject(error);
        }
      }
    });
  },
};
