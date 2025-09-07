
import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import type { Command } from '../types';
import { SearchIcon } from './Icons';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, commands }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      // Reset state on open
      setSearchTerm('');
      setActiveIndex(0);
    }
  }, [isOpen]);

  const filteredCommands = useMemo(() => {
    if (!searchTerm) return commands;
    return commands.filter(cmd =>
      cmd.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [commands, searchTerm]);

  useEffect(() => {
    // Reset active index when search term changes
    setActiveIndex(0);
  }, [searchTerm]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const command = filteredCommands[activeIndex];
      if (command) {
        command.action();
        onClose();
      }
    }
  };
  
  const groupedCommands = useMemo(() => {
    return filteredCommands.reduce((acc, command) => {
        (acc[command.section] = acc[command.section] || []).push(command);
        return acc;
    }, {} as Record<string, Command[]>);
  }, [filteredCommands]);

  if (!isOpen) return null;

  const overlayRoot = document.getElementById('overlay-root');
  if (!overlayRoot) return null;
  
  const paletteContent = (
    <div
      className="fixed inset-0 bg-modal-backdrop flex justify-center z-50 pt-20"
      onClick={onClose}
    >
      <div
        className="bg-secondary rounded-lg shadow-xl w-full max-w-2xl mx-4 border border-border-color h-max max-h-[60vh] flex flex-col"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="p-3 border-b border-border-color flex items-center gap-3">
          <SearchIcon className="w-5 h-5 text-text-secondary flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Type a command or search..."
            className="w-full bg-transparent text-text-main focus:outline-none placeholder:text-text-secondary"
          />
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {Object.entries(groupedCommands).map(([section, cmds], sectionIndex) => (
            <div key={section} className="mb-2">
              <h3 className="text-xs font-semibold text-text-secondary uppercase px-2 py-1">{section}</h3>
              <ul>
                {cmds.map(command => {
                  const globalIndex = filteredCommands.findIndex(c => c.id === command.id);
                  const isActive = globalIndex === activeIndex;
                  return (
                    <li
                      key={command.id}
                      onClick={() => { command.action(); onClose(); }}
                      onMouseMove={() => setActiveIndex(globalIndex)}
                      className={`flex items-center gap-3 p-2 rounded-md cursor-pointer text-sm ${
                        isActive ? 'bg-primary text-primary-text' : 'text-text-main hover:bg-border-color'
                      }`}
                    >
                      <span className="w-5 h-5 flex-shrink-0">{command.icon}</span>
                      <span>{command.title}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          {filteredCommands.length === 0 && (
            <div className="text-center text-text-secondary p-8 text-sm">No commands found.</div>
          )}
        </div>
      </div>
    </div>
  );
  
  return ReactDOM.createPortal(paletteContent, overlayRoot);
};

export default CommandPalette;
