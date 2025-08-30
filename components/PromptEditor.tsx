
import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { Prompt, Settings } from '../types';
import { llmService } from '../services/llmService';
import { SparklesIcon, TrashIcon, UndoIcon, RedoIcon } from './Icons';
import Spinner from './Spinner';
import Modal from './Modal';
import { useLogger } from '../hooks/useLogger';
import { useHistoryState } from '../hooks/useHistoryState';
import IconButton from './IconButton';

// Let TypeScript know Prism is available on the window
declare const Prism: any;

interface PromptEditorProps {
  prompt: Prompt;
  onSave: (prompt: Prompt) => void;
  onDelete: (id: string) => void;
  settings: Settings;
}

const PromptEditor: React.FC<PromptEditorProps> = ({ prompt, onSave, onDelete, settings }) => {
  const [title, setTitle] = useState(prompt.title);
  const { state: content, setState: setContent, undo, redo, canUndo, canRedo } = useHistoryState(prompt.content);
  
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refinedContent, setRefinedContent] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const { addLog } = useLogger();

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  
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
    <div className="flex-1 flex flex-col p-4 md:p-6 bg-background overflow-y-auto">
      <div className="flex justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Prompt Title"
              className="bg-transparent text-3xl font-semibold text-text-main focus:outline-none w-full truncate placeholder:text-text-secondary/60"
            />
            {isDirty && (
                <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse flex-shrink-0" title="Unsaved changes"></div>
            )}
        </div>
        <button
            onClick={() => onDelete(prompt.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-transparent border border-destructive-border text-destructive-text hover:bg-destructive-bg-hover transition-colors duration-200 disabled:opacity-50"
          >
            <TrashIcon className="w-5 h-5" />
            Delete
          </button>
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
          className="absolute inset-0 p-4 w-full h-full bg-transparent text-transparent caret-primary resize-none font-mono text-base focus:outline-none z-10"
        />
        <pre 
            ref={preRef}
            aria-hidden="true" 
            className="absolute inset-0 p-4 w-full h-full overflow-auto pointer-events-none font-mono text-base"
        >
          <code className="language-markdown" dangerouslySetInnerHTML={{ __html: highlightedContent }} />
        </pre>
      </div>
      
      {error && <div className="mt-4 text-destructive-text p-3 bg-destructive-bg rounded-md">{error}</div>}

      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center gap-1">
            <IconButton onClick={undo} disabled={!canUndo} tooltip="Undo (Ctrl+Z)">
                <UndoIcon className={!canUndo ? 'text-text-secondary/50' : ''} />
            </IconButton>
            <IconButton onClick={redo} disabled={!canRedo} tooltip="Redo (Ctrl+Y)">
                <RedoIcon className={!canRedo ? 'text-text-secondary/50' : ''} />
            </IconButton>
        </div>
        <button
          onClick={handleRefine}
          disabled={isRefining || !content.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary hover:bg-primary-hover text-white font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
        >
          {isRefining ? <Spinner /> : <SparklesIcon className="w-5 h-5" />}
          {isRefining ? 'Refining...' : 'Refine with AI'}
        </button>
      </div>
      
      {refinedContent && (
        <Modal onClose={discardRefinement} title="AI Refinement Suggestion">
            <div className="p-4 bg-background text-text-main">
                <p className="text-text-secondary mb-2">The AI suggests the following refinement. You can accept this change or discard it.</p>
                <div className="p-3 my-4 bg-secondary border border-border-color rounded-md whitespace-pre-wrap font-mono text-sm max-h-96 overflow-y-auto">
                    {refinedContent}
                </div>
                <div className="flex justify-end gap-3 mt-4">
                    <button onClick={discardRefinement} className="px-4 py-2 rounded-md bg-secondary-light hover:bg-border-color text-text-main font-semibold">
                        Discard
                    </button>
                    <button onClick={acceptRefinement} className="px-4 py-2 rounded-md bg-primary hover:bg-primary-hover text-white font-semibold">
                        Accept
                    </button>
                </div>
            </div>
        </Modal>
      )}
    </div>
  );
};

export default PromptEditor;