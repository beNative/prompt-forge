
import React, { useState } from 'react';
import PromptList from './PromptList';
import TemplateList from './TemplateList';
import type { PromptOrFolder, PromptTemplate } from '../types';
import IconButton from './IconButton';
import { FolderPlusIcon, PlusIcon, SearchIcon, DocumentDuplicateIcon } from './Icons';
import Button from './Button';

interface SidebarProps {
  prompts: PromptOrFolder[];
  activePromptId: string | null;
  onSelectPrompt: (id: string) => void;
  onDeletePrompt: (id: string) => void;
  onRenamePrompt: (id: string, newTitle: string) => void;
  onMovePrompt: (draggedId: string, targetId: string | null, position: 'before' | 'after' | 'inside') => void;
  onNewPrompt: () => void;
  onNewFolder: () => void;
  onCopyPromptContent: (id: string) => void;

  templates: PromptTemplate[];
  activeTemplateId: string | null;
  onSelectTemplate: (id: string) => void;
  onDeleteTemplate: (id: string) => void;
  onRenameTemplate: (id: string, newTitle: string) => void;
  onNewTemplate: () => void;
  onNewFromTemplate: () => void;
}

const Sidebar: React.FC<SidebarProps> = (props) => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="h-full flex flex-col">
      <div className="px-2 pt-2 pb-2 flex-shrink-0 border-b border-border-color">
        <div className="relative">
            <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
            <input
                type="text"
                placeholder="Search prompts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-background border border-border-color rounded-md pl-9 pr-3 py-1.5 text-sm text-text-main focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-text-secondary"
            />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {/* --- Prompts Section --- */}
        <header className="flex items-center justify-between p-2 flex-shrink-0">
            <h2 className="text-sm font-semibold text-text-secondary px-2 tracking-wider uppercase">Prompts</h2>
            <div className="flex items-center gap-1">
            <IconButton onClick={props.onNewFolder} tooltip="New Root Folder" size="sm" tooltipPosition="bottom">
                <FolderPlusIcon />
            </IconButton>
            <IconButton onClick={props.onNewPrompt} tooltip="New Prompt (Ctrl+N)" size="sm" tooltipPosition="bottom">
                <PlusIcon />
            </IconButton>
            </div>
        </header>
        <div className="px-2">
            <PromptList 
                items={props.prompts}
                activeNodeId={props.activePromptId}
                onSelectNode={props.onSelectPrompt}
                onDeleteNode={props.onDeletePrompt}
                onRenameNode={props.onRenamePrompt}
                onMoveNode={props.onMovePrompt}
                onCopyNodeContent={props.onCopyPromptContent}
                searchTerm={searchTerm}
            />
        </div>

        {/* --- Templates Section --- */}
        <header className="flex items-center justify-between p-2 mt-4 pt-4 border-t border-border-color flex-shrink-0">
            <h2 className="text-sm font-semibold text-text-secondary px-2 tracking-wider uppercase">Templates</h2>
            <div className="flex items-center gap-1">
                <IconButton onClick={props.onNewTemplate} tooltip="New Template" size="sm" tooltipPosition="bottom">
                    <DocumentDuplicateIcon />
                </IconButton>
            </div>
        </header>
        <div className="px-2">
            <TemplateList 
                templates={props.templates}
                activeTemplateId={props.activeTemplateId}
                onSelectTemplate={props.onSelectTemplate}
                onDeleteTemplate={props.onDeleteTemplate}
                onRenameTemplate={props.onRenameTemplate}
            />
        </div>
      </div>
       <div className="p-2 border-t border-border-color">
            <Button onClick={props.onNewFromTemplate} variant="secondary" className="w-full">
                <PlusIcon className="w-4 h-4 mr-2" />
                New from Template...
            </Button>
        </div>
    </div>
  );
};

export default Sidebar;