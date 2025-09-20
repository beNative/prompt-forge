import React, { createContext, useContext, useMemo } from 'react';
import type { PromptVersion } from '../types';
import { usePromptVersions } from '../hooks/usePromptVersions';

interface PromptHistoryContextType {
  versions: PromptVersion[];
  addVersion: (promptId: string, content: string, createdAt: string) => void;
  getVersionsForPrompt: (promptId: string) => PromptVersion[];
}

export const PromptHistoryContext = createContext<PromptHistoryContextType | undefined>(undefined);

export const PromptHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { versions, addVersion, getVersionsForPrompt } = usePromptVersions();

  const value = useMemo(() => ({ versions, addVersion, getVersionsForPrompt }), [versions, addVersion, getVersionsForPrompt]);

  return (
    <PromptHistoryContext.Provider value={value}>
      {children}
    </PromptHistoryContext.Provider>
  );
};

export const usePromptHistory = () => {
    const context = useContext(PromptHistoryContext);
    if (context === undefined) {
        throw new Error('usePromptHistory must be used within a PromptHistoryProvider');
    }
    return context;
};
