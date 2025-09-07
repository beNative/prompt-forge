
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Split from 'react-split';
import { usePrompts } from './hooks/usePrompts';
import { useSettings } from './hooks/useSettings';
import { useLogger } from './hooks/useLogger';
import { useDebounce } from './hooks/useDebounce';
import Header from './components/Header';
import PromptList from './components/PromptList';
import PromptEditor from './components/PromptEditor';
import { WelcomeScreen } from './components/WelcomeScreen';
import SettingsView from './components/SettingsView';
import InfoView from './components/InfoView';
import AboutModal from './components/AboutModal';
import StatusBar from './components/StatusBar';
import LoggerPanel from './components/LoggerPanel';
import CommandPalette from './components/CommandPalette';
import UpdateNotification from './components/UpdateNotification';
import { IconProvider } from './contexts/IconContext';
import { storageService } from './services/storageService';
import { LOCAL_STORAGE_KEYS } from './constants';
import { llmDiscoveryService } from './services/llmDiscoveryService';
import type { DiscoveredLLMService, Command, UpdateStatus, PromptOrFolder } from './types';
import { CommandIcon, FolderPlusIcon, GearIcon, InfoIcon, PlusIcon, TrashIcon } from './components/Icons';

type MainView = 'editor' | 'settings' | 'info';

const isElectron = !!window.electronAPI;

const App: React.FC = () => {
    const { items, addPrompt, addFolder, updateItem, deleteItem, moveItem } = usePrompts();
    const { settings, saveSettings, loaded: settingsLoaded } = useSettings();
    const { addLog } = useLogger();

    const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
    const [mainView, setMainView] = useState<MainView>('editor');
    const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
    
    // Sidebar & Logger Resizing
    const [sidebarWidth, setSidebarWidth] = useState<number>(30);
    const [loggerHeight, setLoggerHeight] = useState<number>(250);
    const [isLoggerVisible, setIsLoggerVisible] = useState(false);
    const debouncedSidebarWidth = useDebounce(sidebarWidth, 500);
    const debouncedLoggerHeight = useDebounce(loggerHeight, 500);

    // LLM Discovery
    const [discoveredServices, setDiscoveredServices] = useState<DiscoveredLLMService[]>([]);
    const [isDetectingServices, setIsDetectingServices] = useState(false);
    
    // Command Palette
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    
    // Updater state (Electron only)
    const [appVersion, setAppVersion] = useState('0.0.0');
    const [updateAvailable, setUpdateAvailable] = useState<string | null>(null);
    
    // Load persisted sizes
    useEffect(() => {
        storageService.load(LOCAL_STORAGE_KEYS.SIDEBAR_WIDTH, 30).then(setSidebarWidth);
        storageService.load(LOCAL_STORAGE_KEYS.LOGGER_PANEL_HEIGHT, 250).then(setLoggerHeight);
    }, []);

    // Save persisted sizes
    useEffect(() => {
        storageService.save(LOCAL_STORAGE_KEYS.SIDEBAR_WIDTH, debouncedSidebarWidth);
    }, [debouncedSidebarWidth]);

    useEffect(() => {
        storageService.save(LOCAL_STORAGE_KEYS.LOGGER_PANEL_HEIGHT, debouncedLoggerHeight);
    }, [debouncedLoggerHeight]);
    
    // App version and updater listeners
    useEffect(() => {
        if (isElectron) {
            window.electronAPI?.getAppVersion().then(setAppVersion);
            const removeUpdateListener = window.electronAPI?.onUpdaterUpdateDownloaded(version => {
                setUpdateAvailable(version);
                addLog('INFO', `Update version ${version} downloaded.`);
            });
            return () => removeUpdateListener?.();
        }
    }, [addLog]);

    const handleDetectServices = useCallback(async () => {
        setIsDetectingServices(true);
        addLog('INFO', 'Starting detection of local LLM services...');
        try {
            const services = await llmDiscoveryService.discoverServices();
            setDiscoveredServices(services);
            addLog('INFO', `Found ${services.length} LLM services.`);
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            addLog('ERROR', `Failed to detect LLM services: ${msg}`);
        } finally {
            setIsDetectingServices(false);
        }
    }, [addLog]);

    const handleSelectNode = (id: string) => {
        setActiveNodeId(id);
        if (mainView !== 'editor') {
            setMainView('editor');
        }
    };

    const handleNewPrompt = useCallback(() => {
        const activeItem = items.find(i => i.id === activeNodeId);
        let parentId: string | null = null;
        if (activeItem) {
            parentId = activeItem.type === 'folder' ? activeItem.id : activeItem.parentId;
        }
        const newPrompt = addPrompt(parentId);
        setActiveNodeId(newPrompt.id);
        setMainView('editor');
    }, [addPrompt, activeNodeId, items]);
    
    const handleNewFolder = useCallback(() => {
        const activeItem = items.find(i => i.id === activeNodeId);
        let parentId: string | null = null;
        if (activeItem) {
            parentId = activeItem.type === 'folder' ? activeItem.id : activeItem.parentId;
        }
        addFolder(parentId);
    }, [addFolder, activeNodeId, items]);
    
    const handleDeleteNode = (id: string) => {
        deleteItem(id);
        if (activeNodeId === id) {
            setActiveNodeId(null);
        }
    };
    
    const handleSavePrompt = useCallback((prompt: PromptOrFolder) => {
        updateItem(prompt.id, prompt);
    }, [updateItem]);

    const handleCopyNodeContent = (id: string) => {
        const item = items.find(i => i.id === id);
        if (item && item.type === 'prompt' && item.content) {
            navigator.clipboard.writeText(item.content);
            addLog('INFO', `Copied content of prompt "${item.title}"`);
        }
    };
    
    const activeItem = useMemo(() => items.find(p => p.id === activeNodeId), [items, activeNodeId]);

    const toggleView = (view: MainView) => {
        setMainView(prev => (prev === view ? 'editor' : view));
        if (view !== 'editor') setActiveNodeId(null);
    };

    const commands: Command[] = useMemo(() => [
        { id: 'new_prompt', title: 'New Prompt', action: handleNewPrompt, section: 'File', icon: <PlusIcon /> },
        { id: 'new_folder', title: 'New Folder', action: handleNewFolder, section: 'File', icon: <FolderPlusIcon /> },
        { id: 'delete_item', title: 'Delete Selected Item', action: () => activeNodeId && handleDeleteNode(activeNodeId), section: 'File', icon: <TrashIcon /> },
        { id: 'toggle_settings', title: 'Toggle Settings', action: () => toggleView('settings'), section: 'View', icon: <GearIcon /> },
        { id: 'toggle_info', title: 'Toggle Info', action: () => toggleView('info'), section: 'View', icon: <InfoIcon /> },
    ], [handleNewPrompt, handleNewFolder, activeNodeId, handleDeleteNode]);


    if (!settingsLoaded) {
        return <div className="w-screen h-screen bg-background" />; // Or a proper loading screen
    }

    const renderMainView = () => {
        switch (mainView) {
            case 'settings':
                return <SettingsView 
                            settings={settings} 
                            onSave={saveSettings}
                            discoveredServices={discoveredServices}
                            onDetectServices={handleDetectServices}
                            isDetecting={isDetectingServices}
                        />;
            case 'info':
                return <InfoView onOpenAboutModal={() => setIsAboutModalOpen(true)} />;
            case 'editor':
            default:
                if (activeItem) {
                    return <PromptEditor key={activeItem.id} prompt={activeItem} onSave={handleSavePrompt} onDelete={handleDeleteNode} settings={settings} />;
                }
                return <WelcomeScreen onNewPrompt={handleNewPrompt} />;
        }
    };
    
    return (
        <IconProvider value={{ iconSet: settings.iconSet }}>
            <div className="flex flex-col h-screen bg-background text-text-main font-sans antialiased">
                <Header 
                    onToggleSettingsView={() => toggleView('settings')}
                    onToggleInfoView={() => toggleView('info')}
                    onToggleLogger={() => setIsLoggerVisible(v => !v)}
                    onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
                    isInfoViewActive={mainView === 'info'}
                    isSettingsViewActive={mainView === 'settings'}
                />

                <main className="flex-1 flex overflow-hidden">
                    <Split
                        sizes={[sidebarWidth, 100 - sidebarWidth]}
                        minSize={250}
                        gutterSize={8}
                        className="flex flex-1"
                        onDrag={sizes => setSidebarWidth(sizes[0])}
                    >
                        <aside className="h-full bg-secondary border-r border-border-color">
                            <PromptList
                                items={items}
                                activeNodeId={activeNodeId}
                                onSelectNode={handleSelectNode}
                                onDeleteNode={handleDeleteNode}
                                onRenameNode={(id, title) => updateItem(id, { title })}
                                onMoveNode={moveItem}
                                onNewPrompt={handleNewPrompt}
                                onNewFolder={handleNewFolder}
                                onCopyNodeContent={handleCopyNodeContent}
                            />
                        </aside>
                        <section className="flex-1 h-full overflow-y-auto">
                            {renderMainView()}
                        </section>
                    </Split>
                </main>
                
                <StatusBar 
                    providerUrl={settings.llmProviderUrl} 
                    providerName={settings.llmProviderName}
                    modelName={settings.llmModelName}
                    appVersion={appVersion}
                />

                {isLoggerVisible && (
                     <LoggerPanel 
                        isVisible={isLoggerVisible}
                        onToggleVisibility={() => setIsLoggerVisible(false)}
                        height={loggerHeight}
                        onResizeStart={(e) => {
                            const startHeight = loggerHeight;
                            const startPosition = e.clientY;
                            const handleMouseMove = (moveEvent: MouseEvent) => {
                                const newHeight = startHeight - (moveEvent.clientY - startPosition);
                                if (newHeight > 100 && newHeight < window.innerHeight - 200) {
                                    setLoggerHeight(newHeight);
                                }
                            };
                            const handleMouseUp = () => {
                                window.removeEventListener('mousemove', handleMouseMove);
                                window.removeEventListener('mouseup', handleMouseUp);
                            };
                            window.addEventListener('mousemove', handleMouseMove);
                            window.addEventListener('mouseup', handleMouseUp);
                        }}
                    />
                )}
                
                {isAboutModalOpen && <AboutModal onClose={() => setIsAboutModalOpen(false)} version={appVersion} />}
                
                <CommandPalette 
                    isOpen={isCommandPaletteOpen}
                    onClose={() => setIsCommandPaletteOpen(false)}
                    commands={commands}
                />
                
                {updateAvailable && (
                    <UpdateNotification 
                        version={updateAvailable} 
                        onInstall={() => window.electronAPI?.updaterInstallUpdate()} 
                        onClose={() => setUpdateAvailable(null)}
                    />
                )}

            </div>
        </IconProvider>
    );
};

export default App;
