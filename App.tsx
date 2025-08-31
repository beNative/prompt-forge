import React, { useState, useEffect, useMemo, useCallback } from 'react';
// Hooks
import { usePrompts } from './hooks/usePrompts';
import { useSettings } from './hooks/useSettings';
import { useLLMStatus } from './hooks/useLLMStatus';
// Components
import Header from './components/Header';
import PromptList from './components/PromptList';
import PromptEditor from './components/PromptEditor';
import { WelcomeScreen } from './components/WelcomeScreen';
import SettingsModal from './components/SettingsModal';
import StatusBar from './components/StatusBar';
import LoggerPanel from './components/LoggerPanel';
import CommandPalette from './components/CommandPalette';
import InfoView from './components/InfoView';
// Types
import type { Prompt, Command } from './types';
// Context
import { IconProvider } from './contexts/IconContext';

const App: React.FC = () => {
    // State Hooks
    const { settings, saveSettings, loaded: settingsLoaded } = useSettings();
    const { prompts, addPrompt, updatePrompt, deletePrompt } = usePrompts();
    const [activePromptId, setActivePromptId] = useState<string | null>(null);

    // UI State
    const [view, setView] = useState<'editor' | 'info'>('editor');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isLoggerVisible, setIsLoggerVisible] = useState(false);
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

    const llmStatus = useLLMStatus(settings.llmProviderUrl);

    // Select the first prompt on load or when prompts change
    useEffect(() => {
        if (prompts.length > 0 && activePromptId === null) {
            setActivePromptId(prompts[0].id);
        } else if (prompts.length === 0) {
            setActivePromptId(null);
        }
    }, [prompts, activePromptId]);

    // Handlers
    const handleNewPrompt = useCallback(() => {
        const newPrompt = addPrompt();
        setActivePromptId(newPrompt.id);
        setView('editor');
    }, [addPrompt]);

    const handleSelectPrompt = (id: string) => {
        setActivePromptId(id);
        setView('editor');
    };

    const handleSavePrompt = (updatedPrompt: Partial<Omit<Prompt, 'id'>>) => {
        if (activePromptId) {
            updatePrompt(activePromptId, updatedPrompt);
        }
    };

    const handleDeletePrompt = useCallback((id: string) => {
        const newPrompts = deletePrompt(id);
        if (activePromptId === id) {
            setActivePromptId(newPrompts.length > 0 ? newPrompts[0].id : null);
        }
    }, [deletePrompt, activePromptId]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const isCtrl = isMac ? e.metaKey : e.ctrlKey;

            if (isCtrl && e.key === 'n') {
                e.preventDefault();
                handleNewPrompt();
            }
            if (isCtrl && e.shiftKey && e.key === 'P') {
                e.preventDefault();
                setIsCommandPaletteOpen(p => !p);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleNewPrompt]);

    // Derived State
    const activePrompt = useMemo(() => {
        return prompts.find(p => p.id === activePromptId) || null;
    }, [prompts, activePromptId]);
    
    // Command Palette Commands
    const commands: Command[] = useMemo(() => [
        { id: 'new-prompt', name: 'Create New Prompt', keywords: 'add create', action: handleNewPrompt },
        { id: 'delete-prompt', name: 'Delete Current Prompt', keywords: 'remove discard', action: () => activePromptId && handleDeletePrompt(activePromptId) },
        { id: 'open-settings', name: 'Open Settings', keywords: 'configure options', action: () => setIsSettingsOpen(true) },
        { id: 'toggle-info', name: 'Toggle Info View', keywords: 'help docs readme', action: () => setView(v => v === 'info' ? 'editor' : 'info') },
        { id: 'toggle-logs', name: 'Toggle Logs Panel', keywords: 'debug console', action: () => setIsLoggerVisible(v => !v) },
    ], [activePromptId, handleNewPrompt, handleDeletePrompt]);

    if (!settingsLoaded) {
        return <div className="w-screen h-screen flex items-center justify-center bg-background"><p className="text-text-main">Loading application...</p></div>;
    }

    return (
        <IconProvider value={{ iconSet: settings.iconSet }}>
            <div className="flex flex-col h-screen font-sans bg-background text-text-main antialiased">
                <Header 
                    onNewPrompt={handleNewPrompt}
                    onOpenSettings={() => setIsSettingsOpen(true)}
                    onToggleInfoView={() => setView(v => v === 'info' ? 'editor' : 'info')}
                    isInfoViewActive={view === 'info'}
                    onToggleLogger={() => setIsLoggerVisible(v => !v)}
                    onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
                />
                <main className="flex-1 flex overflow-hidden">
                    <aside className="w-72 bg-secondary border-r border-border-color overflow-y-auto flex-shrink-0">
                        <PromptList 
                            prompts={prompts}
                            activePromptId={activePromptId}
                            onSelectPrompt={handleSelectPrompt}
                            onDeletePrompt={handleDeletePrompt}
                        />
                    </aside>
                    <section className="flex-1 flex flex-col overflow-y-auto">
                        {view === 'editor' && (
                            activePrompt ? (
                                <PromptEditor 
                                    key={activePrompt.id}
                                    prompt={activePrompt}
                                    onSave={(p) => handleSavePrompt(p)}
                                    onDelete={handleDeletePrompt}
                                    settings={settings}
                                />
                            ) : (
                                <WelcomeScreen onNewPrompt={handleNewPrompt} />
                            )
                        )}
                        {view === 'info' && <InfoView />}
                    </section>
                </main>
                <StatusBar 
                    status={llmStatus}
                    modelName={settings.llmModelName}
                    promptCount={prompts.length}
                    lastSaved={activePrompt?.updatedAt}
                />
            </div>
            {isSettingsOpen && (
                <SettingsModal 
                    settings={settings}
                    onSave={saveSettings}
                    onClose={() => setIsSettingsOpen(false)}
                />
            )}
            <LoggerPanel isVisible={isLoggerVisible} onToggleVisibility={() => setIsLoggerVisible(v => !v)} />
            <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} commands={commands} />
        </IconProvider>
    );
};

export default App;
