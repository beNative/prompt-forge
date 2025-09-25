import { useState, useEffect, useCallback } from 'react';
import type { PromptOrFolder } from '../types';
import { LOCAL_STORAGE_KEYS } from '../constants';
import { storageService } from '../services/storageService';
import { useLogger } from './useLogger';
import { usePromptHistory } from '../contexts/PromptHistoryContext';

export const usePrompts = () => {
  const { addLog } = useLogger();
  const { addVersion } = usePromptHistory();
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

  const addPrompt = useCallback((options: { parentId?: string | null; title?: string; content?: string; } = {}) => {
    const { parentId = null, title = 'Untitled Prompt', content = '' } = options;
    const newPrompt: PromptOrFolder = {
      id: crypto.randomUUID(),
      type: 'prompt',
      title,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      parentId,
    };
    const newItems = [newPrompt, ...items];
    persistItems(newItems);
    addLog('INFO', `New prompt created with ID: ${newPrompt.id} and title: "${title}"`);
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
    const originalItem = items.find((p) => p.id === id);

    // Save history BEFORE updating the state
    if (
      originalItem &&
      originalItem.type === 'prompt' &&
      updatedItem.content !== undefined &&
      originalItem.content !== updatedItem.content &&
      originalItem.content?.trim()
    ) {
      addVersion(id, originalItem.content, originalItem.updatedAt);
    }
      
    const newItems = items.map((p) =>
        p.id === id ? { ...p, ...updatedItem, updatedAt: new Date().toISOString() } : p
      );
    persistItems(newItems);
     addLog('DEBUG', `Item updated with ID: ${id}`);
  }, [items, persistItems, addLog, addVersion]);

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
  
  const moveItems = useCallback((draggedIds: string[], targetId: string | null, position: 'before' | 'after' | 'inside') => {
    const draggedItems = items.filter(p => draggedIds.includes(p.id));
    if (draggedItems.length === 0) return;

    // Prevent dragging a folder into its own descendant
    for (const draggedItem of draggedItems) {
        if (draggedItem.type === 'folder') {
            const descendantIds = getDescendantIds(draggedItem.id);
            if (targetId && (descendantIds.has(targetId) || draggedIds.includes(targetId))) {
                addLog('WARNING', 'Cannot move a folder into one of its own children.');
                return;
            }
        }
    }
    
    // Create a new array of items without the ones we're moving.
    let newItems = items.filter(p => !draggedIds.includes(p.id));
    
    const targetItem = targetId ? items.find(p => p.id === targetId) : null;
    
    // Determine the new parentId for the dragged items.
    let newParentId: string | null = null;
    if (position === 'inside') {
        if (targetItem?.type === 'prompt') {
             addLog('WARNING', 'Cannot move an item inside a prompt.');
             return; // Can't drop inside a prompt
        }
        newParentId = targetId;
    } else {
        newParentId = targetItem ? targetItem.parentId : null;
    }

    const updatedDraggedItems = draggedItems.map(item => ({ ...item, parentId: newParentId }));

    // Find the correct index to insert the items.
    let insertionIndex = -1;
    if (targetId) {
        if (position === 'inside') {
            const targetIndexInNewArray = newItems.findIndex(p => p.id === targetId);
            if (targetIndexInNewArray === -1) return; // Guard

            // We need to find the last item that is a descendant of the target folder
            // to ensure the new items are placed at the end of the entire folder block.
            let lastDescendantIndex = -1;

            // Create a map for efficient parent-child lookup within the current state of `newItems`.
            const parentMap = new Map<string, string | null>();
            newItems.forEach(item => parentMap.set(item.id, item.parentId));

            // Iterate backwards from the end of the array to find the last descendant.
            for (let i = newItems.length - 1; i > targetIndexInNewArray; i--) {
                let currentId = newItems[i].id;
                let parentId = parentMap.get(currentId);
                
                let isDescendant = false;
                while (parentId) {
                    if (parentId === targetId) {
                        isDescendant = true;
                        break;
                    }
                    parentId = parentMap.get(parentId);
                }

                if (isDescendant) {
                    lastDescendantIndex = i;
                    break; // Found the last one, we can stop.
                }
            }
            
            if (lastDescendantIndex !== -1) {
                // Found descendants, insert after the last one.
                insertionIndex = lastDescendantIndex + 1;
            } else {
                // No descendants found (folder is empty), insert right after the folder itself.
                insertionIndex = targetIndexInNewArray + 1;
            }
        } else {
             const targetIndexInNewArray = newItems.findIndex(p => p.id === targetId);
             insertionIndex = position === 'before' ? targetIndexInNewArray : targetIndexInNewArray + 1;
        }
    }

    if (insertionIndex !== -1) {
        newItems.splice(insertionIndex, 0, ...updatedDraggedItems);
    } else {
        // If no targetId (dropping on root), add to the end.
        newItems.push(...updatedDraggedItems);
    }

    persistItems(newItems);
    addLog('INFO', `Moved ${draggedIds.length} item(s).`);
}, [items, persistItems, addLog, getDescendantIds]);


  return { items, addPrompt, addFolder, updateItem, deleteItem, moveItems, getDescendantIds };
};