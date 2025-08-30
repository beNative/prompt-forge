
import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { Command } from '../types';

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
      // Reset state when opening
      setSearchTerm('');
      setSelectedIndex(0);
      // Focus input
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    // Reset selection when search term changes
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

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-modal-backdrop backdrop-blur-sm z-60 flex justify-center pt-20" onClick={onClose}>
      <div className="w-full max-w-lg bg-secondary rounded-lg shadow-2xl border border-border-color flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-2 border-b border-border-color">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Type a command..."
            className="w-full bg-secondary text-text-main placeholder-text-secondary focus:outline-none p-2"
          />
        </div>
        <ul className="flex-1 overflow-y-auto max-h-80 p-2">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((command, index) => (
              <li
                key={command.id}
                onClick={() => {
                  command.action();
                  onClose();
                }}
                className={`p-2 rounded-md cursor-pointer text-text-secondary ${
                  selectedIndex === index ? 'bg-primary text-white' : 'hover:bg-secondary-light'
                }`}
              >
                {command.name}
              </li>
            ))
          ) : (
            <li className="p-2 text-center text-text-secondary">No matching commands found.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default CommandPalette;