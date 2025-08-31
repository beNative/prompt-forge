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
      // Migration for older prompts that don't have a parentId
      const migratedPrompts = loadedPrompts.map(p => ({
        ...p,
        parentId: p.parentId === undefined ? null : p.parentId,
      }));
      setPrompts(migratedPrompts);
      addLog('DEBUG', `${migratedPrompts.length} prompts loaded and migrated from storage.`);
    });
  }, [addLog]);
  
  const persistPrompts = useCallback(async (newPrompts: Prompt[]) => {
      setPrompts(newPrompts);
      await storageService.save(LOCAL_STORAGE_KEYS.PROMPTS, newPrompts);
      addLog('DEBUG', `${newPrompts.length} prompts saved to storage.`);
  }, [addLog]);

  const addPrompt = useCallback((parentId: string | null = null) => {
    const newPrompt: Prompt = {
      id: crypto.randomUUID(),
      title: 'Untitled Prompt',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      parentId,
    };
    // New prompts are added to the beginning of the list for visibility.
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
    const descendantIds = new Set<string>([id]);
    
    // Helper to recursively find all children
    const getDescendants = (parentId: string) => {
        prompts.forEach(p => {
            if (p.parentId === parentId) {
                descendantIds.add(p.id);
                getDescendants(p.id);
            }
        });
    };
    
    getDescendants(id);

    const newPrompts = prompts.filter((p) => !descendantIds.has(p.id));
    persistPrompts(newPrompts);
    addLog('INFO', `Deleted ${descendantIds.size} prompt(s) starting from root ID: ${id}`);
    return newPrompts;
  }, [prompts, persistPrompts, addLog]);
  
  const movePrompt = useCallback((draggedId: string, targetId: string | null, position: 'before' | 'after' | 'inside') => {
    let newPrompts = [...prompts];
    const draggedItem = newPrompts.find(p => p.id === draggedId);
    if (!draggedItem) return;

    // Prevent dragging a parent into its own descendant
    let currentParentId = targetId;
    while (currentParentId) {
        if (currentParentId === draggedId) {
            addLog('WARNING', 'Cannot move a prompt into one of its own children.');
            return;
        }
        currentParentId = newPrompts.find(p => p.id === currentParentId)?.parentId ?? null;
    }

    newPrompts = newPrompts.filter(p => p.id !== draggedId);

    if (position === 'inside') {
        draggedItem.parentId = targetId;
        const parent = newPrompts.find(p => p.id === targetId);
        const siblings = newPrompts.filter(p => p.parentId === targetId);
        if (siblings.length > 0) {
            const lastSiblingIndex = newPrompts.findIndex(p => p.id === siblings[siblings.length - 1].id);
            newPrompts.splice(lastSiblingIndex + 1, 0, draggedItem);
        } else if (parent) {
            const parentIndex = newPrompts.findIndex(p => p.id === targetId);
            newPrompts.splice(parentIndex + 1, 0, draggedItem);
        } else { 
             draggedItem.parentId = null; // Dropped into empty root
             newPrompts.push(draggedItem);
        }
    } else {
        const targetItem = newPrompts.find(p => p.id === targetId);
        draggedItem.parentId = targetItem ? targetItem.parentId : null;
        const targetIndex = newPrompts.findIndex(p => p.id === targetId);
        
        if (targetIndex === -1) { // Dropping into root area, not on a specific item
             draggedItem.parentId = null;
             newPrompts.push(draggedItem);
        } else {
            const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
            newPrompts.splice(insertIndex, 0, draggedItem);
        }
    }

    persistPrompts(newPrompts);
    addLog('INFO', `Moved prompt ${draggedId}`);
}, [prompts, persistPrompts, addLog]);

  return { prompts, addPrompt, updatePrompt, deletePrompt, movePrompt };
};