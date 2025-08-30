
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
    <header className="flex items-center justify-between p-4 flex-shrink-0 bg-header-gradient text-white shadow-lg">
      <div className="flex items-center gap-3">
        <FileIcon className="w-7 h-7 text-primary"/>
        <h1 className="text-xl font-bold text-white tracking-wider">PromptForge</h1>
      </div>
      <div className="flex items-center gap-2 text-slate-200">
        <IconButton onClick={onNewPrompt} tooltip="New Prompt" className="hover:text-white">
          <PlusIcon />
        </IconButton>
        <IconButton onClick={onOpenCommandPalette} tooltip="Command Palette (Ctrl+Shift+P)" className="hover:text-white">
          <CommandIcon />
        </IconButton>
        <IconButton onClick={onToggleInfoView} tooltip="Info" className={isInfoViewActive ? 'text-white bg-black/30' : 'hover:text-white'}>
          <InfoIcon />
        </IconButton>
        <IconButton onClick={onToggleLogger} tooltip="Logs" className="hover:text-white">
          <FileCodeIcon />
        </IconButton>
        <ThemeToggleButton />
        <IconButton onClick={onOpenSettings} tooltip="Settings" className="hover:text-white">
          <GearIcon />
        </IconButton>
      </div>
    </header>
  );
};

export default Header;
