
import React, { useState, useRef, useEffect } from 'react';
import type { Prompt } from '../types';
import IconButton from './IconButton';
import { TrashIcon } from './Icons';

interface PromptListProps {
  prompts: Prompt[];
  activePromptId: string | null;
  onSelectPrompt: (id: string) => void;
  onDeletePrompt: (id: string) => void;
  onRenamePrompt: (id: string, newTitle: string) => void;
}

const PromptList: React.FC<PromptListProps> = ({ prompts, activePromptId, onSelectPrompt, onDeletePrompt, onRenamePrompt }) => {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDeletePrompt(id);
  };

  const handleRenameStart = (id: string, title: string) => {
    if (activePromptId === id) {
        setRenamingId(id);
        setRenameValue(title);
    }
  };

  const handleRenameSubmit = () => {
    if (renamingId && renameValue.trim()) {
      onRenamePrompt(renamingId, renameValue.trim());
    }
    setRenamingId(null);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      setRenamingId(null);
    }
  };

  useEffect(() => {
    if (renamingId) {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }
  }, [renamingId]);


  return (
    <div className="h-full p-2">
      <h2 className="text-sm font-semibold text-text-secondary mb-2 px-2 tracking-wider uppercase">Prompts</h2>
      <ul className="space-y-1">
        {prompts.map((prompt) => (
          <li key={prompt.id}>
             {renamingId === prompt.id ? (
                <div className="p-2">
                    <input
                        ref={renameInputRef}
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={handleRenameSubmit}
                        onKeyDown={handleRenameKeyDown}
                        className="w-full text-left text-sm p-1.5 rounded-md bg-background text-text-main ring-2 ring-primary focus:outline-none"
                    />
                </div>
            ) : (
            <button
              onClick={() => onSelectPrompt(prompt.id)}
              onDoubleClick={() => handleRenameStart(prompt.id, prompt.title)}
              title={activePromptId === prompt.id ? 'Double-click to rename' : ''}
              className={`w-full text-left p-2 rounded-md group flex justify-between items-center transition-colors duration-150 text-sm ${
                activePromptId === prompt.id
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'hover:bg-background text-text-secondary hover:text-text-main'
              }`}
            >
              <span className="truncate flex-1 pr-2">{prompt.title}</span>
              <div className={`opacity-0 ${activePromptId !== prompt.id ? 'group-hover:opacity-100' : ''} transition-opacity`}>
                 <IconButton onClick={(e) => handleDelete(e, prompt.id)} tooltip="Delete Prompt" size="sm" variant="destructive">
                    <TrashIcon className="w-4 h-4" />
                </IconButton>
              </div>
            </button>
            )}
          </li>
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