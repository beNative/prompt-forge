

import React from 'react';
import { useTheme } from '../hooks/useTheme';
import IconButton from './IconButton';
// FIX: Correcting the module import. This will work once `Icons.tsx` is created.
import { SunIcon, MoonIcon } from './Icons';

const ThemeToggleButton: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <IconButton onClick={toggleTheme} tooltip={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} tooltipPosition="bottom">
      {theme === 'light' ? <MoonIcon /> : <SunIcon />}
    </IconButton>
  );
};

export default ThemeToggleButton;