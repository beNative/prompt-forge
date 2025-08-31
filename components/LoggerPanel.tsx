

import React, { useState, useMemo, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useLogger } from '../hooks/useLogger';
import { LogLevel } from '../types';
import { SaveIcon, TrashIcon, ChevronDownIcon } from './Icons';
import { storageService } from '../services/storageService';
import IconButton from './IconButton';

interface LoggerPanelProps {
  isVisible: boolean;
  onToggleVisibility: () => void;
  height: number;
  onResizeStart: (e: React.MouseEvent) => void;
}

const logLevelClasses: Record<LogLevel, { text: string; bg: string; border: string }> = {
  DEBUG: { text: 'text-debug', bg: 'bg-debug/10', border: 'border-debug' },
  INFO: { text: 'text-info', bg: 'bg-info/10', border: 'border-info' },
  WARNING: { text: 'text-warning', bg: 'bg-warning/10', border: 'border-warning' },
  ERROR: { text: 'text-error', bg: 'bg-error/10', border: 'border-error' },
};

const logLevels: LogLevel[] = ['DEBUG', 'INFO', 'WARNING', 'ERROR'];

const activeFilterClasses: Record<LogLevel, string> = {
  DEBUG: 'bg-debug text-white',
  INFO: 'bg-info text-white',
  WARNING: 'bg-warning text-white',
  ERROR: 'bg-error text-white',
};

const LoggerPanel: React.FC<LoggerPanelProps> = ({ isVisible, onToggleVisibility, height, onResizeStart }) => {
  const { logs, clearLogs } = useLogger();
  const [filter, setFilter] = useState<LogLevel | 'ALL'>('ALL');
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredLogs = useMemo(() => {
    if (filter === 'ALL') return logs;
    return logs.filter(log => log.level === filter);
  }, [logs, filter]);

  useEffect(() => {
    if (isVisible && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [filteredLogs, isVisible]);

  const handleSaveLog = async () => {
    const logContent = logs.map(log => `[${log.timestamp}] [${log.level}] ${log.message}`).join('\n');
    try {
      await storageService.saveLogToFile(logContent);
    } catch(e) {
      console.error(e)
    }
  };
  
  const overlayRoot = document.getElementById('overlay-root');
  if (!overlayRoot) return null;

  const panelContent = (
    <div
      style={{ height: `${height}px` }}
      className={`fixed bottom-0 left-0 right-0 z-20 flex flex-col bg-secondary shadow-lg transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
      aria-hidden={!isVisible}
    >
      <div
        onMouseDown={onResizeStart}
        className="w-full h-2 cursor-row-resize flex-shrink-0 group absolute top-0"
      >
        <div className="h-px w-8 bg-border-color rounded-full mx-auto mt-1 group-hover:bg-primary transition-colors"></div>
      </div>
      <header className="flex items-center justify-between p-2 pt-3 border-b border-border-color flex-shrink-0">
        <h3 className="font-semibold text-text-main px-2">Application Logs</h3>
        <div className="flex items-center gap-1">
          <span className="text-xs text-text-secondary mr-2">Filter:</span>
          <button onClick={() => setFilter('ALL')} className={`px-2 py-1 text-xs rounded-md font-semibold transition-colors ${filter === 'ALL' ? 'bg-primary text-primary-text' : 'bg-background hover:bg-border-color text-text-main'}`}>ALL</button>
          {logLevels.map(level => (
            <button key={level} onClick={() => setFilter(level)} className={`px-2 py-1 text-xs rounded-md font-semibold transition-colors ${filter === level ? activeFilterClasses[level] : 'bg-background hover:bg-border-color text-text-main'}`}>{level}</button>
          ))}
          <div className="h-4 w-px bg-border-color mx-2"></div>
          <IconButton onClick={handleSaveLog} tooltip="Save Log" variant="ghost" size="sm">
            <SaveIcon className="w-5 h-5" />
          </IconButton>
          <IconButton onClick={clearLogs} tooltip="Clear Logs" variant="destructive" size="sm">
            <TrashIcon className="w-5 h-5" />
          </IconButton>
          <IconButton onClick={onToggleVisibility} tooltip="Close Panel" variant="ghost" size="sm">
            <ChevronDownIcon className="w-5 h-5" />
          </IconButton>
        </div>
      </header>
      <div ref={scrollRef} className="flex-1 p-3 overflow-y-auto font-mono text-xs space-y-2">
        {filteredLogs.map(log => (
          <div key={log.id} className="flex items-start gap-3">
            <span className={`${logLevelClasses[log.level].text} opacity-90`}>{log.timestamp}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold border ${logLevelClasses[log.level].bg} ${logLevelClasses[log.level].border} ${logLevelClasses[log.level].text}`}>{log.level}</span>
            <span className="flex-1 text-text-secondary whitespace-pre-wrap break-all">{log.message}</span>
          </div>
        ))}
         {filteredLogs.length === 0 && (
            <div className="flex items-center justify-center h-full text-text-secondary">
                No logs to display.
            </div>
         )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(panelContent, overlayRoot);
};

export default LoggerPanel;