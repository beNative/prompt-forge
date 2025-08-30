
import { useState, useEffect, useCallback } from 'react';
import type { Prompt } from '../types';
import { LOCAL_STORAGE_KEYS } from '../constants';
import { storageService } from '../services/storageService';

export const usePrompts = () => {
  const [prompts, setPrompts] = useState<Prompt[]>(() =>
    storageService.load(LOCAL_STORAGE_KEYS.PROMPTS, [])
  );

  useEffect(() => {
    storageService.save(LOCAL_STORAGE_KEYS.PROMPTS, prompts);
  }, [prompts]);

  const addPrompt = useCallback(() => {
    const newPrompt: Prompt = {
      id: crypto.randomUUID(),
      title: 'Untitled Prompt',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPrompts((prev) => [newPrompt, ...prev]);
    return newPrompt;
  }, []);

  const updatePrompt = useCallback((id: string, updatedPrompt: Partial<Omit<Prompt, 'id'>>) => {
    setPrompts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, ...updatedPrompt, updatedAt: new Date().toISOString() } : p
      )
    );
  }, []);

  const deletePrompt = useCallback((id: string) => {
    const newPrompts = prompts.filter((p) => p.id !== id);
    setPrompts(newPrompts);
    return newPrompts;
  }, [prompts]);
  
  return { prompts, addPrompt, updatePrompt, deletePrompt };
};
