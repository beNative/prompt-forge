

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
    <header className="flex items-center justify-between px-3 h-14 flex-shrink-0 bg-secondary border-b border-border-color">
      <div className="flex items-center gap-3">
        <FileIcon className="w-6 h-6 text-primary"/>
        <h1 className="text-lg font-semibold text-text-main tracking-wide">PromptForge</h1>
      </div>
      <div className="flex items-center gap-1">
        <IconButton onClick={onNewPrompt} tooltip="New Prompt (Ctrl+N)">
          <PlusIcon />
        </IconButton>
        <IconButton onClick={onOpenCommandPalette} tooltip="Command Palette (Ctrl+Shift+P)">
          <CommandIcon />
        </IconButton>
        <IconButton onClick={onToggleInfoView} tooltip="Info" className={isInfoViewActive ? 'bg-primary/10 text-primary' : ''}>
          <InfoIcon />
        </IconButton>
        <IconButton onClick={onToggleLogger} tooltip="Logs">
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
