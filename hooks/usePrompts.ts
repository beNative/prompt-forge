import { useState, useEffect, useCallback } from 'react';
import type { Prompt } from '../types';
import { LOCAL_STORAGE_KEYS } from '../constants';
import { storageService } from '../services/storageService';
import { useLogger } from './useLogger';

export const usePrompts = () => {
  const { addLog } = useLogger();
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  useEffect(() => {
    storageService.load(LOCAL_STORAGE_KEYS.PROMPTS, []).then(loadedPrompts => {
      setPrompts(loadedPrompts);
      addLog('DEBUG', `${loadedPrompts.length} prompts loaded from storage.`);
    });
  }, [addLog]);
  
  const persistPrompts = useCallback(async (newPrompts: Prompt[]) => {
      setPrompts(newPrompts);
      await storageService.save(LOCAL_STORAGE_KEYS.PROMPTS, newPrompts);
      addLog('DEBUG', `${newPrompts.length} prompts saved to storage.`);
  }, [addLog]);

  const addPrompt = useCallback(() => {
    const newPrompt: Prompt = {
      id: crypto.randomUUID(),
      title: 'Untitled Prompt',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const newPrompts = [newPrompt, ...prompts];
    persistPrompts(newPrompts);
    addLog('INFO', `New prompt created with ID: ${newPrompt.id}`);
    return newPrompt;
  }, [prompts, persistPrompts, addLog]);

  const updatePrompt = useCallback((id: string, updatedPrompt: Partial<Omit<Prompt, 'id'>>) => {
    const newPrompts = prompts.map((p) =>
        p.id === id ? { ...p, ...updatedPrompt, updatedAt: new Date().toISOString() } : p
      );
    persistPrompts(newPrompts);
     addLog('DEBUG', `Prompt updated with ID: ${id}`);
  }, [prompts, persistPrompts, addLog]);

  const deletePrompt = useCallback((id: string) => {
    const newPrompts = prompts.filter((p) => p.id !== id);
    persistPrompts(newPrompts);
    addLog('INFO', `Prompt deleted with ID: ${id}`);
    return newPrompts;
  }, [prompts, persistPrompts, addLog]);
  
  return { prompts, addPrompt, updatePrompt, deletePrompt };
};
