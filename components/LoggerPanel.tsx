
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useLogger } from '../hooks/useLogger';
import { LogLevel, LogMessage } from '../types';
import { SaveIcon, TrashIcon, ChevronDownIcon } from './Icons';
import { storageService } from '../services/storageService';
import IconButton from './IconButton';

interface LoggerPanelProps {
  isVisible: boolean;
  onToggleVisibility: () => void;
}

const logLevelColors: Record<LogLevel, string> = {
  DEBUG: 'bg-green-500',
  INFO: 'bg-blue-500',
  WARNING: 'bg-yellow-500',
  ERROR: 'bg-red-500',
};

const logLevels: LogLevel[] = ['DEBUG', 'INFO', 'WARNING', 'ERROR'];

const LoggerPanel: React.FC<LoggerPanelProps> = ({ isVisible, onToggleVisibility }) => {
  const { logs, clearLogs } = useLogger();
  const [filter, setFilter] = useState<LogLevel | 'ALL'>('ALL');
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredLogs = useMemo(() => {
    if (filter === 'ALL') return logs;
    return logs.filter(log => log.level === filter);
  }, [logs, filter]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [filteredLogs]);

  const handleSaveLog = async () => {
    const logContent = logs.map(log => `[${log.timestamp}] [${log.level}] ${log.message}`).join('\n');
    try {
      await storageService.saveLogToFile(logContent);
    } catch(e) {
      console.error(e)
    }
  };

  if (!isVisible) return null;

  return (
    <div className="h-64 flex flex-col bg-secondary border-t-2 border-border-color shadow-lg">
      <header className="flex items-center justify-between p-2 border-b border-border-color flex-shrink-0">
        <h3 className="font-semibold text-text-main">Application Logs</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary mr-2">Filter:</span>
          <button onClick={() => setFilter('ALL')} className={`px-2 py-1 text-xs rounded ${filter === 'ALL' ? 'bg-primary text-white' : 'bg-secondary-light hover:bg-border-color'}`}>ALL</button>
          {logLevels.map(level => (
            <button key={level} onClick={() => setFilter(level)} className={`px-2 py-1 text-xs rounded ${filter === level ? 'bg-primary text-white' : 'bg-secondary-light hover:bg-border-color'}`}>{level}</button>
          ))}
          <div className="h-4 w-px bg-border-color mx-1"></div>
          <IconButton onClick={handleSaveLog} tooltip="Save Log" variant="ghost" size="sm">
            <SaveIcon className="w-4 h-4" />
          </IconButton>
          <IconButton onClick={clearLogs} tooltip="Clear Logs" variant="destructive" size="sm">
            <TrashIcon className="w-4 h-4" />
          </IconButton>
          <IconButton onClick={onToggleVisibility} tooltip="Close Panel" variant="ghost" size="sm">
            <ChevronDownIcon className="w-4 h-4" />
          </IconButton>
        </div>
      </header>
      <div ref={scrollRef} className="flex-1 p-2 overflow-y-auto font-mono text-xs">
        {filteredLogs.map(log => (
          <div key={log.id} className="flex items-center gap-2">
            <span className="text-text-secondary/80">{log.timestamp}</span>
            <span className={`w-2 h-2 rounded-full ${logLevelColors[log.level]}`}></span>
            <span className="flex-1 text-text-secondary">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoggerPanel;