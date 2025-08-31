

import React from 'react';
import type { LLMStatus, DiscoveredLLMModel } from '../types';

interface StatusBarProps {
  status: LLMStatus;
  modelName: string;
  llmProviderName: string;
  promptCount: number;
  lastSaved?: string;
  availableModels: DiscoveredLLMModel[];
  onModelChange: (modelId: string) => void;
}

const statusConfig: Record<LLMStatus, { text: string; color: string; tooltip: string }> = {
  checking: {
    text: 'Checking...',
    color: 'bg-warning',
    tooltip: 'Attempting to connect to the local LLM provider.',
  },
  connected: {
    text: 'Connected',
    color: 'bg-success',
    tooltip: 'Successfully connected to the local LLM provider.',
  },
  error: {
    text: 'Connection Error',
    color: 'bg-error',
    tooltip: 'Failed to connect. Check your settings and ensure the provider is running.',
  },
};

const StatusBar: React.FC<StatusBarProps> = ({ status, modelName, llmProviderName, promptCount, lastSaved, availableModels, onModelChange }) => {
  const { text, color, tooltip } = statusConfig[status];

  const formatTimestamp = (isoString?: string) => {
    if (!isoString) return 'Not saved yet';
    try {
      return new Date(isoString).toLocaleTimeString();
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <footer className="flex items-center justify-between px-4 h-8 bg-secondary border-t border-border-color text-xs text-text-secondary flex-shrink-0 z-30">
      <div className="flex items-center gap-4">
        <div className="relative group flex items-center gap-2 cursor-default">
          <div className={`w-2 h-2 rounded-full ${color}`}></div>
          <span className="font-medium">{text}</span>
          <span className="absolute bottom-full z-50 mb-2 w-max px-2 py-1 text-xs text-tooltip-text bg-tooltip-bg rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {tooltip}
          </span>
        </div>
        <div className="h-4 w-px bg-border-color"></div>
        <span>Provider: <span className="font-semibold text-text-main truncate max-w-[200px]">{llmProviderName || 'N/A'}</span></span>
        <div className="h-4 w-px bg-border-color"></div>
        <div className="flex items-center gap-1">
          <label htmlFor="status-bar-model-select" className="shrink-0">Model:</label>
          <select
            id="status-bar-model-select"
            value={modelName}
            onChange={(e) => onModelChange(e.target.value)}
            disabled={availableModels.length === 0}
            className="bg-transparent font-semibold text-text-main rounded-md p-1 -m-1 hover:bg-border-color focus:outline-none focus:ring-1 focus:ring-primary appearance-none pr-5"
            style={{ 
              maxWidth: '200px', 
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 0.2rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.2em 1.2em',
            }}
          >
            {availableModels.length > 0 ? (
              availableModels.map(model => (
                <option key={model.id} value={model.id} className="bg-secondary text-text-main">{model.name}</option>
              ))
            ) : (
              <option value="">{modelName || 'N/A'}</option>
            )}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span>Prompts: <span className="font-semibold text-text-main">{promptCount}</span></span>
        <div className="h-4 w-px bg-border-color"></div>
        <span>Last Saved: <span className="font-semibold text-text-main">{formatTimestamp(lastSaved)}</span></span>
      </div>
    </footer>
  );
};

export default StatusBar;