import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
  const [isVisible, setIsVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filteredCommands = useMemo(() => {
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

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 200); // Match transition duration
  }, [onClose]);

  // Handle animations and focus
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        inputRef.current?.focus();
      }, 10); // Small delay to allow mounting and trigger transition
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Reset search on open
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedIndex(0);
    }
  }, [isOpen]);
  
  // Scroll the selected item into view
  useEffect(() => {
    if (listRef.current && filteredCommands.length > 0) {
        const selectedElement = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
        if (selectedElement) {
            selectedElement.scrollIntoView({ block: 'nearest' });
        }
    }
  }, [selectedIndex, filteredCommands]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (filteredCommands.length === 0 && e.key !== 'Escape') return;

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
          handleClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, handleClose]);
  
  const overlayRoot = document.getElementById('overlay-root');
  if (!isOpen) {
    return null;
  }
  
  const renderCommands = () => {
    const items: React.ReactNode[] = [];
    let lastCategory: string | undefined = undefined;

    filteredCommands.forEach((command, index) => {
      if (command.category !== lastCategory) {
        items.push(
          <li key={`category-${command.category}`} className="text-xs font-semibold text-text-secondary uppercase px-4 pt-4 pb-2 sticky top-0 bg-secondary">
            {command.category}
          </li>
        );
        lastCategory = command.category;
      }
      const isSelected = selectedIndex === index;
      items.push(
        <li
          key={command.id}
          data-index={index}
          onClick={() => {
            command.action();
            handleClose();
          }}
          className={`flex items-center justify-between px-3 py-2.5 mx-2 rounded-md cursor-pointer text-sm ${
            isSelected ? 'bg-primary text-primary-text' : 'text-text-main hover:bg-border-color/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <command.icon className={`w-5 h-5 flex-shrink-0 ${isSelected ? 'text-primary-text/90' : 'text-text-secondary'}`} />
            <span className="truncate">{command.name}</span>
          </div>
          {command.shortcut && (
            <div className="flex items-center gap-1">
              {command.shortcut.map(key => (
                <kbd key={key} className={`px-1.5 py-0.5 text-xs rounded font-sans transition-colors ${isSelected ? 'bg-primary/80 text-primary-text' : 'bg-border-color text-text-secondary'}`}>
                    {key}
                </kbd>
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
        className={`fixed inset-0 bg-modal-backdrop z-50 flex justify-center pt-[15vh] transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
        role="dialog"
        aria-modal="true"
    >
      <div 
        className={`w-full max-w-lg mx-4 bg-secondary rounded-xl shadow-2xl border border-border-color flex flex-col overflow-hidden max-h-[60vh] transition-all duration-200 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 p-4 border-b border-border-color">
          <CommandIcon className="w-5 h-5 text-text-secondary flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedIndex(0);
            }}
            placeholder="Type a command or search..."
            className="w-full bg-transparent text-text-main placeholder:text-text-secondary focus:outline-none text-base"
          />
        </div>
        <ul ref={listRef} className="flex-1 overflow-y-auto py-2">
          {filteredCommands.length > 0 ? (
            renderCommands()
          ) : (
            <li className="p-6 text-center text-sm text-text-secondary">No matching commands found.</li>
          )}
        </ul>
      </div>
    </div>
  );

  return ReactDOM.createPortal(paletteContent, overlayRoot);
};

export default CommandPalette;