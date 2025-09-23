import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { PromptOrFolder, Settings } from '../types';
import { llmService } from '../services/llmService';
import { SparklesIcon, TrashIcon, UndoIcon, RedoIcon, CopyIcon, CheckIcon, HistoryIcon, EyeIcon, PencilIcon } from './Icons';
import Spinner from './Spinner';
import Modal from './Modal';
import { useLogger } from '../hooks/useLogger';
import { useHistoryState } from '../hooks/useHistoryState';
import IconButton from './IconButton';
import Button from './Button';

// Let TypeScript know Prism and marked are available on the window
declare const Prism: any;
declare const marked: any;

interface PromptEditorProps {
  prompt: PromptOrFolder;
  onSave: (prompt: PromptOrFolder) => void;
  onDelete: (id: string) => void;
  settings: Settings;
  onShowHistory: () => void;
}

const PromptEditor: React.FC<PromptEditorProps> = ({ prompt, onSave, onDelete, settings, onShowHistory }) => {
  const [title, setTitle] = useState(prompt.title);
  const { state: content, setState: setContent, undo, redo, canUndo, canRedo } = useHistoryState(prompt.content || '');
  
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refinedContent, setRefinedContent] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isAutoNaming, setIsAutoNaming] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const { addLog } = useLogger();

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const autoNameTimeoutRef = useRef<number | null>(null);

  // Switch back to edit mode if prompt changes
  useEffect(() => {
    setViewMode('edit');
  }, [prompt.id]);
  
  // Effect to detect unsaved changes
  useEffect(() => {
    const hasUnsavedChanges = title !== prompt.title || content !== prompt.content;
    setIsDirty(hasUnsavedChanges);
  }, [title, content, prompt.title, prompt.content]);

  // Consolidated and debounced auto-save effect
  useEffect(() => {
    if (!isDirty) {
      return;
    }

    const handler = setTimeout(() => {
      onSave({ ...prompt, title, content });
    }, 500); // 500ms debounce time

    return () => clearTimeout(handler);
  }, [title, content, isDirty, onSave, prompt]);

  // Effect for auto-naming untitled prompts
  useEffect(() => {
    if (prompt.type !== 'prompt') return;

    const isUntitled = prompt.title === 'Untitled Prompt';
    const hasEnoughContent = content.trim().length >= 50;

    if (!isUntitled || !hasEnoughContent || isAutoNaming) {
      return;
    }

    if (autoNameTimeoutRef.current) {
      clearTimeout(autoNameTimeoutRef.current);
    }

    autoNameTimeoutRef.current = window.setTimeout(async () => {
      if (!settings.llmProviderUrl || !settings.llmModelName) {
        addLog('DEBUG', 'Skipping auto-name because LLM is not configured.');
        return;
      }
      
      setIsAutoNaming(true);
      addLog('INFO', 'Attempting to auto-name prompt based on content.');
      try {
        const newTitle = await llmService.generateTitle(content, settings, addLog);
        if (newTitle) {
          setTitle(newTitle);
          addLog('INFO', `Successfully auto-named prompt to: "${newTitle}"`);
        } else {
          addLog('WARNING', 'Auto-name returned an empty title.');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        addLog('WARNING', `Could not auto-name prompt: ${message}`);
      } finally {
        setIsAutoNaming(false);
      }
    }, 1500);

    return () => {
      if (autoNameTimeoutRef.current) {
        clearTimeout(autoNameTimeoutRef.current);
      }
    };
  }, [content, prompt.title, prompt.type, settings, addLog, isAutoNaming]);
  
  const highlightedContent = useMemo(() => {
    if (typeof Prism === 'undefined' || !Prism.languages.markdown) {
        // Fallback for when Prism isn't loaded yet
        return content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    // Append a newline to prevent issues with highlighting the last line
    return Prism.highlight(content + '\n', Prism.languages.markdown, 'markdown');
  }, [content]);

  const renderedPreviewHtml = useMemo(() => {
    if (typeof marked === 'undefined' || !content) {
        return '';
    }
    return marked.parse(content);
  }, [content]);

  const syncScroll = () => {
    if (editorRef.current && preRef.current) {
        preRef.current.scrollTop = editorRef.current.scrollTop;
        preRef.current.scrollLeft = editorRef.current.scrollLeft;
    }
  };


  const handleRefine = async () => {
    setIsRefining(true);
    setError(null);
    addLog('INFO', `Requesting AI refinement for prompt: "${title}"`);
    try {
      const result = await llmService.refinePrompt(content, settings, addLog);
      setRefinedContent(result);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
        addLog('ERROR', `AI refinement failed: ${e.message}`);
      } else {
        setError('An unknown error occurred.');
        addLog('ERROR', 'AI refinement failed with an unknown error.');
      }
    } finally {
      setIsRefining(false);
    }
  };

  const acceptRefinement = () => {
    if (refinedContent) {
      setContent(refinedContent); // This pushes the new state to history
      addLog('INFO', `AI refinement accepted for prompt: "${title}"`);
    }
    setRefinedContent(null);
  };

  const discardRefinement = () => {
    addLog('INFO', `AI refinement discarded for prompt: "${title}"`);
    setRefinedContent(null);
  }

  const handleContentKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const isUndo = (isMac ? e.metaKey : e.ctrlKey) && !e.shiftKey && e.key === 'z';
    const isRedo = (isMac ? e.metaKey && e.shiftKey && e.key === 'z' : e.ctrlKey && e.key === 'y');

    if (isUndo) {
        e.preventDefault();
        undo();
    }
    if (isRedo) {
        e.preventDefault();
        redo();
    }
  };

  const handleCopy = async () => {
    if (!content.trim()) return;
    try {
        await navigator.clipboard.writeText(content);
        setIsCopied(true);
        addLog('INFO', `Prompt content copied to clipboard.`);
        setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
        addLog('ERROR', `Failed to copy to clipboard: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-secondary overflow-y-auto">
      <div className="flex justify-between items-center px-6 py-6 gap-4 border-b border-border-color flex-shrink-0">
        <div className="flex items-center gap-3 flex-1 min-w-0">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isAutoNaming ? "Generating title..." : "Prompt Title"}
              disabled={isAutoNaming}
              className="bg-transparent text-2xl font-semibold text-text-main focus:outline-none w-full truncate placeholder:text-text-secondary disabled:opacity-70"
            />
            {isAutoNaming && <Spinner />}
            {isDirty && !isAutoNaming && (
                <div className="relative group flex-shrink-0">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 w-max px-2 py-1 text-xs font-semibold text-tooltip-text bg-tooltip-bg rounded-md opacity-0 group-hover:opacity-100 transition-opacity delay-500 pointer-events-none">
                        Unsaved changes
                    </span>
                </div>
            )}
        </div>
        <div className="flex items-center gap-1">
            <div className="flex items-center p-1 bg-background rounded-lg border border-border-color">
                <IconButton onClick={() => setViewMode('edit')} tooltip="Edit" size="sm" className={`rounded-md ${viewMode === 'edit' ? 'bg-secondary text-primary' : 'text-text-secondary'}`} >
                    <PencilIcon className="w-5 h-5" />
                </IconButton>
                <IconButton onClick={() => setViewMode('preview')} tooltip="Preview" size="sm" className={`rounded-md ${viewMode === 'preview' ? 'bg-secondary text-primary' : 'text-text-secondary'}`}>
                    <EyeIcon className="w-5 h-5" />
                </IconButton>
            </div>

            <div className="h-6 w-px bg-border-color mx-1"></div>

            <IconButton onClick={undo} disabled={!canUndo || viewMode === 'preview'} tooltip="Undo (Ctrl+Z)" size="sm" variant="ghost">
                <UndoIcon className="w-5 h-5" />
            </IconButton>
            <IconButton onClick={redo} disabled={!canRedo || viewMode === 'preview'} tooltip="Redo (Ctrl+Y)" size="sm" variant="ghost">
                <RedoIcon className="w-5 h-5" />
            </IconButton>
            <IconButton onClick={onShowHistory} tooltip="View Version History" size="sm" variant="ghost">
              <HistoryIcon className="w-5 h-5" />
            </IconButton>
            
            <div className="h-6 w-px bg-border-color mx-1"></div>

            <IconButton onClick={handleCopy} disabled={!content.trim()} tooltip={isCopied ? 'Copied!' : 'Copy Prompt'} size="sm" variant="ghost">
              {isCopied ? <CheckIcon className="w-5 h-5 text-success" /> : <CopyIcon className="w-5 h-5" />}
            </IconButton>
            <IconButton onClick={handleRefine} disabled={!content.trim() || viewMode === 'preview' || isRefining} tooltip="Refine with AI" size="sm" variant="ghost">
                {isRefining ? <Spinner /> : <SparklesIcon className="w-5 h-5 text-primary" />}
            </IconButton>
            <IconButton onClick={() => onDelete(prompt.id)} tooltip="Delete Prompt" size="sm" variant="destructive">
              <TrashIcon className="w-5 h-5" />
            </IconButton>
        </div>
      </div>

        <div className="flex-1 flex flex-col bg-background overflow-y-auto">
            {viewMode === 'edit' ? (
            <div 
                className="editor-container relative w-full flex-1 focus-within:ring-2 focus-within:ring-primary"
                data-placeholder={!content ? "Enter your prompt here..." : ""}
            >
                <textarea
                ref={editorRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleContentKeyDown}
                onScroll={syncScroll}
                spellCheck="false"
                className="absolute inset-0 p-6 w-full h-full bg-transparent text-transparent caret-primary resize-none font-mono text-base focus:outline-none z-10 whitespace-pre-wrap break-words"
                />
                <pre 
                    ref={preRef}
                    aria-hidden="true" 
                    className="absolute inset-0 p-6 w-full h-full overflow-auto pointer-events-none font-mono text-base whitespace-pre-wrap break-words"
                >
                <code className="language-markdown" dangerouslySetInnerHTML={{ __html: highlightedContent }} />
                </pre>
            </div>
          ) : (
            <div className="flex-1 w-full p-6 overflow-y-auto">
                <div 
                    className="markdown-content text-text-secondary" 
                    dangerouslySetInnerHTML={{ __html: renderedPreviewHtml }}
                />
            </div>
          )}
          
          {error && <div className="text-destructive-text p-3 bg-destructive-bg rounded-md text-sm mx-6 mb-6">{error}</div>}
        </div>
      
      {refinedContent && (
        <Modal onClose={discardRefinement} title="AI Refinement Suggestion">
            <div className="p-6 text-text-main">
                <p className="text-text-secondary mb-4 text-sm">The AI suggests the following refinement. You can accept this change or discard it.</p>
                <div className="p-3 my-4 bg-background border border-border-color rounded-md whitespace-pre-wrap font-mono text-sm max-h-96 overflow-y-auto">
                    {refinedContent}
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <Button onClick={discardRefinement} variant="secondary">
                        Discard
                    </Button>
                    <Button onClick={acceptRefinement} variant="primary">
                        Accept
                    </Button>
                </div>
            </div>
        </Modal>
      )}
    </div>
  );
};

export default PromptEditor;