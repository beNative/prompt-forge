

import React, { useState, useRef, useEffect } from 'react';
import type { PromptOrFolder } from '../types';
import IconButton from './IconButton';
import { TrashIcon, ChevronDownIcon, ChevronRightIcon, FileIcon, FolderIcon, FolderOpenIcon } from './Icons';

export type PromptNode = PromptOrFolder & { children: PromptNode[] };
type DropPosition = 'before' | 'after' | 'inside' | null;

interface PromptTreeItemProps {
  node: PromptNode;
  level: number;
  activeNodeId: string | null;
  expandedIds: Set<string>;
  onSelectNode: (id: string) => void;
  onDeleteNode: (id: string) => void;
  onRenameNode: (id: string, newTitle: string) => void;
  onMoveNode: (draggedId: string, targetId: string | null, position: 'before' | 'after' | 'inside') => void;
  onToggleExpand: (id: string) => void;
}

const PromptTreeItem: React.FC<PromptTreeItemProps> = ({ 
  node, level, activeNodeId, expandedIds, onSelectNode, onDeleteNode, onRenameNode, onMoveNode, onToggleExpand 
}) => {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);

  const isExpanded = expandedIds.has(node.id);
  const hasChildren = node.children.length > 0;
  const isFolder = node.type === 'folder';

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteNode(node.id);
  };

  const handleRenameStart = () => {
    setRenamingId(node.id);
    setRenameValue(node.title);
  };

  const handleRenameSubmit = () => {
    if (renamingId && renameValue.trim()) {
      onRenameNode(renamingId, renameValue.trim());
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
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;

    let dropPosition: DropPosition;
    if (y < height * 0.25) {
      dropPosition = 'before';
    } else if (y > height * 0.75) {
      dropPosition = 'after';
    } else {
      dropPosition = isFolder ? 'inside' : 'after';
    }

    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId && draggedId !== node.id) {
      onMoveNode(draggedId, node.id, dropPosition);
    }
  };
  
  const renderIcon = () => {
      if (isFolder) {
          return isExpanded ? <FolderOpenIcon className="w-4 h-4 text-primary" /> : <FolderIcon className="w-4 h-4 text-primary" />;
      }
      return <FileIcon className="w-4 h-4" />;
  };

  return (
    <li 
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragStart={handleDragStart}
        draggable={renamingId !== node.id}
        className="relative"
    >
      <div style={{ paddingLeft: `${level * 1.25}rem` }} className="py-0.5 relative z-0">
        {renamingId === node.id ? (
          <div className="p-1 flex items-center gap-1">
            <span onClick={(e) => { e.stopPropagation(); (hasChildren || isFolder) && onToggleExpand(node.id); }} className="p-1">
                {(hasChildren || isFolder) ? <ChevronRightIcon className="w-4 h-4 flex-shrink-0 opacity-0" /> : <span className="w-4 h-4 block" />}
            </span>
             {renderIcon()}
            <input
              ref={renameInputRef} type="text" value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={handleRenameSubmit} onKeyDown={handleRenameKeyDown}
              className="w-full text-left text-sm p-1.5 rounded-md bg-background text-text-main ring-2 ring-primary focus:outline-none"
            />
          </div>
        ) : (
          <button
            onClick={() => onSelectNode(node.id)}
            onDoubleClick={handleRenameStart}
            className={`w-full text-left p-1.5 rounded-md group flex justify-between items-center transition-colors duration-150 text-sm ${
              activeNodeId === node.id
                ? 'bg-background text-text-main'
                : 'hover:bg-border-color/30 text-text-secondary hover:text-text-main'
            }`}
          >
            <div className="flex items-center gap-1 flex-1 truncate">
               <span onClick={(e) => { e.stopPropagation(); (hasChildren || isFolder) && onToggleExpand(node.id); }} className="p-1">
                {(hasChildren || isFolder) ? (
                    isExpanded ? <ChevronDownIcon className="w-4 h-4 flex-shrink-0" /> : <ChevronRightIcon className="w-4 h-4 flex-shrink-0" />
                ) : <span className="w-4 h-4 block" /> }
               </span>
               <span className="flex-shrink-0">{renderIcon()}</span>
              <span className="truncate flex-1 px-1">{node.title}</span>
            </div>
            <div className={`transition-opacity pr-1 ${activeNodeId === node.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              <IconButton onClick={handleDelete} tooltip="Delete" size="sm" variant="destructive">
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
              activeNodeId={activeNodeId}
              expandedIds={expandedIds}
              onSelectNode={onSelectNode}
              onDeleteNode={onDeleteNode}
              onRenameNode={onRenameNode}
              onMoveNode={onMoveNode}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default PromptTreeItem;