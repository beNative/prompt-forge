

import React from 'react';
import IconButton from './IconButton';
import { GearIcon, PlusIcon, FileIcon, InfoIcon, FileCodeIcon, CommandIcon, FolderPlusIcon } from './Icons';
import ThemeToggleButton from './ThemeToggleButton';

interface HeaderProps {
  onToggleSettingsView: () => void;
  onToggleInfoView: () => void;
  onToggleLogger: () => void;
  onOpenCommandPalette: () => void;
  isInfoViewActive: boolean;
  isSettingsViewActive: boolean;
}

const Header: React.FC<HeaderProps> = ({ onToggleSettingsView, onToggleInfoView, onToggleLogger, onOpenCommandPalette, isInfoViewActive, isSettingsViewActive }) => {
  return (
    <header className="flex items-center justify-between px-3 h-14 flex-shrink-0 bg-secondary border-b border-border-color z-30">
      <div className="flex items-center gap-3">
        <FileIcon className="w-6 h-6 text-primary"/>
        <h1 className="text-lg font-semibold text-text-main tracking-wide">PromptForge</h1>
      </div>
      <div className="flex items-center gap-1">
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
        <IconButton onClick={onToggleSettingsView} tooltip="Settings" className={isSettingsViewActive ? 'bg-primary/10 text-primary' : ''}>
          <GearIcon />
        </IconButton>
      </div>
    </header>
  );
};

export default Header;