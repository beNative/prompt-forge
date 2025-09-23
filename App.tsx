

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
// Hooks
import { usePrompts } from './hooks/usePrompts';
import { useTemplates } from './hooks/useTemplates';
import { useSettings } from './hooks/useSettings';
import { useLLMStatus } from './hooks/useLLMStatus';
import { useLogger } from './hooks/useLogger';
// Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import PromptEditor from './components/PromptEditor';
import TemplateEditor from './components/TemplateEditor';
import { WelcomeScreen } from './components/WelcomeScreen';
import SettingsView from './components/SettingsView';
import StatusBar from './components/StatusBar';
import LoggerPanel from './components/LoggerPanel';
import CommandPalette from './components/CommandPalette';
import InfoView from './components/InfoView';
import UpdateNotification from './components/UpdateNotification';
import CreateFromTemplateModal from './components/CreateFromTemplateModal';
import PromptHistoryView from './components/PromptHistoryView';
import { PlusIcon, FolderPlusIcon, TrashIcon, GearIcon, InfoIcon, TerminalIcon, DocumentDuplicateIcon } from './components/Icons';
// Types
import type { PromptOrFolder, Command, LogMessage, DiscoveredLLMModel, DiscoveredLLMService, Settings, PromptTemplate } from './types';
// Context
import { IconProvider } from './contexts/IconContext';
// Services & Constants
import { storageService } from './services/storageService';
import { llmDiscoveryService } from './services/llmDiscoveryService';
import { LOCAL_STORAGE_KEYS } from './constants';

const DEFAULT_SIDEBAR_WIDTH = 288;
const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 500;

const DEFAULT_LOGGER_HEIGHT = 288;
const MIN_LOGGER_HEIGHT = 100;
const MAX_LOGGER_HEIGHT = 600;


const App: React.FC = () => {
    // State Hooks
    const { settings, saveSettings, loaded: settingsLoaded } = useSettings();
    const { items, addPrompt, addFolder, updateItem, deleteItem, moveItem, getDescendantIds } = usePrompts();
    const { templates, addTemplate, updateTemplate, deleteTemplate } = useTemplates();
    
    // Active Item State
    const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
    const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
    const [expandedFolderIds, setExpandedFolderIds] = useState(new Set<string>());

    // UI State
    const [view, setView] = useState<'editor' | 'info' | 'settings'>('editor');
    const [promptView, setPromptView] = useState<'editor' | 'history'>('editor');
    const [isLoggerVisible, setIsLoggerVisible] = useState(false);
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const [isCreateFromTemplateOpen, setCreateFromTemplateOpen] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
    const [loggerPanelHeight, setLoggerPanelHeight] = useState(DEFAULT_LOGGER_HEIGHT);
    const [availableModels, setAvailableModels] = useState<DiscoveredLLMModel[]>([]);
    const [discoveredServices, setDiscoveredServices] = useState<DiscoveredLLMService[]>([]);
    const [isDetecting, setIsDetecting] = useState(false);
    const [appVersion, setAppVersion] = useState('');
    const [updateInfo, setUpdateInfo] = useState<{ ready: boolean; version: string | null }>({ ready: false, version: null });

    const isSidebarResizing = useRef(false);
    const isLoggerResizing = useRef(false);

    const llmStatus = useLLMStatus(settings.llmProviderUrl);
    const { logs, addLog } = useLogger();
    const lastLogRef = useRef<LogMessage | null>(null);

    // Effect to apply UI scaling
    useEffect(() => {
        if (settingsLoaded) {
            (document.documentElement.style as any).zoom = `${settings.uiScale / 100}`;
        }
    }, [settings.uiScale, settingsLoaded]);

    // Derived State
    const activeNode = useMemo(() => {
        return items.find(p => p.id === activeNodeId) || null;
    }, [items, activeNodeId]);

    const activeTemplate = useMemo(() => {
        return templates.find(t => t.id === activeTemplateId) || null;
    }, [templates, activeTemplateId]);

    const activePrompt = useMemo(() => {
        return activeNode?.type === 'prompt' ? activeNode : null;
    }, [activeNode]);

    // Get app version
    useEffect(() => {
        if (window.electronAPI?.getAppVersion) {
            window.electronAPI.getAppVersion().then(setAppVersion);
        }
    }, []);

    // Listen for downloaded updates from the main process
    useEffect(() => {
        if (window.electronAPI?.onUpdateDownloaded) {
            const cleanup = window.electronAPI.onUpdateDownloaded((version) => {
                addLog('INFO', `Update version ${version} is ready to be installed.`);
                setUpdateInfo({ ready: true, version });
            });
            return cleanup; // This will be called on component unmount to remove the listener
        }
    }, [addLog]);


    // Load panel sizes and expanded folders from storage on initial render
    useEffect(() => {
        storageService.load(LOCAL_STORAGE_KEYS.SIDEBAR_WIDTH, DEFAULT_SIDEBAR_WIDTH).then(width => {
            if (typeof width === 'number') setSidebarWidth(width);
        });
        storageService.load(LOCAL_STORAGE_KEYS.LOGGER_PANEL_HEIGHT, DEFAULT_LOGGER_HEIGHT).then(height => {
            if (typeof height === 'number') setLoggerPanelHeight(height);
        });
        storageService.load<string[]>(LOCAL_STORAGE_KEYS.EXPANDED_FOLDERS, []).then(ids => {
            setExpandedFolderIds(new Set(ids));
        });
    }, []);

    // Save expanded IDs to storage whenever they change
    useEffect(() => {
        if (settingsLoaded) { // Assuming settingsLoaded indicates initial state is ready
            storageService.save(LOCAL_STORAGE_KEYS.EXPANDED_FOLDERS, Array.from(expandedFolderIds));
        }
    }, [expandedFolderIds, settingsLoaded]);

    // Select the first item on load or when items change
    useEffect(() => {
        if (items.length > 0 && activeNodeId === null && activeTemplateId === null) {
            setActiveNodeId(items[0].id);
        } else if (items.length === 0 && activeNodeId) {
            setActiveNodeId(null);
        }
    }, [items, activeNodeId, activeTemplateId]);

    // Service Discovery logic
    const handleDetectServices = useCallback(async () => {
        setIsDetecting(true);
        try {
            const services = await llmDiscoveryService.discoverServices();
            setDiscoveredServices(services);
        } catch (error) {
            addLog('ERROR', `Failed to discover services: ${error instanceof Error ? error.message : String(error)}`);
            setDiscoveredServices([]);
        } finally {
            setIsDetecting(false);
        }
    }, [addLog]);

    useEffect(() => {
        handleDetectServices();
    }, [handleDetectServices]);


    // Fetch available models for the status bar dropdown
    useEffect(() => {
        const fetchModels = async () => {
            if (settings.apiType !== 'unknown' && settings.llmProviderUrl) {
                try {
                    // Reconstruct a minimal service object to fetch models
                    const service = {
                        id: '', name: '', // Not needed for fetching
                        apiType: settings.apiType,
                        modelsUrl: settings.apiType === 'ollama' 
                            ? new URL('/api/tags', settings.llmProviderUrl).href 
                            : new URL('/v1/models', settings.llmProviderUrl).href,
                        generateUrl: settings.llmProviderUrl
                    };
                    const models = await llmDiscoveryService.fetchModels(service);
                    setAvailableModels(models);
                } catch (error) {
                    addLog('ERROR', `Failed to fetch models for status bar: ${error instanceof Error ? error.message : String(error)}`);
                    setAvailableModels([]);
                }
            } else {
                setAvailableModels([]);
            }
        };
        if (settingsLoaded) {
            fetchModels();
        }
    }, [settings.llmProviderUrl, settings.apiType, settingsLoaded, addLog]);

    // Effect for auto-saving logs
    useEffect(() => {
        if (settings.autoSaveLogs && logs.length > 0) {
            const latestLog = logs[logs.length - 1];
            // Only save if it's a new log entry
            if (latestLog !== lastLogRef.current) {
                lastLogRef.current = latestLog;
                const logContent = `[${latestLog.timestamp}] [${latestLog.level}] ${latestLog.message}\n`;
                storageService.appendLogToFile(logContent);
            }
        }
    }, [logs, settings.autoSaveLogs]);


    // Handlers
    const getParentIdForNewItem = useCallback(() => {
        if (!activeNode) return null;
        return activeNode.type === 'folder' ? activeNode.id : activeNode.parentId;
    }, [activeNode]);

    const handleNewPrompt = useCallback(() => {
        const parentId = getParentIdForNewItem();
        const newPrompt = addPrompt(parentId);
        setActiveNodeId(newPrompt.id);
        setActiveTemplateId(null);
        setPromptView('editor');
        setView('editor');
    }, [addPrompt, getParentIdForNewItem]);
    
    const handleNewFolder = useCallback(() => {
        const newFolder = addFolder(null); // Always create at root
        setActiveNodeId(newFolder.id);
        setActiveTemplateId(null);
        setPromptView('editor');
        setView('editor');
    }, [addFolder]);

    const handleNewTemplate = useCallback(() => {
        const newTemplate = addTemplate();
        setActiveTemplateId(newTemplate.id);
        setActiveNodeId(null);
        setView('editor');
    }, [addTemplate]);

    const handleCreateFromTemplate = useCallback((title: string, content: string) => {
        const newPrompt = addPrompt(null); // Create at root
        updateItem(newPrompt.id, { title, content });
        setActiveNodeId(newPrompt.id);
        setActiveTemplateId(null);
        setPromptView('editor');
        setView('editor');
    }, [addPrompt, updateItem]);

    const handleSelectNode = (id: string) => {
        if (activeNodeId !== id) {
            setPromptView('editor');
        }
        setActiveNodeId(id);
        setActiveTemplateId(null);
        setView('editor');
    };
    
    const handleSelectTemplate = (id: string) => {
        setActiveTemplateId(id);
        setActiveNodeId(null);
        setView('editor');
    };

    const handleSavePrompt = (updatedPrompt: Partial<Omit<PromptOrFolder, 'id'>>) => {
        if (activeNodeId) {
            updateItem(activeNodeId, updatedPrompt);
        }
    };
    
    const handleSaveTemplate = (updatedTemplate: Partial<Omit<PromptTemplate, 'id'>>) => {
        if (activeTemplateId) {
            updateTemplate(activeTemplateId, updatedTemplate);
        }
    };
    
    const handleRenameNode = (id: string, title: string) => {
        updateItem(id, { title });
    };

    const handleRenameTemplate = (id: string, title: string) => {
        updateTemplate(id, { title });
    };
    
    const handleCopyNodeContent = useCallback(async (nodeId: string) => {
        const item = items.find(p => p.id === nodeId);
        if (item && item.type === 'prompt' && item.content) {
            try {
                await navigator.clipboard.writeText(item.content);
                addLog('INFO', `Content of prompt "${item.title}" copied to clipboard.`);
            } catch (err) {
                addLog('ERROR', `Failed to copy to clipboard: ${err instanceof Error ? err.message : 'Unknown error'}`);
            }
        } else if (item?.type === 'folder') {
            addLog('WARNING', 'Cannot copy content of a folder.');
        } else {
            addLog('WARNING', 'Cannot copy content of an empty prompt.');
        }
    }, [items, addLog]);

    const handleModelChange = (modelId: string) => {
        saveSettings({ ...settings, llmModelName: modelId });
    };
    
    const handleProviderChange = useCallback(async (serviceId: string) => {
        const selectedService = discoveredServices.find(s => s.id === serviceId);
        if (!selectedService) return;

        try {
            const models = await llmDiscoveryService.fetchModels(selectedService);
            const newModelName = models.length > 0 ? models[0].id : '';
            
            saveSettings({
                ...settings,
                llmProviderUrl: selectedService.generateUrl,
                llmProviderName: selectedService.name,
                apiType: selectedService.apiType,
                llmModelName: newModelName,
            });
            addLog('INFO', `Switched LLM provider to ${selectedService.name}.`);
        } catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            addLog('ERROR', `Failed to switch provider: ${message}`);
        }
    }, [discoveredServices, settings, saveSettings, addLog]);

    const handleDeleteNode = useCallback((id: string) => {
        const itemToDelete = items.find(p => p.id === id);
        if (!itemToDelete) return;

        if (itemToDelete.type === 'folder') {
            const descendantCount = getDescendantIds(id).size;
            const message = descendantCount > 0 
                ? `Are you sure you want to delete the folder "${itemToDelete.title}" and its ${descendantCount} contents?`
                : `Are you sure you want to delete the empty folder "${itemToDelete.title}"?`;
            
            if (!window.confirm(message)) {
                return;
            }
        }

        let nextNodeToSelect: PromptOrFolder | null = null;
        const currentItemIndex = items.findIndex(p => p.id === id);

        if (currentItemIndex !== -1) {
            const siblings = items.filter(p => p.parentId === itemToDelete.parentId && p.id !== itemToDelete.id);
            if (siblings.length > 0) {
                const siblingIndex = siblings.findIndex(s => items.indexOf(s) > currentItemIndex);
                nextNodeToSelect = siblings[siblingIndex] || siblings[siblings.length - 1];
            } else if (itemToDelete.parentId) {
                nextNodeToSelect = items.find(p => p.id === itemToDelete.parentId) || null;
            }
        }
        
        const newItems = deleteItem(id);

        if (activeNodeId === id) {
             if (nextNodeToSelect) {
                 setActiveNodeId(nextNodeToSelect.id);
             } else {
                 setActiveNodeId(newItems.length > 0 ? newItems[0].id : null);
             }
        }
    }, [items, deleteItem, activeNodeId, getDescendantIds]);

    const handleDeleteTemplate = useCallback((id: string) => {
        if (!window.confirm("Are you sure you want to delete this template?")) {
            return;
        }
        const newTemplates = deleteTemplate(id);
        if (activeTemplateId === id) {
            setActiveTemplateId(newTemplates.length > 0 ? newTemplates[0].id : null);
        }
    }, [deleteTemplate, activeTemplateId]);

    const handleToggleExpand = (id: string) => {
        setExpandedFolderIds(prev => {
          const newSet = new Set(prev);
          if (newSet.has(id)) {
            newSet.delete(id);
          } else {
            newSet.add(id);
          }
          return newSet;
        });
    };

    const toggleSettingsView = () => {
        setView(v => v === 'settings' ? 'editor' : 'settings')
    }

    const handleRestorePromptVersion = useCallback((promptId: string, content: string) => {
        const prompt = items.find(p => p.id === promptId);
        if (prompt) {
            updateItem(promptId, { content });
            addLog('INFO', `Restored prompt "${prompt.title}" to a previous version.`);
            setPromptView('editor');
        }
    }, [items, updateItem, addLog]);


    // --- Resizable Panels Logic ---
    const handleSidebarMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        isSidebarResizing.current = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }, []);

    const handleLoggerMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        isLoggerResizing.current = true;
        document.body.style.cursor = 'row-resize';
        document.body.style.userSelect = 'none';
    }, []);
    
    const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
        const zoomFactor = settings.uiScale / 100;

        if (isSidebarResizing.current) {
          const newWidth = e.clientX / zoomFactor;
          if (newWidth >= MIN_SIDEBAR_WIDTH && newWidth <= MAX_SIDEBAR_WIDTH) {
            setSidebarWidth(newWidth);
          }
        }
        if (isLoggerResizing.current) {
          const newHeight = (window.innerHeight - e.clientY) / zoomFactor;
          if (newHeight >= MIN_LOGGER_HEIGHT && newHeight <= MAX_LOGGER_HEIGHT) {
            setLoggerPanelHeight(newHeight);
          }
        }
    }, [settings.uiScale]);

    const handleGlobalMouseUp = useCallback(() => {
        if (isSidebarResizing.current) {
            isSidebarResizing.current = false;
            storageService.save(LOCAL_STORAGE_KEYS.SIDEBAR_WIDTH, sidebarWidth);
        }
        if (isLoggerResizing.current) {
            isLoggerResizing.current = false;
            storageService.save(LOCAL_STORAGE_KEYS.LOGGER_PANEL_HEIGHT, loggerPanelHeight);
        }
        
        if (document.body.style.cursor !== 'default') {
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
        }
    }, [sidebarWidth, loggerPanelHeight]);
    
    useEffect(() => {
        window.addEventListener('mousemove', handleGlobalMouseMove);
        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            window.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [handleGlobalMouseMove, handleGlobalMouseUp]);
    // --- End Resizable Panels Logic ---


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
    
    // Command Palette Commands
    const commands: Command[] = useMemo(() => [
        { id: 'new-prompt', name: 'Create New Prompt', action: handleNewPrompt, category: 'File', icon: PlusIcon, shortcut: ['Ctrl', 'N'], keywords: 'add create file' },
        { id: 'new-folder', name: 'Create New Folder', action: handleNewFolder, category: 'File', icon: FolderPlusIcon, keywords: 'add create directory' },
        { id: 'new-template', name: 'Create New Template', action: handleNewTemplate, category: 'File', icon: DocumentDuplicateIcon, keywords: 'add create template' },
        { id: 'new-from-template', name: 'New Prompt from Template...', action: () => setCreateFromTemplateOpen(true), category: 'File', icon: PlusIcon, keywords: 'add create file instance' },
        { id: 'delete-item', name: 'Delete Current Item', action: () => {
            if (activeTemplateId) handleDeleteTemplate(activeTemplateId);
            else if (activeNodeId) handleDeleteNode(activeNodeId);
        }, category: 'File', icon: TrashIcon, keywords: 'remove discard' },
        { id: 'toggle-settings', name: 'Toggle Settings View', action: toggleSettingsView, category: 'View', icon: GearIcon, keywords: 'configure options' },
        { id: 'toggle-info', name: 'Toggle Info View', action: () => setView(v => v === 'info' ? 'editor' : 'info'), category: 'View', icon: InfoIcon, keywords: 'help docs readme' },
        { id: 'toggle-logs', name: 'Toggle Logs Panel', action: () => setIsLoggerVisible(v => !v), category: 'View', icon: TerminalIcon, keywords: 'debug console' },
    ], [activeNodeId, activeTemplateId, handleNewPrompt, handleNewFolder, handleDeleteNode, handleDeleteTemplate, handleNewTemplate, toggleSettingsView]);

    const getSupportedIconSet = (iconSet: Settings['iconSet']): 'heroicons' | 'lucide' | 'feather' | 'tabler' | 'material' => {
        const supportedSets: Array<Settings['iconSet']> = ['heroicons', 'lucide', 'feather', 'tabler', 'material'];
        if (supportedSets.includes(iconSet)) {
            return iconSet;
        }
        return 'heroicons'; // Fallback to a default
    };

    if (!settingsLoaded) {
        return <div className="w-screen h-screen flex items-center justify-center bg-background"><p className="text-text-main">Loading application...</p></div>;
    }

    const renderMainContent = () => {
        if (view === 'info') return <InfoView />;
        if (view === 'settings') return <SettingsView settings={settings} onSave={saveSettings} discoveredServices={discoveredServices} onDetectServices={handleDetectServices} isDetecting={isDetecting} />;
        
        if (activeTemplate) {
            return <TemplateEditor 
                key={activeTemplate.id}
                template={activeTemplate}
                onSave={handleSaveTemplate}
                onDelete={handleDeleteTemplate}
            />
        }
        if (activeNode) {
            if (activeNode.type === 'prompt') {
                if (promptView === 'history') {
                    return (
                        <PromptHistoryView
                            prompt={activeNode}
                            onBackToEditor={() => setPromptView('editor')}
                            onRestore={(content) => handleRestorePromptVersion(activeNode.id, content)}
                        />
                    );
                }
                return (
                    <PromptEditor 
                        key={activeNode.id}
                        prompt={activeNode}
                        onSave={handleSavePrompt}
                        onDelete={handleDeleteNode}
                        settings={settings}
                        onShowHistory={() => setPromptView('history')}
                    />
                );
            }
            return <WelcomeScreen onNewPrompt={handleNewPrompt} />; // Folder selected
        }
        return <WelcomeScreen onNewPrompt={handleNewPrompt} />; // Nothing selected
    };

    return (
        <IconProvider value={{ iconSet: getSupportedIconSet(settings.iconSet) }}>
            <div className="flex flex-col h-full font-sans bg-background text-text-main antialiased">
                <Header 
                    onToggleSettingsView={toggleSettingsView}
                    isSettingsViewActive={view === 'settings'}
                    onToggleInfoView={() => setView(v => v === 'info' ? 'editor' : 'info')}
                    isInfoViewActive={view === 'info'}
                    onToggleLogger={() => setIsLoggerVisible(v => !v)}
                    onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
                />
                <main className="flex-1 flex overflow-hidden">
                    {view === 'editor' && (
                        <>
                             <aside 
                                style={{ width: `${sidebarWidth}px` }} 
                                className="bg-secondary border-r border-border-color flex flex-col flex-shrink-0"
                            >
                                <Sidebar 
                                    prompts={items}
                                    activePromptId={activeNodeId}
                                    onSelectPrompt={handleSelectNode}
                                    onDeletePrompt={handleDeleteNode}
                                    onRenamePrompt={handleRenameNode}
                                    onMovePrompt={moveItem}
                                    onNewPrompt={handleNewPrompt}
                                    onNewFolder={handleNewFolder}
                                    onCopyPromptContent={handleCopyNodeContent}
                                    expandedFolderIds={expandedFolderIds}
                                    onToggleExpand={handleToggleExpand}

                                    templates={templates}
                                    activeTemplateId={activeTemplateId}
                                    onSelectTemplate={handleSelectTemplate}
                                    onDeleteTemplate={handleDeleteTemplate}
                                    onRenameTemplate={handleRenameTemplate}
                                    onNewTemplate={handleNewTemplate}
                                    onNewFromTemplate={() => setCreateFromTemplateOpen(true)}
                                />
                            </aside>
                            <div 
                                onMouseDown={handleSidebarMouseDown}
                                className="w-1.5 cursor-col-resize flex-shrink-0 bg-border-color/50 hover:bg-primary transition-colors duration-200"
                            />
                        </>
                    )}
                    <section className="flex-1 flex flex-col overflow-y-auto bg-background">
                        {renderMainContent()}
                    </section>
                </main>
                <StatusBar 
                    status={llmStatus}
                    modelName={settings.llmModelName}
                    llmProviderName={settings.llmProviderName}
                    llmProviderUrl={settings.llmProviderUrl}
                    promptCount={items.filter(i => i.type === 'prompt').length}
                    lastSaved={activePrompt?.updatedAt}
                    availableModels={availableModels}
                    onModelChange={handleModelChange}
                    discoveredServices={discoveredServices}
                    onProviderChange={handleProviderChange}
                    appVersion={appVersion}
                />
            </div>
            
            <LoggerPanel 
                isVisible={isLoggerVisible} 
                onToggleVisibility={() => setIsLoggerVisible(v => !v)}
                height={loggerPanelHeight}
                onResizeStart={handleLoggerMouseDown}
            />
            <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} commands={commands} />

            {isCreateFromTemplateOpen && (
                <CreateFromTemplateModal
                    templates={templates}
                    onClose={() => setCreateFromTemplateOpen(false)}
                    onCreate={handleCreateFromTemplate}
                />
            )}

            {updateInfo.ready && window.electronAPI?.quitAndInstallUpdate && (
                <UpdateNotification
                    version={updateInfo.version!}
                    onInstall={() => window.electronAPI!.quitAndInstallUpdate!()}
                    onClose={() => setUpdateInfo({ ready: false, version: null })}
                />
            )}
        </IconProvider>
    );
};

export default App;