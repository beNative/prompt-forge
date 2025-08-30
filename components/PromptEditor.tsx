import React, { useState, useEffect } from 'react';
import type { Prompt, Settings } from '../types';
import { llmService } from '../services/llmService';
import { SparklesIcon, TrashIcon } from './Icons';
import Spinner from './Spinner';
import Modal from './Modal';
import { useLogger } from '../hooks/useLogger';

interface PromptEditorProps {
  prompt: Prompt;
  onSave: (prompt: Prompt) => void;
  onDelete: (id: string) => void;
  settings: Settings;
}

const PromptEditor: React.FC<PromptEditorProps> = ({ prompt, onSave, onDelete, settings }) => {
  const [title, setTitle] = useState(prompt.title);
  const [content, setContent] = useState(prompt.content);
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refinedContent, setRefinedContent] = useState<string | null>(null);
  const { addLog } = useLogger();

  useEffect(() => {
    const handler = setTimeout(() => {
      if (title !== prompt.title || content !== prompt.content) {
        onSave({ ...prompt, title, content });
      }
    }, 500); // Debounce save
    return () => clearTimeout(handler);
  }, [title, content, prompt, onSave]);

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
      setContent(refinedContent);
      onSave({ ...prompt, title, content: refinedContent });
      addLog('INFO', `AI refinement accepted for prompt: "${title}"`);
    }
    setRefinedContent(null);
  };

  const discardRefinement = () => {
    addLog('INFO', `AI refinement discarded for prompt: "${title}"`);
    setRefinedContent(null);
  }
  
  const handleDeleteClick = () => {
    if (window.confirm(`Are you sure you want to delete "${prompt.title}"?`)) {
      onDelete(prompt.id);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 bg-background overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Prompt Title"
          className="bg-transparent text-2xl font-bold text-text-main focus:outline-none w-full"
        />
        <button
            onClick={handleDeleteClick}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors duration-200 disabled:opacity-50"
          >
            <TrashIcon className="w-5 h-5" />
            Delete
          </button>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Enter your prompt here..."
        className="w-full flex-1 p-4 rounded-md bg-secondary text-text-secondary border border-border-color focus:ring-2 focus:ring-primary focus:border-primary resize-none font-mono text-sm"
      />
      
      {error && <div className="mt-4 text-red-400 p-3 bg-red-900/50 rounded-md">{error}</div>}

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleRefine}
          disabled={isRefining || !content.trim()}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary hover:bg-primary-hover text-white font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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