import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Header from './components/Header';
import PromptList from './components/PromptList';
import PromptEditor from './components/PromptEditor';
import SettingsModal from './components/SettingsModal';
import { usePrompts } from './hooks/usePrompts';
import type { Command, Prompt } from './types';
import { WelcomeScreen } from './components/WelcomeScreen';
import InfoView from './components/InfoView';
import LoggerPanel from './components/LoggerPanel';
import StatusBar from './components/StatusBar';
import { useSettings } from './hooks/useSettings';
import { useLLMStatus } from './hooks/useLLMStatus';
import CommandPalette from './components/CommandPalette';
import { useLogger } from './hooks/useLogger';

type View = 'editor' | 'info';

export default function App() {
  const { prompts, addPrompt, updatePrompt, deletePrompt } = usePrompts();
  const { settings } = useSettings();
  const llmStatus = useLLMStatus(settings.llmProviderUrl);
  const [activePromptId, setActivePromptId] = useState<string | null>(null);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [view, setView] = useState<View>('editor');
  const [isLoggerVisible, setLoggerVisible] = useState(false);
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const { addLog } = useLogger();

  useEffect(() => {
    if (prompts.length > 0 && activePromptId === null) {
      setActivePromptId(prompts[0].id);
    }
    if (prompts.length === 0) {
      setActivePromptId(null);
    }
  }, [prompts, activePromptId]);

  // Command Palette global shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setCommandPaletteOpen(v => !v);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNewPrompt = useCallback(() => {
    const newPrompt = addPrompt();
    setActivePromptId(newPrompt.id);
    setView('editor');
  }, [addPrompt]);

  const activePrompt = useMemo(() => {
    return prompts.find(p => p.id === activePromptId) || null;
  }, [prompts, activePromptId]);

  const handleSavePrompt = (promptToSave: Prompt) => {
    updatePrompt(promptToSave.id, promptToSave);
  };
  
  const handleDeletePrompt = useCallback((id: string) => {
    const promptToDelete = prompts.find(p => p.id === id);
    if (promptToDelete && window.confirm(`Are you sure you want to delete "${promptToDelete.title}"?`)) {
        const newPrompts = deletePrompt(id);
        if (activePromptId === id) {
            setActivePromptId(newPrompts.length > 0 ? newPrompts[0].id : null);
        }
    }
  }, [prompts, deletePrompt, activePromptId]);

  const handleToggleInfoView = () => {
    setView(currentView => currentView === 'editor' ? 'info' : 'editor');
  };

  const commands: Command[] = useMemo(() => {
    const commandList: Command[] = [
      { id: 'new-prompt', name: 'Create New Prompt', action: () => { handleNewPrompt(); addLog('INFO', 'Command: Created new prompt.'); } },
      { id: 'open-settings', name: 'Open Settings', action: () => { setSettingsOpen(true); addLog('INFO', 'Command: Opened settings.'); } },
      { id: 'toggle-info', name: 'Toggle Info View', action: () => { handleToggleInfoView(); addLog('INFO', 'Command: Toggled info view.'); } },
      { id: 'toggle-logger', name: 'Toggle Logger Panel', action: () => { setLoggerVisible(v => !v); addLog('INFO', 'Command: Toggled logger panel.'); } },
    ];

    if (activePrompt) {
      commandList.push({
        id: 'delete-prompt',
        name: 'Delete Current Prompt',
        keywords: 'remove',
        action: () => { handleDeletePrompt(activePrompt.id); addLog('INFO', `Command: Deleted prompt "${activePrompt.title}".`); },
      });
    }

    return commandList;
  }, [activePrompt, handleNewPrompt, handleDeletePrompt, addLog]);

  return (
    <div className="flex flex-col h-screen bg-background text-text-main font-sans">
      <Header 
        onNewPrompt={handleNewPrompt} 
        onOpenSettings={() => setSettingsOpen(true)}
        onToggleInfoView={handleToggleInfoView}
        onToggleLogger={() => setLoggerVisible(v => !v)}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
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
                  onDelete={() => handleDeletePrompt(activePrompt.id)}
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
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        commands={commands}
      />
    </div>
  );
}