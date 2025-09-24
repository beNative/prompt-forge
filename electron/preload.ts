import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // --- Storage & Docs ---
  save: (key: string, value: string) => ipcRenderer.invoke('storage:save', key, value),
  load: (key: string) => ipcRenderer.invoke('storage:load', key),
  saveLog: (filename: string, content: string) => ipcRenderer.invoke('storage:saveLog', filename, content),
  readDoc: (filename: string) => ipcRenderer.invoke('docs:read', filename),
  appendLog: (content: string) => ipcRenderer.invoke('storage:appendLog', content),
  settingsExport: (content: string) => ipcRenderer.invoke('settings:export', content),
  settingsImport: () => ipcRenderer.invoke('settings:import'),

  // --- App Info & Updates ---
  getAppVersion: () => ipcRenderer.invoke('app:get-version'),
  getPlatform: () => ipcRenderer.invoke('app:get-platform'),
  updaterSetAllowPrerelease: (allow: boolean) => ipcRenderer.send('updater:set-allow-prerelease', allow),
  onUpdateDownloaded: (callback: (version: string) => void) => {
    const handler = (_: IpcRendererEvent, version: string) => callback(version);
    ipcRenderer.on('update:downloaded', handler);
    return () => ipcRenderer.removeListener('update:downloaded', handler);
  },
  quitAndInstallUpdate: () => ipcRenderer.send('updater:quit-and-install'),
  
  // --- Window Controls ---
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),
  onWindowStateChange: (callback: (state: { isMaximized: boolean }) => void) => {
    const handler = (_: IpcRendererEvent, state: { isMaximized: boolean }) => callback(state);
    ipcRenderer.on('window:state-change', handler);
    return () => ipcRenderer.removeListener('window:state-change', handler);
  },
});