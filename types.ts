
import React from 'react';

// For electron API
export interface IElectronAPI {
    readDoc: (filename: string) => Promise<{ success: boolean; content?: string; error?: string; }>;
    saveLogToFile: (content: string) => Promise<{ success: boolean; error?: string; }>;
    updaterSetAllowPrerelease: (allow: boolean) => void;
    setAppIcon: (iconName: AppIcon) => void;
    onUpdaterUpdateAvailable: (callback: (version: string) => void) => () => void;
    onUpdaterUpdateDownloaded: (callback: (version: string) => void) => () => void;
    onUpdaterError: (callback: (error: string) => void) => () => void;
    onUpdaterChecking: (callback: () => void) => () => void;
    updaterInstallUpdate: () => void;
    getAppVersion: () => Promise<string>;
    openExternalLink: (url: string) => void;
}

declare global {
    interface Window {
        electronAPI?: IElectronAPI;
        Prism: any;
        marked: any;
    }
}


export type LogLevel = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';

export interface LogMessage {
  id: number;
  timestamp: string;
  level: LogLevel;
  message: string;
}

export type ItemType = 'prompt' | 'folder';

export interface BaseItem {
  id: string;
  type: ItemType;
  title: string;
  createdAt: string;
  updatedAt: string;
  parentId: string | null;
}

export interface Prompt extends BaseItem {
  type: 'prompt';
  content: string;
}

export interface Folder extends BaseItem {
  type: 'folder';
  content?: never;
}

export type PromptOrFolder = Prompt | Folder;


export type ApiType = 'ollama' | 'openai' | 'unknown';
export type IconSet = 'heroicons' | 'lucide';
export type AppIcon = 'default' | 'sparkles' | 'command' | 'gear' | 'folder';

export interface Settings {
  llmProviderUrl: string;
  llmProviderName: string;
  llmModelName: string;
  apiType: ApiType;
  iconSet: IconSet;
  autoSaveLogs: boolean;
  allowPrerelease: boolean;
  appIcon: AppIcon;
}

export interface DiscoveredLLMService {
    id: string;
    name: string;
    modelsUrl: string;
    generateUrl: string;
    apiType: 'ollama' | 'openai';
}

export interface DiscoveredLLMModel {
    id: string;
    name: string;
}

export type LLMStatus = 'connected' | 'error' | 'checking';

export type UpdateStatus = 'idle' | 'checking' | 'available' | 'downloaded' | 'error';

export interface Command {
    id: string;
    title: string;
    action: () => void;
    section: string;
    icon?: React.ReactNode;
}
