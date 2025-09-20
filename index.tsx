import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { LoggerProvider } from './contexts/LoggerContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PromptHistoryProvider } from './contexts/PromptHistoryContext';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <LoggerProvider>
        <ThemeProvider>
          <PromptHistoryProvider>
            <App />
          </PromptHistoryProvider>
        </ThemeProvider>
      </LoggerProvider>
    </React.StrictMode>
  );
} else {
    console.error('Fatal: Could not find root element to mount the application.');
}