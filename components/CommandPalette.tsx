import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import type { Command } from '../types';
import { CommandIcon } from './Icons';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
  targetRef: React.RefObject<HTMLElement>;
  searchTerm: string;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, commands, targetRef, searchTerm }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const listRef = useRef<HTMLUListElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);

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

  // Handle positioning and animations
  useEffect(() => {
    if (isOpen) {
      if (targetRef.current) {
        const rect = targetRef.current.getBoundingClientRect();
        setStyle({
          top: `${rect.bottom + 6}px`,
          left: `${rect.left}px`,
          width: `${rect.width}px`,
        });
      }
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen, targetRef]);

  // Handle closing on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        paletteRef.current && !paletteRef.current.contains(event.target as Node) &&
        targetRef.current && !targetRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, targetRef]);


  // Reset search on open
  useEffect(() => {
    if (isOpen) {
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
      // Allow parent to handle search term typing
      if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete') {
        const target = e.target as HTMLElement;
        if(target.tagName.toLowerCase() !== 'input') {
          return;
        }
      }
        
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
            onClose();
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
        ref={paletteRef}
        style={style}
        className={`fixed z-50 bg-secondary rounded-xl shadow-2xl border border-border-color flex flex-col overflow-hidden max-h-[60vh] transition-all duration-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
        role="dialog"
        aria-modal="true"
      >
        <ul ref={listRef} className="flex-1 overflow-y-auto py-2">
          {filteredCommands.length > 0 ? (
            renderCommands()
          ) : (
            <li className="p-6 text-center text-sm text-text-secondary">No matching commands found.</li>
          )}
        </ul>
      </div>
  );

  return ReactDOM.createPortal(paletteContent, overlayRoot);
};

export default CommandPalette;