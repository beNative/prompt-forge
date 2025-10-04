import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { LoggerProvider } from './contexts/LoggerContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PromptHistoryProvider } from './contexts/PromptHistoryContext';
import { InstrumentationProvider } from './instrumentation';
import { InstrumentationErrorBoundaryWithHook } from './components/InstrumentationErrorBoundary';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <InstrumentationProvider>
        <InstrumentationErrorBoundaryWithHook>
          <LoggerProvider>
            <ThemeProvider>
              <PromptHistoryProvider>
                <App />
              </PromptHistoryProvider>
            </ThemeProvider>
          </LoggerProvider>
        </InstrumentationErrorBoundaryWithHook>
      </InstrumentationProvider>
    </React.StrictMode>
  );
} else {
    console.error('Fatal: Could not find root element to mount the application.');
}