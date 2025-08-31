

import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { PromptOrFolder, Settings } from '../types';
import { llmService } from '../services/llmService';
import { SparklesIcon, TrashIcon, UndoIcon, RedoIcon } from './Icons';
import Spinner from './Spinner';
import Modal from './Modal';
import { useLogger } from '../hooks/useLogger';
import { useHistoryState } from '../hooks/useHistoryState';
import IconButton from './IconButton';
import Button from './Button';

// Let TypeScript know Prism is available on the window
declare const Prism: any;

interface PromptEditorProps {
  prompt: PromptOrFolder;
  onSave: (prompt: PromptOrFolder) => void;
  onDelete: (id: string) => void;
  settings: Settings;
}

const PromptEditor: React.FC<PromptEditorProps> = ({ prompt, onSave, onDelete, settings }) => {
  const [title, setTitle] = useState(prompt.title);
  const { state: content, setState: setContent, undo, redo, canUndo, canRedo } = useHistoryState(prompt.content || '');
  
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refinedContent, setRefinedContent] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isAutoNaming, setIsAutoNaming] = useState(false);
  const { addLog } = useLogger();

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const autoNameTimeoutRef = useRef<number | null>(null);
  
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


  return (
    <div className="flex-1 flex flex-col p-6 bg-background overflow-y-auto">
      <div className="flex justify-between items-center mb-6 gap-4">
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
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse flex-shrink-0" title="Unsaved changes"></div>
            )}
        </div>
        <Button variant="destructive" onClick={() => onDelete(prompt.id)}>
          <TrashIcon className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>

      <div 
        className="editor-container relative w-full flex-1 rounded-lg bg-secondary border border-border-color focus-within:ring-2 focus-within:ring-primary focus-within:border-primary"
        data-placeholder={!content ? "Enter your prompt here..." : ""}
      >
        <textarea
          ref={editorRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleContentKeyDown}
          onScroll={syncScroll}
          spellCheck="false"
          className="absolute inset-0 p-4 w-full h-full bg-transparent text-transparent caret-primary resize-none font-mono text-base focus:outline-none z-10 whitespace-pre-wrap break-words"
        />
        <pre 
            ref={preRef}
            aria-hidden="true" 
            className="absolute inset-0 p-4 w-full h-full overflow-auto pointer-events-none font-mono text-base whitespace-pre-wrap break-words"
        >
          <code className="language-markdown" dangerouslySetInnerHTML={{ __html: highlightedContent }} />
        </pre>
      </div>
      
      {error && <div className="mt-4 text-destructive-text p-3 bg-destructive-bg rounded-md text-sm">{error}</div>}

      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center gap-1">
            <IconButton onClick={undo} disabled={!canUndo} tooltip="Undo (Ctrl+Z)">
                <UndoIcon className={!canUndo ? 'text-text-secondary/50' : ''} />
            </IconButton>
            <IconButton onClick={redo} disabled={!canRedo} tooltip="Redo (Ctrl+Y)">
                <RedoIcon className={!canRedo ? 'text-text-secondary/50' : ''} />
            </IconButton>
        </div>
        <Button
          onClick={handleRefine}
          disabled={!content.trim()}
          isLoading={isRefining}
          className="min-w-[150px]"
        >
          {!isRefining && <SparklesIcon className="w-5 h-5 mr-2" />}
          {isRefining ? 'Refining...' : 'Refine with AI'}
        </Button>
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