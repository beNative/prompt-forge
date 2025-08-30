import React from 'react';
import type { LLMStatus } from '../types';

interface StatusBarProps {
  status: LLMStatus;
  modelName: string;
  promptCount: number;
  lastSaved?: string;
}

const statusConfig: Record<LLMStatus, { text: string; color: string; tooltip: string }> = {
  checking: {
    text: 'Checking...',
    color: 'bg-yellow-500',
    tooltip: 'Attempting to connect to the local LLM provider.',
  },
  connected: {
    text: 'Connected',
    color: 'bg-green-500',
    tooltip: 'Successfully connected to the local LLM provider.',
  },
  error: {
    text: 'Connection Error',
    color: 'bg-red-500',
    tooltip: 'Failed to connect. Check your settings and ensure the provider is running.',
  },
};

const StatusBar: React.FC<StatusBarProps> = ({ status, modelName, promptCount, lastSaved }) => {
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
    <footer className="flex items-center justify-between px-4 py-1 bg-secondary border-t border-border-color text-xs text-text-secondary flex-shrink-0">
      <div className="flex items-center gap-4">
        <div className="relative group flex items-center gap-2 cursor-default">
          <div className={`w-2.5 h-2.5 rounded-full ${color}`}></div>
          <span>{text}</span>
          <span className="absolute bottom-full mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {tooltip}
          </span>
        </div>
        <div className="h-4 w-px bg-border-color"></div>
        <span>Model: <span className="font-semibold text-text-main">{modelName}</span></span>
      </div>
      <div className="flex items-center gap-4">
        <span>Prompts: <span className="font-semibold text-text-main">{promptCount}</span></span>
        <div className="h-4 w-px bg-border-color"></div>
        <span>Last Saved: <span className="font-semibold text-text-main">{formatTimestamp(lastSaved)}</span></span>
      </div>
      <div className="text-gray-500 opacity-75">
        Designed by Tim Sinaeve
      </div>
    </footer>
  );
};

export default StatusBar;