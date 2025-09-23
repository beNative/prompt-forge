import React from 'react';
import { useTheme } from '../hooks/useTheme';
import IconButton from './IconButton';
import { SunIcon, MoonIcon } from './Icons';

interface ThemeToggleButtonProps {
  size?: 'sm' | 'md';
  tooltipPosition?: 'top' | 'bottom';
}

const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({ size = 'md', tooltipPosition = 'bottom' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <IconButton onClick={toggleTheme} tooltip={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} tooltipPosition={tooltipPosition} size={size}>
      {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
    </IconButton>
  );
};

export default ThemeToggleButton;