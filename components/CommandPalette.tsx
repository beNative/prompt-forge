

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
  const listRef = useRef<HTMLUListElement>(null);

  const filteredCommands = useMemo(() => {
    // Sort commands by category first to ensure consistent grouping
    const sorted = [...commands].sort((a, b) => a.category.localeCompare(b.category));
    if (!searchTerm) {
      return sorted;
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return sorted.filter(
      (command) =>
        command.name.toLowerCase().includes(lowercasedTerm) ||
        command.keywords?.toLowerCase().includes(lowercasedTerm)
    );
  }, [commands, searchTerm]);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);
  
  // Scroll the selected item into view
  useEffect(() => {
    if (listRef.current) {
        const selectedElement = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
        if (selectedElement) {
            selectedElement.scrollIntoView({ block: 'nearest' });
        }
    }
  }, [selectedIndex]);

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
  
  const renderCommands = () => {
    const items: React.ReactNode[] = [];
    let lastCategory: string | undefined = undefined;

    filteredCommands.forEach((command, index) => {
      if (command.category !== lastCategory) {
        items.push(
          <li key={`category-${command.category}`} className="text-xs font-semibold text-text-secondary uppercase px-2 pt-3 pb-1 sticky top-0 bg-secondary">
            {command.category}
          </li>
        );
        lastCategory = command.category;
      }
      items.push(
        <li
          key={command.id}
          data-index={index}
          onClick={() => {
            command.action();
            onClose();
          }}
          className={`flex items-center justify-between p-2 mx-2 rounded-md cursor-pointer text-sm ${
            selectedIndex === index ? 'bg-primary text-primary-text' : 'text-text-main hover:bg-background'
          }`}
        >
          <div className="flex items-center gap-3">
            <command.icon className="w-4 h-4 text-text-secondary" />
            <span>{command.name}</span>
          </div>
          {command.shortcut && (
            <div className="flex items-center gap-1">
              {command.shortcut.map(key => (
                <kbd key={key} className="px-1.5 py-0.5 text-xs bg-border-color rounded font-sans">{key}</kbd>
              ))}
            </div>
          )}
        </li>
      );
    });
    return items;
  };


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
        <ul ref={listRef} className="flex-1 overflow-y-auto max-h-[25rem] py-1">
          {filteredCommands.length > 0 ? (
            renderCommands()
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