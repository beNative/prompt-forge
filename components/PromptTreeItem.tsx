import React, { useState, useRef, useEffect } from 'react';
import type { PromptOrFolder } from '../types';
import IconButton from './IconButton';
import { TrashIcon, ChevronDownIcon, ChevronRightIcon, FileIcon, FolderIcon, FolderOpenIcon, CopyIcon, CheckIcon } from './Icons';

export type PromptNode = PromptOrFolder & { children: PromptNode[] };
type DropIndicator = 'top' | 'bottom' | 'over' | null;

const HighlightedText: React.FC<{ text: string; highlight: string }> = ({ text, highlight }) => {
    if (!highlight.trim()) {
        return <>{text}</>;
    }
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === highlight.toLowerCase() ? (
                    <span key={i} className="bg-primary/20 text-primary font-semibold rounded">
                        {part}
                    </span>
                ) : (
                    part
                )
            )}
        </>
    );
};

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
}

const PromptTreeItem: React.FC<PromptTreeItemProps> = ({ 
  node, level, selectedIds, focusedItemId, expandedIds, onSelectNode, onDeleteNode, onRenameNode, onMoveNode, onToggleExpand, onCopyNodeContent, searchTerm
}) => {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [dropIndicator, setDropIndicator] = useState<DropIndicator>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const isExpanded = expandedIds.has(node.id);
  const hasChildren = node.children.length > 0;
  const isFolder = node.type === 'folder';
  const isFocused = focusedItemId === node.id;
  const isSelected = selectedIds.has(node.id);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteNode(node.id);
  };
  
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopyNodeContent(node.id);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
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
    e.stopPropagation();
    const idsToDrag = selectedIds.has(node.id) ? Array.from(selectedIds) : [node.id];
    e.dataTransfer.setData('application/json', JSON.stringify(idsToDrag));
    e.dataTransfer.effectAllowed = 'move';
    
    // Custom drag image
    const dragGhost = document.createElement('div');
    dragGhost.style.position = 'absolute';
    dragGhost.style.top = '-1000px';
    dragGhost.style.padding = '4px 8px';
    dragGhost.style.backgroundColor = 'rgb(var(--color-accent))';
    dragGhost.style.color = 'rgb(var(--color-accent-text))';
    dragGhost.style.borderRadius = '6px';
    dragGhost.style.fontSize = '12px';
    dragGhost.style.fontWeight = '600';
    dragGhost.textContent = `Moving ${idsToDrag.length} item(s)`;
    document.body.appendChild(dragGhost);
    e.dataTransfer.setDragImage(dragGhost, 0, 0);
    setTimeout(() => document.body.removeChild(dragGhost), 0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const draggedIds = JSON.parse(e.dataTransfer.getData('application/json') || '[]');
    if (draggedIds.includes(node.id)) {
        setDropIndicator(null);
        return;
    }
    
    const rect = (e.currentTarget as HTMLLIElement).getBoundingClientRect();
    const y = e.clientY - rect.top;

    if (y < rect.height * 0.33) {
        setDropIndicator('top');
    } else if (y > rect.height * 0.66) {
        setDropIndicator('bottom');
    } else {
        setDropIndicator(isFolder ? 'over' : 'bottom');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDropIndicator(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const draggedIdsJSON = e.dataTransfer.getData('application/json');
    if (draggedIdsJSON) {
        const draggedIds = JSON.parse(draggedIdsJSON);
        let position: 'before' | 'after' | 'inside';
        switch(dropIndicator) {
            case 'top': position = 'before'; break;
            case 'bottom': position = 'after'; break;
            case 'over': position = 'inside'; break;
            default: return;
        }
        onMoveNode(draggedIds, node.id, position);
        if (isFolder && position === 'inside' && !isExpanded) {
            onToggleExpand(node.id);
        }
    }
    setDropIndicator(null);
  };
  
  const renderIcon = () => {
      if (isFolder) {
          return isExpanded ? <FolderOpenIcon className="w-4 h-4 text-primary" /> : <FolderIcon className="w-4 h-4 text-primary" />;
      }
      return <FileIcon className="w-4 h-4" />;
  };

  return (
    <li 
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        draggable={renamingId !== node.id}
        className="relative"
        data-item-id={node.id}
    >
      {dropIndicator === 'top' && <div className="absolute top-0 left-4 right-0 h-[3px] bg-primary z-10 pointer-events-none rounded-full" />}
      <div style={{ paddingLeft: `${level * 1.25}rem` }} className="relative z-0">
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
            onClick={(e) => onSelectNode(node.id, e)}
            onDoubleClick={handleRenameStart}
            title="" // Disable native tooltip for truncated text
            className={`w-full text-left p-1.5 rounded-md group flex justify-between items-center transition-colors duration-150 text-sm relative focus:outline-none ${
              isSelected
                ? 'bg-primary/20 text-text-main'
                : 'hover:bg-border-color/30 text-text-secondary hover:text-text-main'
            } ${isFocused && !isSelected ? 'ring-1 ring-primary/50' : ''} ${dropIndicator === 'over' ? 'bg-primary/20' : ''}`}
          >
            <div className="flex items-center gap-1 flex-1 truncate">
               <span onClick={(e) => { e.stopPropagation(); (hasChildren || isFolder) && onToggleExpand(node.id); }} className="p-1 cursor-pointer">
                {(hasChildren || isFolder) ? (
                    isExpanded ? <ChevronDownIcon className="w-4 h-4 flex-shrink-0" /> : <ChevronRightIcon className="w-4 h-4 flex-shrink-0" />
                ) : <span className="w-4 h-4 block" /> }
               </span>
               <span className="flex-shrink-0">{renderIcon()}</span>
              <span className="truncate flex-1 px-1">
                <HighlightedText text={node.title} highlight={searchTerm} />
              </span>
            </div>
            <div className={`transition-opacity pr-1 flex items-center ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              {!isFolder && (
                  <IconButton onClick={handleCopy} tooltip={isCopied ? 'Copied!' : 'Copy'} size="sm" variant="ghost">
                      {isCopied ? <CheckIcon className="w-4 h-4 text-success" /> : <CopyIcon className="w-4 h-4" />}
                  </IconButton>
              )}
              <IconButton onClick={handleDelete} tooltip="Delete" size="sm" variant="destructive">
                <TrashIcon className="w-4 h-4" />
              </IconButton>
            </div>
          </button>
        )}
      </div>
      {dropIndicator === 'bottom' && <div className="absolute bottom-0 left-4 right-0 h-[3px] bg-primary z-10 pointer-events-none rounded-full" />}
      {isExpanded && hasChildren && (
        <ul>
          {node.children.map((childNode) => (
            <PromptTreeItem
              key={childNode.id}
              node={childNode}
              level={level + 1}
              selectedIds={selectedIds}
              focusedItemId={focusedItemId}
              expandedIds={expandedIds}
              onSelectNode={onSelectNode}
              onDeleteNode={onDeleteNode}
              onRenameNode={onRenameNode}
              onMoveNode={onMoveNode}
              onToggleExpand={onToggleExpand}
              onCopyNodeContent={onCopyNodeContent}
              searchTerm={searchTerm}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default PromptTreeItem;