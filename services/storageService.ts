
// In an Electron app, this file would be replaced by IPC (Inter-Process Communication) calls
// to the main process, which would then use Node.js `fs` module to read/write to a JSON file.
// For example, a preload script might expose:
// window.electronAPI.saveData(key, value)
// window.electronAPI.loadData(key)

export const storageService = {
  save: <T,>(key: string, value: T): void => {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Error saving to localStorage for key "${key}":`, error);
    }
  },

  load: <T,>(key: string, defaultValue: T): T => {
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
};
