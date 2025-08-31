
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
// Hooks
import { usePrompts } from './hooks/usePrompts';
import { useSettings } from './hooks/useSettings';
import { useLLMStatus } from './hooks/useLLMStatus';
// Components
import Header from './components/Header';
import PromptList from './components/PromptList';
import PromptEditor from './components/PromptEditor';
import { WelcomeScreen } from './components/WelcomeScreen';
import SettingsView from './components/SettingsView';
import StatusBar from './components/StatusBar';
import LoggerPanel from './components/LoggerPanel';
import CommandPalette from './components/CommandPalette';
import InfoView from './components/InfoView';
// Types
import type { Prompt, Command } from './types';
// Context
import { IconProvider } from './contexts/IconContext';
// Services & Constants
import { storageService } from './services/storageService';
import { LOCAL_STORAGE_KEYS } from './constants';

const DEFAULT_SIDEBAR_WIDTH = 288; // Corresponds to w-72
const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 500;

const App: React.FC = () => {
    // State Hooks
    const { settings, saveSettings, loaded: settingsLoaded } = useSettings();
    const { prompts, addPrompt, updatePrompt, deletePrompt } = usePrompts();
    const [activePromptId, setActivePromptId] = useState<string | null>(null);

    // UI State
    const [view, setView] = useState<'editor' | 'info' | 'settings'>('editor');
    const [isLoggerVisible, setIsLoggerVisible] = useState(false);
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
    const isResizing = useRef(false);

    const llmStatus = useLLMStatus(settings.llmProviderUrl);

    // Load sidebar width from storage on initial render
    useEffect(() => {
        storageService.load(LOCAL_STORAGE_KEYS.SIDEBAR_WIDTH, DEFAULT_SIDEBAR_WIDTH).then(width => {
            if (typeof width === 'number') {
                setSidebarWidth(width);
            }
        });
    }, []);

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
    
    const handleRenamePrompt = (id: string, title: string) => {
        updatePrompt(id, { title });
    };

    const handleDeletePrompt = useCallback((id: string) => {
        const newPrompts = deletePrompt(id);
        if (activePromptId === id) {
            setActivePromptId(newPrompts.length > 0 ? newPrompts[0].id : null);
        }
    }, [deletePrompt, activePromptId]);

    const toggleSettingsView = () => {
        setView(v => v === 'settings' ? 'editor' : 'settings')
    }

    // --- Resizable Panel Logic ---
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        isResizing.current = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }, []);

    const handleMouseUp = useCallback(() => {
        if (isResizing.current) {
            isResizing.current = false;
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
            storageService.save(LOCAL_STORAGE_KEYS.SIDEBAR_WIDTH, sidebarWidth);
        }
    }, [sidebarWidth]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isResizing.current) {
          return;
        }
        const newWidth = e.clientX;
        if (newWidth >= MIN_SIDEBAR_WIDTH && newWidth <= MAX_SIDEBAR_WIDTH) {
          setSidebarWidth(newWidth);
        }
    }, []);
    
    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);
    // --- End Resizable Panel Logic ---


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
        { id: 'toggle-settings', name: 'Toggle Settings View', keywords: 'configure options', action: toggleSettingsView },
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
                    onToggleSettingsView={toggleSettingsView}
                    isSettingsViewActive={view === 'settings'}
                    onToggleInfoView={() => setView(v => v === 'info' ? 'editor' : 'info')}
                    isInfoViewActive={view === 'info'}
                    onToggleLogger={() => setIsLoggerVisible(v => !v)}
                    onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
                />
                <main className="flex-1 flex overflow-hidden">
                    <aside 
                        style={{ width: `${sidebarWidth}px` }} 
                        className="bg-secondary border-r border-border-color overflow-y-auto flex-shrink-0"
                    >
                        <PromptList 
                            prompts={prompts}
                            activePromptId={activePromptId}
                            onSelectPrompt={handleSelectPrompt}
                            onDeletePrompt={handleDeletePrompt}
                            onRenamePrompt={handleRenamePrompt}
                        />
                    </aside>
                    <div 
                        onMouseDown={handleMouseDown}
                        className="w-1.5 cursor-col-resize flex-shrink-0 bg-border-color/50 hover:bg-primary transition-colors duration-200"
                    />
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
                        {view === 'settings' && <SettingsView settings={settings} onSave={saveSettings} />}
                    </section>
                </main>
                <StatusBar 
                    status={llmStatus}
                    modelName={settings.llmModelName}
                    promptCount={prompts.length}
                    lastSaved={activePrompt?.updatedAt}
                />
            </div>
            
            <LoggerPanel isVisible={isLoggerVisible} onToggleVisibility={() => setIsLoggerVisible(v => !v)} />
            <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} commands={commands} />
        </IconProvider>
    );
};

export default App;