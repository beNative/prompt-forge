import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  save: (key: string, value: string) => ipcRenderer.invoke('storage:save', key, value),
  load: (key: string) => ipcRenderer.invoke('storage:load', key),
  saveLog: (filename: string, content: string) => ipcRenderer.invoke('storage:saveLog', filename, content),
  readDoc: (filename: string) => ipcRenderer.invoke('docs:read', filename),
  getApiKey: () => ipcRenderer.invoke('env:get-api-key'),
});