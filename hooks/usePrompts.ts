
import { useState, useEffect, useCallback } from 'react';
// FIX: Correcting module imports. These will work once `types.ts` and `storageService.ts` are created.
import type { PromptOrFolder } from '../types';
import { LOCAL_STORAGE_KEYS } from '../constants';
import { storageService } from '../services/storageService';
import { useLogger } from './useLogger';

export const usePrompts = () => {
  const { addLog } = useLogger();
  const [items, setItems] = useState<PromptOrFolder[]>([]);

  useEffect(() => {
    storageService.load<PromptOrFolder[]>(LOCAL_STORAGE_KEYS.PROMPTS, []).then(loadedItems => {
      // Migration for older data structures
      const migratedItems = loadedItems.map(p => ({
        ...p,
        type: p.type || 'prompt', // Add type if it doesn't exist
        parentId: p.parentId === undefined ? null : p.parentId,
      }));
      setItems(migratedItems);
      addLog('DEBUG', `${migratedItems.length} items loaded and migrated from storage.`);
    });
  }, [addLog]);
  
  const persistItems = useCallback(async (newItems: PromptOrFolder[]) => {
      setItems(newItems);
      await storageService.save(LOCAL_STORAGE_KEYS.PROMPTS, newItems);
      addLog('DEBUG', `${newItems.length} items saved to storage.`);
  }, [addLog]);

  const addPrompt = useCallback((parentId: string | null = null) => {
    const newPrompt: PromptOrFolder = {
      id: crypto.randomUUID(),
      type: 'prompt',
      title: 'Untitled Prompt',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      parentId,
    };
    const newItems = [newPrompt, ...items];
    persistItems(newItems);
    addLog('INFO', `New prompt created with ID: ${newPrompt.id}`);
    return newPrompt;
  }, [items, persistItems, addLog]);
  
  const addFolder = useCallback((parentId: string | null = null) => {
    const newFolder: PromptOrFolder = {
      id: crypto.randomUUID(),
      type: 'folder',
      title: 'New Folder',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      parentId,
    };
    const newItems = [newFolder, ...items];
    persistItems(newItems);
    addLog('INFO', `New folder created with ID: ${newFolder.id}`);
    return newFolder;
  }, [items, persistItems, addLog]);

  const updateItem = useCallback((id: string, updatedItem: Partial<Omit<PromptOrFolder, 'id'>>) => {
    const newItems = items.map((p) =>
        p.id === id ? { ...p, ...updatedItem, updatedAt: new Date().toISOString() } : p
      );
    persistItems(newItems);
     addLog('DEBUG', `Item updated with ID: ${id}`);
  }, [items, persistItems, addLog]);

  const getDescendantIds = useCallback((itemId: string): Set<string> => {
      const descendantIds = new Set<string>();
      const findChildren = (parentId: string) => {
          items.forEach(p => {
              if (p.parentId === parentId) {
                  descendantIds.add(p.id);
                  if (p.type === 'folder') {
                      findChildren(p.id);
                  }
              }
          });
      };
      findChildren(itemId);
      return descendantIds;
  }, [items]);


  const deleteItem = useCallback((id: string) => {
    const allIdsToDelete = new Set<string>([id, ...getDescendantIds(id)]);
    
    const newItems = items.filter((p) => !allIdsToDelete.has(p.id));
    persistItems(newItems);
    addLog('INFO', `Deleted ${allIdsToDelete.size} item(s) starting from root ID: ${id}`);
    return newItems;
  }, [items, persistItems, addLog, getDescendantIds]);
  
  const moveItem = useCallback((draggedId: string, targetId: string | null, position: 'before' | 'after' | 'inside') => {
    let newItems = [...items];
    const draggedItem = newItems.find(p => p.id === draggedId);
    if (!draggedItem) return;

    const targetItem = targetId ? newItems.find(p => p.id === targetId) : null;
    
    if (position === 'inside' && targetItem?.type === 'prompt') {
        addLog('WARNING', 'Cannot move an item inside a prompt.');
        return; // Can't drop inside a prompt
    }

    // Prevent dragging a parent into its own descendant
    let currentParentId = targetId;
    while (currentParentId) {
        if (currentParentId === draggedId) {
            addLog('WARNING', 'Cannot move a folder into one of its own children.');
            return;
        }
        currentParentId = newItems.find(p => p.id === currentParentId)?.parentId ?? null;
    }

    newItems = newItems.filter(p => p.id !== draggedId);

    if (position === 'inside') {
        draggedItem.parentId = targetId;
        const parent = newItems.find(p => p.id === targetId);
        const siblings = newItems.filter(p => p.parentId === targetId);
        if (siblings.length > 0) {
            const lastSiblingIndex = newItems.findIndex(p => p.id === siblings[siblings.length - 1].id);
            newItems.splice(lastSiblingIndex + 1, 0, draggedItem);
        } else if (parent) {
            const parentIndex = newItems.findIndex(p => p.id === targetId);
            newItems.splice(parentIndex + 1, 0, draggedItem);
        } else { 
             draggedItem.parentId = null; // Dropped into empty root
             newItems.push(draggedItem);
        }
    } else {
        draggedItem.parentId = targetItem ? targetItem.parentId : null;
        const targetIndex = newItems.findIndex(p => p.id === targetId);
        
        if (targetIndex === -1) { // Dropping into root area, not on a specific item
             draggedItem.parentId = null;
             newItems.push(draggedItem);
        } else {
            const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
            newItems.splice(insertIndex, 0, draggedItem);
        }
    }

    persistItems(newItems);
    addLog('INFO', `Moved item ${draggedId}`);
}, [items, persistItems, addLog]);

  return { items, addPrompt, addFolder, updateItem, deleteItem, moveItem, getDescendantIds };
};