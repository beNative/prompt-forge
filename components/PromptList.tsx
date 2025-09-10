

import React from 'react';
import type { PromptOrFolder } from '../types';
import PromptTreeItem, { PromptNode } from './PromptTreeItem';

interface PromptListProps {
  tree: PromptNode[];
  prompts: PromptOrFolder[]; // needed for the empty state check
  activeNodeId: string | null;
  focusedItemId: string | null;
  onSelectNode: (id: string) => void;
  onDeleteNode: (id: string) => void;
  onRenameNode: (id: string, newTitle: string) => void;
  onMoveNode: (draggedId: string, targetId: string | null, position: 'before' | 'after' | 'inside') => void;
  onCopyNodeContent: (id: string) => void;
  searchTerm: string;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
}

const PromptList: React.FC<PromptListProps> = ({ 
  tree, prompts, activeNodeId, focusedItemId, onSelectNode, onDeleteNode, onRenameNode, onMoveNode, onCopyNodeContent, searchTerm, expandedIds, onToggleExpand
}) => {
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

  const displayExpandedIds = searchTerm.trim() 
      ? new Set(prompts.filter(i => i.type === 'folder').map(i => i.id)) 
      : expandedIds;

  return (
    <div 
        className="relative"
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
                focusedItemId={focusedItemId}
                expandedIds={displayExpandedIds}
                onSelectNode={onSelectNode}
                onDeleteNode={onDeleteNode}
                onRenameNode={onRenameNode}
                onMoveNode={onMoveNode}
                onToggleExpand={onToggleExpand}
                onCopyNodeContent={onCopyNodeContent}
                searchTerm={searchTerm}
            />
        ))}
        {prompts.length === 0 && (
            <li className="text-center text-text-secondary p-4 text-sm">
                No prompts or folders yet.
            </li>
        )}
        {prompts.length > 0 && tree.length === 0 && (
            <li className="text-center text-text-secondary p-4 text-sm">
                No results found for "{searchTerm}".
            </li>
        )}
        </ul>
    </div>
  );
};

export default PromptList;
