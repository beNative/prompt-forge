import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import PromptList from './components/PromptList';
import PromptEditor from './components/PromptEditor';
import SettingsModal from './components/SettingsModal';
import { usePrompts } from './hooks/usePrompts';
import type { Prompt } from './types';
import { WelcomeScreen } from './components/WelcomeScreen';
import InfoView from './components/InfoView';
import LoggerPanel from './components/LoggerPanel';
import StatusBar from './components/StatusBar';
import { useSettings } from './hooks/useSettings';
import { useLLMStatus } from './hooks/useLLMStatus';

type View = 'editor' | 'info';

export default function App() {
  const { prompts, addPrompt, updatePrompt, deletePrompt } = usePrompts();
  const { settings, saveSettings } = useSettings();
  const llmStatus = useLLMStatus(settings.llmProviderUrl);
  const [activePromptId, setActivePromptId] = useState<string | null>(null);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [view, setView] = useState<View>('editor');
  const [isLoggerVisible, setLoggerVisible] = useState(false);

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
    setView('editor'); // Switch to editor view when a new prompt is created
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

  const handleToggleInfoView = () => {
    setView(currentView => currentView === 'editor' ? 'info' : 'editor');
  };

  return (
    <div className="flex flex-col h-screen bg-background text-text-main font-sans">
      <Header 
        onNewPrompt={handleNewPrompt} 
        onOpenSettings={() => setSettingsOpen(true)}
        onToggleInfoView={handleToggleInfoView}
        onToggleLogger={() => setLoggerVisible(v => !v)}
        isInfoViewActive={view === 'info'}
      />
      <main className="flex flex-1 overflow-hidden">
        {view === 'editor' ? (
          <>
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
                  settings={settings}
                />
              ) : (
                <WelcomeScreen onNewPrompt={handleNewPrompt} />
              )}
            </div>
          </>
        ) : (
          <InfoView />
        )}
      </main>
      <LoggerPanel isVisible={isLoggerVisible} onToggleVisibility={() => setLoggerVisible(false)} />
      <StatusBar
        status={llmStatus}
        modelName={settings.llmModelName}
        promptCount={prompts.length}
        lastSaved={activePrompt?.updatedAt}
      />
      {isSettingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}