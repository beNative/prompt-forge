
import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import PromptList from './components/PromptList';
import PromptEditor from './components/PromptEditor';
import SettingsModal from './components/SettingsModal';
import { usePrompts } from './hooks/usePrompts';
import type { Prompt } from './types';
import { WelcomeScreen } from './components/WelcomeScreen';

export default function App() {
  const { prompts, addPrompt, updatePrompt, deletePrompt } = usePrompts();
  const [activePromptId, setActivePromptId] = useState<string | null>(null);
  const [isSettingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (prompts.length > 0 && activePromptId === null) {
      setActivePromptId(prompts[0].id);
    }
    if (prompts.length === 0) {
      setActivePromptId(null);
    }
  }, [prompts, activePromptId]);

  const handleNewPrompt = () => {
    const newPrompt = addPrompt();
    setActivePromptId(newPrompt.id);
  };

  const activePrompt = useMemo(() => {
    return prompts.find(p => p.id === activePromptId) || null;
  }, [prompts, activePromptId]);

  const handleSavePrompt = (promptToSave: Prompt) => {
    updatePrompt(promptToSave.id, promptToSave);
  };
  
  const handleDeletePrompt = (id: string) => {
    const newPrompts = deletePrompt(id);
    if (activePromptId === id) {
        setActivePromptId(newPrompts.length > 0 ? newPrompts[0].id : null);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-text-main font-sans">
      <Header onNewPrompt={handleNewPrompt} onOpenSettings={() => setSettingsOpen(true)} />
      <main className="flex flex-1 overflow-hidden">
        <div className="w-1/4 max-w-xs border-r border-border-color overflow-y-auto">
          <PromptList
            prompts={prompts}
            activePromptId={activePromptId}
            onSelectPrompt={setActivePromptId}
            onDeletePrompt={handleDeletePrompt}
          />
        </div>
        <div className="flex-1 flex flex-col">
          {activePrompt ? (
            <PromptEditor
              key={activePrompt.id}
              prompt={activePrompt}
              onSave={handleSavePrompt}
              onDelete={handleDeletePrompt}
            />
          ) : (
            <WelcomeScreen onNewPrompt={handleNewPrompt} />
          )}
        </div>
      </main>
      {isSettingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
