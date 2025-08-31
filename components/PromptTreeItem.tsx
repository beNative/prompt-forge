import React, { useState, useRef, useEffect } from 'react';
import type { Prompt } from '../types';
import IconButton from './IconButton';
import { TrashIcon, ChevronDownIcon, ChevronRightIcon } from './Icons';

export type PromptNode = Prompt & { children: PromptNode[] };
type DropPosition = 'before' | 'after' | 'inside' | null;

interface PromptTreeItemProps {
  node: PromptNode;
  level: number;
  activePromptId: string | null;
  expandedIds: Set<string>;
  onSelectPrompt: (id: string) => void;
  onDeletePrompt: (id: string) => void;
  onRenamePrompt: (id: string, newTitle: string) => void;
  onMovePrompt: (draggedId: string, targetId: string | null, position: 'before' | 'after' | 'inside') => void;
  onToggleExpand: (id: string) => void;
}

const PromptTreeItem: React.FC<PromptTreeItemProps> = ({ 
  node, level, activePromptId, expandedIds, onSelectPrompt, onDeletePrompt, onRenamePrompt, onMovePrompt, onToggleExpand 
}) => {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [dropPosition, setDropPosition] = useState<DropPosition>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const itemRef = useRef<HTMLLIElement>(null);

  const isExpanded = expandedIds.has(node.id);
  const hasChildren = node.children.length > 0;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeletePrompt(node.id);
  };

  const handleRenameStart = () => {
    setRenamingId(node.id);
    setRenameValue(node.title);
  };

  const handleRenameSubmit = () => {
    if (renamingId && renameValue.trim()) {
      onRenamePrompt(renamingId, renameValue.trim());
    }
    setRenamingId(null);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleRenameSubmit();
    else if (e.key === 'Escape') setRenamingId(null);
  };

  useEffect(() => {
    if (renamingId) {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }
  }, [renamingId]);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', node.id);
    e.dataTransfer.effectAllowed = 'move';
    // A little hack to make the drag image more transparent
    setTimeout(() => {
        if (itemRef.current) itemRef.current.classList.add('opacity-50');
    }, 0);
  };

  const handleDragEnd = () => {
     if (itemRef.current) itemRef.current.classList.remove('opacity-50');
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;

    if (y < height * 0.25) setDropPosition('before');
    else if (y > height * 0.75) setDropPosition('after');
    else setDropPosition('inside');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId && draggedId !== node.id && dropPosition) {
      onMovePrompt(draggedId, node.id, dropPosition);
    }
    setDropPosition(null);
  };
  
  const renderDropIndicator = () => {
    switch (dropPosition) {
        case 'before': return <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary z-10" />;
        case 'after': return <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary z-10" />;
        case 'inside': return <div className="absolute inset-0 rounded-md ring-2 ring-primary ring-inset z-10" />;
        default: return null;
    }
  };


  return (
    <li 
        ref={itemRef}
        onDragOver={handleDragOver}
        onDragLeave={() => setDropPosition(null)}
        onDrop={handleDrop}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        draggable={renamingId !== node.id}
        className="relative"
    >
      {renderDropIndicator()}
      <div style={{ paddingLeft: `${level * 1.25}rem` }} className="py-0.5">
        {renamingId === node.id ? (
          <div className="p-1">
            <input
              ref={renameInputRef} type="text" value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={handleRenameSubmit} onKeyDown={handleRenameKeyDown}
              className="w-full text-left text-sm p-1.5 rounded-md bg-background text-text-main ring-2 ring-primary focus:outline-none"
            />
          </div>
        ) : (
          <button
            onClick={() => onSelectPrompt(node.id)}
            onDoubleClick={handleRenameStart}
            title={activePromptId === node.id ? 'Double-click to rename' : node.title}
            className={`w-full text-left p-1.5 rounded-md group flex justify-between items-center transition-colors duration-150 text-sm ${
              activePromptId === node.id
                ? 'bg-primary/10 text-primary font-semibold'
                : 'hover:bg-background text-text-secondary hover:text-text-main'
            }`}
          >
            <div className="flex items-center gap-1 flex-1 truncate">
               <span onClick={(e) => { e.stopPropagation(); hasChildren && onToggleExpand(node.id); }} className="p-1">
                {hasChildren ? (
                    isExpanded ? <ChevronDownIcon className="w-4 h-4 flex-shrink-0" /> : <ChevronRightIcon className="w-4 h-4 flex-shrink-0" />
                ) : <span className="w-4 h-4 block" /> }
               </span>
              <span className="truncate flex-1 pr-2">{node.title}</span>
            </div>
            <div className={`opacity-0 ${activePromptId !== node.id ? 'group-hover:opacity-100' : ''} transition-opacity pr-1`}>
              <IconButton onClick={handleDelete} tooltip="Delete Prompt" size="sm" variant="destructive">
                <TrashIcon className="w-4 h-4" />
              </IconButton>
            </div>
          </button>
        )}
      </div>
      {isExpanded && hasChildren && (
        <ul>
          {node.children.map((childNode) => (
            <PromptTreeItem
              key={childNode.id}
              node={childNode}
              level={level + 1}
              activePromptId={activePromptId}
              expandedIds={expandedIds}
              onSelectPrompt={onSelectPrompt}
              onDeletePrompt={onDeletePrompt}
              onRenamePrompt={onRenamePrompt}
              onMovePrompt={onMovePrompt}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default PromptTreeItem;