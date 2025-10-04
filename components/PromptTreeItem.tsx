import React, { useState, useRef, useEffect } from 'react';
import type { PromptOrFolder } from '../types';
import IconButton from './IconButton';
import { FileIcon, FolderIcon, FolderOpenIcon, TrashIcon, ChevronRightIcon, ChevronDownIcon, CopyIcon, ArrowUpIcon, ArrowDownIcon } from './Icons';

export interface PromptNode extends PromptOrFolder {
  children: PromptNode[];
}

interface PromptTreeItemProps {
  node: PromptNode;
  level: number;
  selectedIds: Set<string>;
  focusedItemId: string | null;
  expandedIds: Set<string>;
  onSelectNode: (id: string, e: React.MouseEvent) => void;
  onDeleteNode: (id: string) => void;
  onRenameNode: (id: string, newTitle: string) => void;
  onMoveNode: (draggedIds: string[], targetId: string | null, position: 'before' | 'after' | 'inside') => void;
  onToggleExpand: (id: string) => void;
  onCopyNodeContent: (id: string) => void;
  searchTerm: string;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  indentSize: number;
  nodeSpacing: number;
}

// Helper function to determine drop position based on mouse coordinates within an element
const getDropPosition = (
  e: React.DragEvent,
  isFolder: boolean,
  itemEl: HTMLElement | null
): 'before' | 'after' | 'inside' | null => {
  if (!itemEl) return null;

  const rect = itemEl.getBoundingClientRect();
  const y = e.clientY - rect.top;
  const height = rect.height;

  if (height === 0) return null; // Avoid division by zero

  if (isFolder) {
    if (y < height * 0.25) return 'before';
    if (y > height * 0.75) return 'after';
    return 'inside';
  } else {
    if (y < height * 0.5) return 'before';
    return 'after';
  }
};


const PromptTreeItem: React.FC<PromptTreeItemProps> = (props) => {
  const {
    node,
    level,
    selectedIds,
    focusedItemId,
    expandedIds,
    onSelectNode,
    onDeleteNode,
    onRenameNode,
    onMoveNode,
    onToggleExpand,
    onCopyNodeContent,
    onMoveUp,
    onMoveDown,
    canMoveUp,
    canMoveDown,
    indentSize,
    nodeSpacing,
  } = props;
  
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(node.title);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | 'inside' | null>(null);

  const renameInputRef = useRef<HTMLInputElement>(null);
  const itemRef = useRef<HTMLLIElement>(null);

  const isSelected = selectedIds.has(node.id);
  const isFocused = focusedItemId === node.id;
  const isExpanded = expandedIds.has(node.id);
  const isFolder = node.type === 'folder';

  useEffect(() => {
    if (isRenaming) {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }
  }, [isRenaming]);
  
  useEffect(() => {
    if (isRenaming && !isSelected) {
      setIsRenaming(false);
    }
  }, [isSelected, isRenaming]);

  const handleRenameStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRenaming(true);
  };

  const handleRenameSubmit = () => {
    if (renameValue.trim() && renameValue.trim() !== node.title) {
      onRenameNode(node.id, renameValue.trim());
    }
    setIsRenaming(false);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleRenameSubmit();
    else if (e.key === 'Escape') setIsRenaming(false);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    const draggedIds = Array.from(selectedIds.has(node.id) ? selectedIds : new Set([node.id]));
    e.dataTransfer.setData('application/json', JSON.stringify(draggedIds));
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const position = getDropPosition(e, isFolder, itemRef.current);
    if (position !== dropPosition) {
        setDropPosition(position);
    }
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    setDropPosition(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const draggedIdsJSON = e.dataTransfer.getData('application/json');
    // Recalculate position on drop for accuracy, avoiding state lag.
    const finalDropPosition = getDropPosition(e, isFolder, itemRef.current);
    
    if (draggedIdsJSON && finalDropPosition) {
        const draggedIds = JSON.parse(draggedIdsJSON);
        if (!draggedIds.includes(node.id)) { // Prevent dropping on itself
            onMoveNode(draggedIds, node.id, finalDropPosition);
            // Auto-expand folder on drop for better UX
            if (finalDropPosition === 'inside' && isFolder && !isExpanded) {
                onToggleExpand(node.id);
            }
        }
    }
    setDropPosition(null);
  };
  
  const indentOffset = Math.max(level, 0) * indentSize;
  const paddingBlock = Math.max(nodeSpacing / 2, 0);

  return (
    <li
      ref={itemRef}
      draggable={!isRenaming}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative"
      data-item-id={node.id}
    >
      <div className="relative" style={{ marginLeft: `${indentOffset}px` }}>
        <div
            onClick={(e) => !isRenaming && onSelectNode(node.id, e)}
            onDoubleClick={(e) => !isRenaming && handleRenameStart(e)}
            className={`w-full text-left px-1.5 rounded-md group flex justify-between items-center transition-colors duration-150 text-sm relative focus:outline-none ${
                isSelected ? 'bg-background text-text-main' : 'hover:bg-border-color/30 text-text-secondary hover:text-text-main'
            } ${isFocused ? 'ring-2 ring-primary ring-offset-[-2px] ring-offset-secondary' : ''}`}
            style={{ paddingTop: `${paddingBlock}px`, paddingBottom: `${paddingBlock}px` }}
        >
            <div className="flex items-center gap-2 flex-1 truncate">
                {isFolder && node.children.length > 0 ? (
                    <button onClick={(e) => { e.stopPropagation(); onToggleExpand(node.id); }} className="-ml-1 p-0.5 rounded hover:bg-border-color">
                        {isExpanded ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
                    </button>
                ) : (
                    <div className="w-5" /> // Spacer for alignment
                )}

                {isFolder ? (
                    isExpanded ? <FolderOpenIcon className="w-4 h-4 flex-shrink-0" /> : <FolderIcon className="w-4 h-4 flex-shrink-0" />
                ) : (
                    <FileIcon className="w-4 h-4 flex-shrink-0" />
                )}

                {isRenaming ? (
                    <input
                        ref={renameInputRef}
                        type="text"
                        value={renameValue}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={handleRenameSubmit}
                        onKeyDown={handleRenameKeyDown}
                        className="w-full text-left text-sm px-1 rounded bg-background text-text-main ring-1 ring-primary focus:outline-none"
                    />
                ) : (
                    <span className="truncate flex-1 px-1">{node.title}</span>
                )}
            </div>

            {!isRenaming && (
                <div className={`transition-opacity pr-1 flex items-center ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <IconButton onClick={(e) => { e.stopPropagation(); onMoveUp(node.id); }} tooltip="Move Up" size="sm" variant="ghost" disabled={!canMoveUp}>
                        <ArrowUpIcon className="w-4 h-4" />
                    </IconButton>
                    <IconButton onClick={(e) => { e.stopPropagation(); onMoveDown(node.id); }} tooltip="Move Down" size="sm" variant="ghost" disabled={!canMoveDown}>
                        <ArrowDownIcon className="w-4 h-4" />
                    </IconButton>
                    {!isFolder && (
                        <IconButton onClick={(e) => { e.stopPropagation(); onCopyNodeContent(node.id); }} tooltip="Copy Content" size="sm" variant="ghost">
                            <CopyIcon className="w-4 h-4" />
                        </IconButton>
                    )}
                    <IconButton onClick={(e) => { e.stopPropagation(); onDeleteNode(node.id); }} tooltip="Delete" size="sm" variant="destructive">
                        <TrashIcon className="w-4 h-4" />
                    </IconButton>
                </div>
            )}
        </div>

        {dropPosition && <div className={`pointer-events-none absolute left-0 right-0 h-0.5 bg-primary ${
            dropPosition === 'before' ? 'top-0' : dropPosition === 'after' ? 'bottom-0' : ''
        }`} />}
        {dropPosition === 'inside' && <div className="pointer-events-none absolute inset-0 border-2 border-primary rounded-md bg-primary/10" />}
      </div>

        {isFolder && isExpanded && (
            <ul className="flex flex-col list-none">
                {node.children.map((childNode, index) => (
                    <PromptTreeItem
                        key={childNode.id}
                        {...props}
                        node={childNode}
                        level={level + 1}
                        canMoveUp={index > 0}
                        canMoveDown={index < node.children.length - 1}
                        indentSize={indentSize}
                        nodeSpacing={nodeSpacing}
                    />
                ))}
            </ul>
        )}
    </li>
  );
};

export default PromptTreeItem;