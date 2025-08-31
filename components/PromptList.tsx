import React, { useState, useMemo, useEffect } from 'react';
import type { PromptOrFolder } from '../types';
import PromptTreeItem, { PromptNode } from './PromptTreeItem';
import { storageService } from '../services/storageService';
import { LOCAL_STORAGE_KEYS } from '../constants';
import IconButton from './IconButton';
import { FolderPlusIcon, PlusIcon } from './Icons';

interface PromptListProps {
  items: PromptOrFolder[];
  activeNodeId: string | null;
  onSelectNode: (id: string) => void;
  onDeleteNode: (id: string) => void;
  onRenameNode: (id: string, newTitle: string) => void;
  onMoveNode: (draggedId: string, targetId: string | null, position: 'before' | 'after' | 'inside') => void;
  onNewPrompt: () => void;
  onNewFolder: () => void;
}

const PromptList: React.FC<PromptListProps> = ({ 
  items, activeNodeId, onSelectNode, onDeleteNode, onRenameNode, onMoveNode, onNewPrompt, onNewFolder 
}) => {
  const [expandedIds, setExpandedIds] = useState(new Set<string>());
  const [isStateLoaded, setIsStateLoaded] = useState(false);

  // Load expanded IDs from storage on mount
  useEffect(() => {
    storageService.load<string[]>(LOCAL_STORAGE_KEYS.EXPANDED_FOLDERS, []).then(ids => {
      setExpandedIds(new Set(ids));
      setIsStateLoaded(true);
    });
  }, []);

  // Save expanded IDs to storage whenever they change
  useEffect(() => {
    if (isStateLoaded) {
      storageService.save(LOCAL_STORAGE_KEYS.EXPANDED_FOLDERS, Array.from(expandedIds));
    }
  }, [expandedIds, isStateLoaded]);

  const tree = useMemo(() => {
    const itemsById = new Map<string, PromptNode>(
      items.map(p => [p.id, { ...p, children: [] }])
    );
    const rootNodes: PromptNode[] = [];

    for (const item of items) {
      const node = itemsById.get(item.id)!;
      if (item.parentId && itemsById.has(item.parentId)) {
        itemsById.get(item.parentId)!.children.push(node);
      } else {
        rootNodes.push(node);
      }
    }
    // Sort so folders come before prompts
    const sortNodes = (nodes: PromptNode[]): PromptNode[] => {
        nodes.sort((a, b) => {
            if (a.type === 'folder' && b.type === 'prompt') return -1;
            if (a.type === 'prompt' && b.type === 'folder') return 1;
            return a.title.localeCompare(b.title);
        });
        nodes.forEach(node => {
            if (node.children.length) {
                node.children = sortNodes(node.children);
            }
        });
        return nodes;
    };
    
    return sortNodes(rootNodes);
  }, [items]);

  const handleToggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };
  
  const handleRootDrop = (e: React.DragEvent) => {
      e.preventDefault();
      const draggedId = e.dataTransfer.getData('text/plain');
      if (draggedId) {
          onMoveNode(draggedId, null, 'after');
      }
  };

  const handleRootDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
  };


  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center justify-between p-2 flex-shrink-0">
        <h2 className="text-sm font-semibold text-text-secondary px-2 tracking-wider uppercase">Prompts</h2>
        <div className="flex items-center gap-1">
          <IconButton onClick={onNewFolder} tooltip="New Folder" size="sm">
            <FolderPlusIcon />
          </IconButton>
          <IconButton onClick={onNewPrompt} tooltip="New Prompt (Ctrl+N)" size="sm">
            <PlusIcon />
          </IconButton>
        </div>
      </header>
      <div 
          className="flex-1 p-2 relative overflow-y-auto"
          onDrop={handleRootDrop}
          onDragOver={handleRootDragOver}
      >
        <ul className="space-y-0.5">
          {tree.map((node) => (
            <PromptTreeItem
              key={node.id}
              node={node}
              level={0}
              activeNodeId={activeNodeId}
              expandedIds={expandedIds}
              onSelectNode={onSelectNode}
              onDeleteNode={onDeleteNode}
              onRenameNode={onRenameNode}
              onMoveNode={onMoveNode}
              onToggleExpand={handleToggleExpand}
            />
          ))}
          {items.length === 0 && (
              <li className="text-center text-text-secondary p-4 text-sm">
                  No prompts or folders yet.
              </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default PromptList;