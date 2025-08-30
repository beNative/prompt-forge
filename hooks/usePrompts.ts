import { useState, useEffect, useCallback } from 'react';
import type { Prompt } from '../types';
import { LOCAL_STORAGE_KEYS } from '../constants';
import { storageService } from '../services/storageService';
import { useLogger } from './useLogger';

export const usePrompts = () => {
  const { addLog } = useLogger();
  const [prompts, setPrompts] = useState<Prompt[]>(() => {
    const loadedPrompts = storageService.load(LOCAL_STORAGE_KEYS.PROMPTS, []);
    addLog('DEBUG', `${loadedPrompts.length} prompts loaded from storage.`);
    return loadedPrompts;
  });

  useEffect(() => {
    storageService.save(LOCAL_STORAGE_KEYS.PROMPTS, prompts);
    addLog('DEBUG', `${prompts.length} prompts saved to storage.`);
  }, [prompts, addLog]);

  const addPrompt = useCallback(() => {
    const newPrompt: Prompt = {
      id: crypto.randomUUID(),
      title: 'Untitled Prompt',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPrompts((prev) => [newPrompt, ...prev]);
    addLog('INFO', `New prompt created with ID: ${newPrompt.id}`);
    return newPrompt;
  }, [addLog]);

  const updatePrompt = useCallback((id: string, updatedPrompt: Partial<Omit<Prompt, 'id'>>) => {
    setPrompts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, ...updatedPrompt, updatedAt: new Date().toISOString() } : p
      )
    );
     addLog('DEBUG', `Prompt updated with ID: ${id}`);
  }, [addLog]);

  const deletePrompt = useCallback((id: string) => {
    const newPrompts = prompts.filter((p) => p.id !== id);
    setPrompts(newPrompts);
    addLog('INFO', `Prompt deleted with ID: ${id}`);
    return newPrompts;
  }, [prompts, addLog]);
  
  return { prompts, addPrompt, updatePrompt, deletePrompt };
};
