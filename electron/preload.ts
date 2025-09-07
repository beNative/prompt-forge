
import { contextBridge, ipcRenderer } from 'electron';
import type { AppIcon } from '../types';

contextBridge.exposeInMainWorld('electronAPI', {
    readDoc: (filename: string) => ipcRenderer.invoke('read-doc', filename),
    saveLogToFile: (content: string) => ipcRenderer.invoke('save-log', content),
    
    // Updater
    updaterSetAllowPrerelease: (allow: boolean) => ipcRenderer.send('updater-set-allow-prerelease', allow),
    onUpdaterUpdateAvailable: (callback: (version: string) => void) => {
        const handler = (_event: any, version: string) => callback(version);
        ipcRenderer.on('updater-update-available', handler);
        return () => ipcRenderer.removeListener('updater-update-available', handler);
    },
    onUpdaterUpdateDownloaded: (callback: (version: string) => void) => {
        const handler = (_event: any, version: string) => callback(version);
        ipcRenderer.on('updater-update-downloaded', handler);
        return () => ipcRenderer.removeListener('updater-update-downloaded', handler);
    },
    onUpdaterError: (callback: (error: string) => void) => {
        const handler = (_event: any, error: string) => callback(error);
        ipcRenderer.on('updater-error', handler);
        return () => ipcRenderer.removeListener('updater-error', handler);
    },
    onUpdaterChecking: (callback: () => void) => {
        const handler = () => callback();
        ipcRenderer.on('updater-checking', handler);
        return () => ipcRenderer.removeListener('updater-checking', handler);
    },
    updaterInstallUpdate: () => ipcRenderer.send('updater-install-update'),
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    
    // Other
    setAppIcon: (iconName: AppIcon) => ipcRenderer.send('set-app-icon', iconName),
    openExternalLink: (url: string) => ipcRenderer.send('open-external-link', url),
});
