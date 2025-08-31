import React, { useState, useMemo } from 'react';
import type { Prompt } from '../types';
import PromptTreeItem, { PromptNode } from './PromptTreeItem';

interface PromptListProps {
  prompts: Prompt[];
  activePromptId: string | null;
  onSelectPrompt: (id: string) => void;
  onDeletePrompt: (id: string) => void;
  onRenamePrompt: (id: string, newTitle: string) => void;
  onMovePrompt: (draggedId: string, targetId: string | null, position: 'before' | 'after' | 'inside') => void;
}

const PromptList: React.FC<PromptListProps> = ({ prompts, activePromptId, onSelectPrompt, onDeletePrompt, onRenamePrompt, onMovePrompt }) => {
  const [expandedIds, setExpandedIds] = useState(new Set<string>());
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const tree = useMemo(() => {
    const promptsById = new Map<string, PromptNode>(
      prompts.map(p => [p.id, { ...p, children: [] }])
    );
    const rootNodes: PromptNode[] = [];

    for (const prompt of prompts) {
      const node = promptsById.get(prompt.id)!;
      if (prompt.parentId && promptsById.has(prompt.parentId)) {
        promptsById.get(prompt.parentId)!.children.push(node);
      } else {
        rootNodes.push(node);
      }
    }
    return rootNodes;
  }, [prompts]);

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
      setIsDraggingOver(false);
      const draggedId = e.dataTransfer.getData('text/plain');
      if (draggedId) {
          // Dropping on the root container means moving the item to the top level.
          // We use targetId=null and position='after' to signify appending to the root.
          onMovePrompt(draggedId, null, 'after');
      }
  };

  const handleRootDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      // This is necessary to allow dropping
      e.dataTransfer.dropEffect = 'move';
      setIsDraggingOver(true);
  };


  return (
    <div 
        className="h-full p-2 relative"
        onDrop={handleRootDrop}
        onDragOver={handleRootDragOver}
        onDragLeave={() => setIsDraggingOver(false)}
    >
      {isDraggingOver && <div className="absolute inset-0 bg-primary/10 border-2 border-primary border-dashed rounded-lg" />}
      <h2 className="text-sm font-semibold text-text-secondary mb-2 px-2 tracking-wider uppercase">Prompts</h2>
      <ul className="space-y-0.5">
        {tree.map((node) => (
          <PromptTreeItem
            key={node.id}
            node={node}
            level={0}
            activePromptId={activePromptId}
            expandedIds={expandedIds}
            onSelectPrompt={onSelectPrompt}
            onDeletePrompt={onDeletePrompt}
            onRenamePrompt={onRenamePrompt}
            onMovePrompt={onMovePrompt}
            onToggleExpand={handleToggleExpand}
          />
        ))}
         {prompts.length === 0 && (
            <li className="text-center text-text-secondary p-4 text-sm">
                No prompts yet.
            </li>
         )}
      </ul>
    </div>
  );
};

export default PromptList;