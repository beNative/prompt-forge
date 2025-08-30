
import React from 'react';
import type { Prompt } from '../types';
import IconButton from './IconButton';
import { TrashIcon } from './Icons';

interface PromptListProps {
  prompts: Prompt[];
  activePromptId: string | null;
  onSelectPrompt: (id: string) => void;
  onDeletePrompt: (id: string) => void;
}

const PromptList: React.FC<PromptListProps> = ({ prompts, activePromptId, onSelectPrompt, onDeletePrompt }) => {

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDeletePrompt(id);
  };

  return (
    <div className="h-full p-4">
        <h2 className="text-lg font-semibold text-text-main mb-2">Prompts</h2>
      <ul className="space-y-1">
        {prompts.map((prompt) => (
          <li key={prompt.id}>
            <button
              onClick={() => onSelectPrompt(prompt.id)}
              className={`w-full text-left p-2 rounded-md group flex justify-between items-center transition-colors duration-150 ${
                activePromptId === prompt.id
                  ? 'bg-primary text-primary-text font-semibold'
                  : 'hover:bg-accent/10 text-text-secondary hover:text-text-main'
              }`}
            >
              <span className="truncate flex-1 pr-2">{prompt.title}</span>
              <div className={`opacity-0 ${activePromptId !== prompt.id ? 'group-hover:opacity-100' : ''} transition-opacity`}>
                 <IconButton onClick={(e) => handleDelete(e, prompt.id)} tooltip="Delete Prompt" size="sm" variant="destructive">
                    <TrashIcon className="w-4 h-4" />
                </IconButton>
              </div>
            </button>
          </li>
        ))}
         {prompts.length === 0 && (
            <li className="text-center text-text-secondary p-4 text-sm">
                No prompts yet. Create one!
            </li>
         )}
      </ul>
    </div>
  );
};

export default PromptList;
