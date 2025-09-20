import { useState, useEffect, useCallback } from 'react';
import type { PromptVersion } from '../types';
import { LOCAL_STORAGE_KEYS } from '../constants';
import { storageService } from '../services/storageService';
import { useLogger } from './useLogger';

export const usePromptVersions = () => {
  const { addLog } = useLogger();
  const [versions, setVersions] = useState<PromptVersion[]>([]);

  useEffect(() => {
    storageService.load<PromptVersion[]>(LOCAL_STORAGE_KEYS.PROMPT_VERSIONS, []).then(loadedVersions => {
      setVersions(loadedVersions);
      addLog('DEBUG', `${loadedVersions.length} prompt versions loaded from storage.`);
    });
  }, [addLog]);

  const persistVersions = useCallback(async (newVersions: PromptVersion[]) => {
      setVersions(newVersions);
      await storageService.save(LOCAL_STORAGE_KEYS.PROMPT_VERSIONS, newVersions);
      addLog('DEBUG', `${newVersions.length} prompt versions saved to storage.`);
  }, [addLog]);

  const addVersion = useCallback((promptId: string, content: string, createdAt: string) => {
    // Don't save empty versions
    if (!content?.trim()) return;

    const mostRecentVersionForPrompt = versions
        .filter(v => v.promptId === promptId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    if (mostRecentVersionForPrompt && mostRecentVersionForPrompt.content === content) {
        addLog('DEBUG', `Skipping version save for prompt ${promptId} as content is unchanged.`);
        return;
    }

    const newVersion: PromptVersion = {
      id: crypto.randomUUID(),
      promptId,
      content,
      createdAt,
    };

    const newVersions = [newVersion, ...versions];
    persistVersions(newVersions);
    addLog('INFO', `New version created for prompt ID: ${promptId}`);
  }, [versions, persistVersions, addLog]);
  
  const getVersionsForPrompt = useCallback((promptId: string) => {
      return versions
        .filter(v => v.promptId === promptId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [versions]);


  return { versions, addVersion, getVersionsForPrompt };
};
