
import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import type { Command } from '../types';
import { CommandIcon } from './Icons';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, commands }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCommands = useMemo(() => {
    if (!searchTerm) {
      return commands;
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return commands.filter(
      (command) =>
        command.name.toLowerCase().includes(lowercasedTerm) ||
        command.keywords?.toLowerCase().includes(lowercasedTerm)
    );
  }, [commands, searchTerm]);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedIndex(0);
      // Timeout needed to allow the element to render before focusing
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const command = filteredCommands[selectedIndex];
        if (command) {
          command.action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  const overlayRoot = document.getElementById('overlay-root');
  if (!isOpen || !overlayRoot) {
    return null;
  }

  const paletteContent = (
    <div 
        className="fixed inset-0 bg-modal-backdrop z-50 flex justify-center pt-20" 
        onClick={onClose}
        role="dialog"
        aria-modal="true"
    >
      <div 
        className="relative w-full max-w-lg bg-secondary rounded-lg shadow-2xl border border-border-color flex flex-col overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 p-3 border-b border-border-color">
          <CommandIcon className="w-5 h-5 text-text-secondary flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Type a command or search..."
            className="w-full bg-transparent text-text-main placeholder:text-text-secondary focus:outline-none"
          />
        </div>
        <ul className="flex-1 overflow-y-auto max-h-[22rem] p-2">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((command, index) => (
              <li
                key={command.id}
                onClick={() => {
                  command.action();
                  onClose();
                }}
                className={`p-2 rounded-md cursor-pointer text-sm ${
                  selectedIndex === index ? 'bg-primary text-primary-text' : 'text-text-main hover:bg-background'
                }`}
              >
                {command.name}
              </li>
            ))
          ) : (
            <li className="p-4 text-center text-sm text-text-secondary">No matching commands found.</li>
          )}
        </ul>
      </div>
    </div>
  );

  return ReactDOM.createPortal(paletteContent, overlayRoot);
};

export default CommandPalette;
