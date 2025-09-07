
import React from 'react';
import type { LLMStatus } from '../types';
import { useLLMStatus } from '../hooks/useLLMStatus';

interface StatusBarProps {
  providerUrl: string;
  providerName: string;
  modelName: string;
  appVersion: string;
}

const StatusBar: React.FC<StatusBarProps> = ({ providerUrl, providerName, modelName, appVersion }) => {
  const status = useLLMStatus(providerUrl);

  const statusIndicator = {
    connected: {
      dotClass: 'bg-success',
      text: 'Connected',
    },
    checking: {
      dotClass: 'bg-warning animate-pulse',
      text: 'Checking...',
    },
    error: {
      dotClass: 'bg-destructive',
      text: 'Connection Failed',
    },
  };

  const { dotClass, text } = statusIndicator[status] || statusIndicator.error;

  return (
    <footer className="flex items-center justify-between px-4 h-8 flex-shrink-0 bg-secondary border-t border-border-color text-xs text-text-secondary z-20">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2" title={providerUrl || 'No provider selected'}>
          <div className={`w-2 h-2 rounded-full ${dotClass}`}></div>
          <span className="font-semibold">{providerName || 'No Provider'}</span>
          <span>({text})</span>
        </div>
        {modelName && (
          <div className="flex items-center gap-2">
            <span className="h-4 w-px bg-border-color"></span>
            <span>Model: <span className="font-semibold">{modelName}</span></span>
          </div>
        )}
      </div>
      <div className="text-text-secondary/80">
        PromptForge v{appVersion}
      </div>
    </footer>
  );
};

export default StatusBar;
