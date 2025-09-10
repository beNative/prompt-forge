
import React, { useState, useRef, useEffect } from 'react';
import type { PromptTemplate } from '../types';
import IconButton from './IconButton';
import { TrashIcon, DocumentDuplicateIcon } from './Icons';

interface TemplateListProps {
  templates: PromptTemplate[];
  activeTemplateId: string | null;
  onSelectTemplate: (id: string) => void;
  onDeleteTemplate: (id: string) => void;
  onRenameTemplate: (id: string, newTitle: string) => void;
}

const TemplateList: React.FC<TemplateListProps> = ({ templates, activeTemplateId, onSelectTemplate, onDeleteTemplate, onRenameTemplate }) => {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);

  const handleRenameStart = (e: React.MouseEvent, template: PromptTemplate) => {
    e.stopPropagation();
    setRenamingId(template.id);
    setRenameValue(template.title);
  };

  const handleRenameSubmit = () => {
    if (renamingId && renameValue.trim()) {
      onRenameTemplate(renamingId, renameValue.trim());
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
  
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDeleteTemplate(id);
  };

  return (
    <ul className="space-y-0.5">
      {templates.map((template) => (
        <li key={template.id}>
          {renamingId === template.id ? (
            <div className="p-1 flex items-center gap-2">
              <DocumentDuplicateIcon className="w-4 h-4 flex-shrink-0" />
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
              onClick={() => onSelectTemplate(template.id)}
              onDoubleClick={(e) => handleRenameStart(e, template)}
              className={`w-full text-left p-1.5 rounded-md group flex justify-between items-center transition-colors duration-150 text-sm ${
                activeTemplateId === template.id
                  ? 'bg-background text-text-main'
                  : 'hover:bg-border-color/30 text-text-secondary hover:text-text-main'
              }`}
            >
              <div className="flex items-center gap-2 flex-1 truncate">
                <DocumentDuplicateIcon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate flex-1 px-1">{template.title}</span>
              </div>
              <div className={`transition-opacity pr-1 flex items-center ${activeTemplateId === template.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <IconButton onClick={(e) => handleDelete(e, template.id)} tooltip="Delete" size="sm" variant="destructive">
                  <TrashIcon className="w-4 h-4" />
                </IconButton>
              </div>
            </button>
          )}
        </li>
      ))}
       {templates.length === 0 && (
          <li className="text-center text-text-secondary p-4 text-sm">
              No templates yet.
          </li>
      )}
    </ul>
  );
};

export default TemplateList;