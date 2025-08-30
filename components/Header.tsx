
import React from 'react';
import IconButton from './IconButton';
import { GearIcon, PlusIcon, FileIcon, InfoIcon, FileCodeIcon, CommandIcon } from './Icons';
import ThemeToggleButton from './ThemeToggleButton';

interface HeaderProps {
  onNewPrompt: () => void;
  onOpenSettings: () => void;
  onToggleInfoView: () => void;
  onToggleLogger: () => void;
  onOpenCommandPalette: () => void;
  isInfoViewActive: boolean;
}

const Header: React.FC<HeaderProps> = ({ onNewPrompt, onOpenSettings, onToggleInfoView, onToggleLogger, onOpenCommandPalette, isInfoViewActive }) => {
  return (
    <header className="flex items-center justify-between p-4 border-b border-border-color bg-secondary flex-shrink-0">
      <div className="flex items-center gap-3">
        <FileIcon className="w-7 h-7 text-primary"/>
        <h1 className="text-xl font-bold text-primary">PromptForge</h1>
      </div>
      <div className="flex items-center gap-2">
        <IconButton onClick={onNewPrompt} tooltip="New Prompt">
          <PlusIcon />
        </IconButton>
        <IconButton onClick={onOpenCommandPalette} tooltip="Command Palette (Ctrl+Shift+P)">
          <CommandIcon />
        </IconButton>
        <IconButton onClick={onToggleInfoView} tooltip="Info" className={isInfoViewActive ? 'bg-secondary-light text-primary' : 'text-info'}>
          <InfoIcon />
        </IconButton>
        <IconButton onClick={onToggleLogger} tooltip="Logs" className="text-debug">
          <FileCodeIcon />
        </IconButton>
        <ThemeToggleButton />
        <IconButton onClick={onOpenSettings} tooltip="Settings">
          <GearIcon />
        </IconButton>
      </div>
    </header>
  );
};

export default Header;