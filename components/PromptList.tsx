

import React, { useState, useMemo, useEffect } from 'react';
import type { PromptOrFolder } from '../types';
import PromptTreeItem, { PromptNode } from './PromptTreeItem';
import { storageService } from '../services/storageService';
import { LOCAL_STORAGE_KEYS } from '../constants';

interface PromptListProps {
  items: PromptOrFolder[];
  activeNodeId: string | null;
  onSelectNode: (id: string) => void;
  onDeleteNode: (id: string) => void;
  onRenameNode: (id: string, newTitle: string) => void;
  onMoveNode: (draggedId: string, targetId: string | null, position: 'before' | 'after' | 'inside') => void;
  onCopyNodeContent: (id: string) => void;
  searchTerm: string;
}

const PromptList: React.FC<PromptListProps> = ({ 
  items, activeNodeId, onSelectNode, onDeleteNode, onRenameNode, onMoveNode, onCopyNodeContent, searchTerm
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

  // Save expanded IDs to storage whenever they change, but not if a search is active
  useEffect(() => {
    if (isStateLoaded && !searchTerm) {
      storageService.save(LOCAL_STORAGE_KEYS.EXPANDED_FOLDERS, Array.from(expandedIds));
    }
  }, [expandedIds, isStateLoaded, searchTerm]);

  const filteredTree = useMemo(() => {
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

    let itemsToBuildFrom = items;

    if (searchTerm.trim()) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const visibleIds = new Set<string>();
      const originalItemsById = new Map(items.map(i => [i.id, i]));

      const getAncestors = (itemId: string) => {
        let current = originalItemsById.get(itemId);
        while (current && current.parentId) {
          visibleIds.add(current.parentId);
          current = originalItemsById.get(current.parentId);
        }
      };
      
      const getDescendantIds = (itemId: string): Set<string> => {
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
      };

      items.forEach(item => {
        if (item.title.toLowerCase().includes(lowerCaseSearchTerm)) {
          visibleIds.add(item.id);
          getAncestors(item.id);
          if (item.type === 'folder') {
            getDescendantIds(item.id).forEach(id => visibleIds.add(id));
          }
        }
      });
      
      itemsToBuildFrom = items.filter(item => visibleIds.has(item.id));
    }

    const itemsById = new Map<string, PromptNode>(
      itemsToBuildFrom.map(p => [p.id, { ...p, children: [] }])
    );
    const rootNodes: PromptNode[] = [];
    
    for (const item of itemsToBuildFrom) {
      const node = itemsById.get(item.id)!;
      if (item.parentId && itemsById.has(item.parentId)) {
        itemsById.get(item.parentId)!.children.push(node);
      } else {
        rootNodes.push(node);
      }
    }
    
    return sortNodes(rootNodes);
  }, [items, searchTerm]);
  
  const displayExpandedIds = useMemo(() => {
    if (!searchTerm.trim()) {
      return expandedIds;
    }
    // If searching, auto-expand all folders present in the filtered tree
    const newExpandedIds = new Set<string>();
    const collectFolderIds = (nodes: PromptNode[]) => {
      for (const node of nodes) {
        if (node.type === 'folder' && node.children.length > 0) {
          newExpandedIds.add(node.id);
          collectFolderIds(node.children);
        }
      }
    };
    collectFolderIds(filteredTree);
    return newExpandedIds;
  }, [searchTerm, expandedIds, filteredTree]);

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
    e.stopPropagation();
    const draggedId = e.dataTransfer.getData('text/plain');
    const targetItem = e.target as HTMLElement;

    if (targetItem.closest('li[draggable="true"]')) {
        return;
    }

    if (draggedId) {
        onMoveNode(draggedId, null, 'inside');
    }
  };

  const handleRootDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
  };

  return (
    <div 
        className="relative"
        onDrop={handleRootDrop}
        onDragOver={handleRootDragOver}
    >
        <ul className="space-y-0.5">
        {filteredTree.map((node) => (
            <PromptTreeItem
            key={node.id}
            node={node}
            level={0}
            activeNodeId={activeNodeId}
            expandedIds={displayExpandedIds}
            onSelectNode={onSelectNode}
            onDeleteNode={onDeleteNode}
            onRenameNode={onRenameNode}
            onMoveNode={onMoveNode}
            onToggleExpand={handleToggleExpand}
            onCopyNodeContent={onCopyNodeContent}
            searchTerm={searchTerm}
            />
        ))}
        {items.length === 0 && (
            <li className="text-center text-text-secondary p-4 text-sm">
                No prompts or folders yet.
            </li>
        )}
        {items.length > 0 && filteredTree.length === 0 && (
            <li className="text-center text-text-secondary p-4 text-sm">
                No results found for "{searchTerm}".
            </li>
        )}
        </ul>
    </div>
  );
};

export default PromptList;