import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  save: (key: string, value: string) => ipcRenderer.invoke('storage:save', key, value),
  load: (key: string) => ipcRenderer.invoke('storage:load', key),
  saveLog: (filename: string, content: string) => ipcRenderer.invoke('storage:saveLog', filename, content),
  readDoc: (filename: string) => ipcRenderer.invoke('docs:read', filename),
  appendLog: (content: string) => ipcRenderer.invoke('storage:appendLog', content),
  updaterSetAllowPrerelease: (allow: boolean) => ipcRenderer.send('updater:set-allow-prerelease', allow),
  setAppIcon: (iconName: string) => ipcRenderer.send('app:set-icon', iconName),
  getAppVersion: () => ipcRenderer.invoke('app:get-version'),
  onUpdateDownloaded: (callback: (version: string) => void) => {
    const handler = (_: IpcRendererEvent, version: string) => callback(version);
    ipcRenderer.on('update:downloaded', handler);
    return () => ipcRenderer.removeListener('update:downloaded', handler);
  },
  quitAndInstallUpdate: () => ipcRenderer.send('updater:quit-and-install'),
});
