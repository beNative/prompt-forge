
import React, { useState, useEffect } from 'react';
import type { Settings, DiscoveredLLMService, DiscoveredLLMModel } from '../types';
import { llmDiscoveryService } from '../services/llmDiscoveryService';
// FIX: Replaced non-existent 'FileCodeIcon' with 'FileIcon' as it is not exported from './Icons'.
import { SparklesIcon, FileIcon, SunIcon, GearIcon } from './Icons';
import * as HeroIcons from './iconsets/Heroicons';
import * as LucideIcons from './iconsets/Lucide';
import * as FeatherIcons from './iconsets/Feather';
import * as TablerIcons from './iconsets/Tabler';
import * as MaterialIcons from './iconsets/Material';
import Spinner from './Spinner';
import Button from './Button';
import JsonEditor from './JsonEditor';
import { storageService } from '../services/storageService';
import ToggleSwitch from './ToggleSwitch';
import SettingRow from './SettingRow';

interface SettingsViewProps {
  settings: Settings;
  onSave: (settings: Settings) => void;
  discoveredServices: DiscoveredLLMService[];
  onDetectServices: () => void;
  isDetecting: boolean;
}

type SettingsCategory = 'provider' | 'appearance' | 'general' | 'advanced';

const categories: { id: SettingsCategory; label: string; icon: React.FC<{className?: string}> }[] = [
  { id: 'provider', label: 'LLM Provider', icon: SparklesIcon },
  { id: 'appearance', label: 'Appearance', icon: SunIcon },
  { id: 'general', label: 'General', icon: GearIcon },
  // FIX: Replaced non-existent 'FileCodeIcon' with 'FileIcon'. 'FileIcon' is suitable as the advanced settings involve editing a settings file.
  { id: 'advanced', label: 'Advanced', icon: FileIcon },
];

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSave, discoveredServices, onDetectServices, isDetecting }) => {
  const [currentSettings, setCurrentSettings] = useState<Settings>(settings);
  const [isDirty, setIsDirty] = useState(false);
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('provider');
  
  useEffect(() => {
    setIsDirty(JSON.stringify(settings) !== JSON.stringify(currentSettings));
  }, [settings, currentSettings]);

  const handleSave = () => {
    onSave(currentSettings);
  };

  const renderContent = () => {
    switch (activeCategory) {
      case 'provider':
        return <ProviderSettingsPanel {...{ settings: currentSettings, setCurrentSettings, discoveredServices, onDetectServices, isDetecting }} />;
      case 'appearance':
        return <AppearanceSettingsPanel {...{ settings: currentSettings, setCurrentSettings }} />;
      case 'general':
        return <GeneralSettingsPanel {...{ settings: currentSettings, setCurrentSettings }} />;
      case 'advanced':
        return <AdvancedSettingsPanel {...{ settings: currentSettings, setCurrentSettings }} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background h-full">
      <header className="flex justify-between items-center p-6 border-b border-border-color flex-shrink-0">
        <h1 className="text-2xl font-semibold text-text-main">Settings</h1>
        <Button
            onClick={handleSave}
            disabled={!isDirty || !currentSettings.llmProviderUrl || !currentSettings.llmModelName}
            variant="primary"
          >
            {isDirty ? 'Save Changes' : 'Saved'}
        </Button>
      </header>
      <div className="flex-1 flex overflow-hidden">
        <nav className="w-56 p-4 border-r border-border-color bg-secondary/50">
          <ul className="space-y-1">
            {categories.map(({ id, label, icon: Icon }) => (
              <li key={id}>
                <button
                  onClick={() => setActiveCategory(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeCategory === id
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-secondary hover:bg-border-color/50 hover:text-text-main'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <main className="flex-1 p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};


// --- SETTINGS PANELS ---

interface PanelProps {
    settings: Settings;
    setCurrentSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

const ProviderSettingsPanel: React.FC<PanelProps & { discoveredServices: DiscoveredLLMService[], onDetectServices: () => void, isDetecting: boolean }> = ({ settings, setCurrentSettings, discoveredServices, onDetectServices, isDetecting }) => {
    const [availableModels, setAvailableModels] = useState<DiscoveredLLMModel[]>([]);
    const [isFetchingModels, setIsFetchingModels] = useState(false);
    const [detectionError, setDetectionError] = useState<string | null>(null);

    useEffect(() => {
        onDetectServices();
    }, [onDetectServices]);
    
    useEffect(() => {
        if (!isDetecting && discoveredServices.length === 0) {
           setDetectionError('No local LLM services found. Ensure Ollama or a compatible service is running.');
        } else {
           setDetectionError(null);
        }
    }, [isDetecting, discoveredServices]);

    useEffect(() => {
        const preSelectService = async () => {
            const savedService = discoveredServices.find(s => s.generateUrl === settings.llmProviderUrl);
            if (savedService && availableModels.length === 0) {
                setIsFetchingModels(true);
                try {
                    const models = await llmDiscoveryService.fetchModels(savedService);
                    setAvailableModels(models);
                } catch (error) {
                    console.error("Failed to pre-fetch models:", error);
                } finally {
                    setIsFetchingModels(false);
                }
            }
        }
        if (discoveredServices.length > 0) {
            preSelectService();
        }
    }, [discoveredServices, settings.llmProviderUrl, availableModels.length]);


    const handleServiceChange = async (serviceId: string) => {
        const selectedService = discoveredServices.find(s => s.id === serviceId);
        if (!selectedService) return;

        setCurrentSettings(prev => ({ 
            ...prev, 
            llmProviderUrl: selectedService.generateUrl, 
            llmProviderName: selectedService.name,
            apiType: selectedService.apiType, 
            llmModelName: '' 
        }));
        setAvailableModels([]);
        setIsFetchingModels(true);
        try {
          const models = await llmDiscoveryService.fetchModels(selectedService);
          setAvailableModels(models);
        } catch (error) {
          console.error("Failed to fetch models:", error);
        } finally {
          setIsFetchingModels(false);
        }
    };
    
    const selectedService = discoveredServices.find(s => s.generateUrl === settings.llmProviderUrl);

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <section className="p-6 bg-secondary rounded-lg border border-border-color">
                <h2 className="text-xl font-semibold text-text-main mb-4">Connection</h2>
                 <Button onClick={onDetectServices} disabled={isDetecting} variant="secondary" isLoading={isDetecting} className="w-full">
                    {!isDetecting && <SparklesIcon className="w-5 h-5 mr-2" />}
                    {isDetecting ? 'Detecting...' : 'Re-Detect Services'}
                </Button>
                {detectionError && <p className="text-center text-sm text-destructive-text mt-4">{detectionError}</p>}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div>
                        <label htmlFor="llmService" className="block text-sm font-medium text-text-secondary mb-1">Detected Service</label>
                         <select
                            id="llmService"
                            value={selectedService?.id || ''}
                            onChange={(e) => handleServiceChange(e.target.value)}
                            disabled={discoveredServices.length === 0}
                            className="w-full p-2 rounded-md bg-background text-text-main border border-border-color focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
                        >
                            <option value="" disabled>{discoveredServices.length > 0 ? 'Select a service' : 'No services detected'}</option>
                            {discoveredServices.map(service => (
                                <option key={service.id} value={service.id}>{service.name}</option>
                            ))}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="llmModelName" className="block text-sm font-medium text-text-secondary mb-1">Model Name</label>
                        <div className="relative">
                           <select
                                id="llmModelName"
                                value={settings.llmModelName}
                                onChange={(e) => setCurrentSettings(prev => ({ ...prev, llmModelName: e.target.value }))}
                                disabled={!selectedService || availableModels.length === 0}
                                className="w-full p-2 rounded-md bg-background text-text-main border border-border-color focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
                            >
                                <option value="" disabled>{!selectedService ? 'Select a service first' : 'Select a model'}</option>
                                {availableModels.map(model => (
                                <option key={model.id} value={model.id}>{model.name}</option>
                                ))}
                            </select>
                            {isFetchingModels && <div className="absolute right-3 top-1/2 -translate-y-1/2"><Spinner /></div>}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

const AppearanceSettingsPanel: React.FC<PanelProps> = ({ settings, setCurrentSettings }) => {
    const CardButton: React.FC<{name: string, description: string, value: any, children: React.ReactNode, onClick: (value: any) => void, isSelected: boolean}> = ({ name, description, value, children, onClick, isSelected }) => (
        <button
            onClick={() => onClick(value)}
            className={`p-4 rounded-lg border-2 text-left transition-all w-full ${ isSelected ? 'border-primary bg-primary/5' : 'border-border-color bg-secondary hover:border-primary/50' }`}
        >
            <h4 className="font-semibold text-text-main">{name}</h4>
            <p className="text-xs text-text-secondary mb-3">{description}</p>
            <div className="flex items-center justify-around text-text-secondary p-2 bg-background rounded-md">
                {children}
            </div>
        </button>
    );

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <section className="p-6 bg-secondary rounded-lg border border-border-color">
                <h2 className="text-xl font-semibold text-text-main mb-4">Interface Scale</h2>
                 <div className="flex items-center justify-between">
                    <p className="text-sm text-text-secondary">Adjust the size of the entire interface.</p>
                    <span className="font-semibold text-text-main tabular-nums min-w-[50px] text-right">{settings.uiScale}%</span>
                </div>
                <div className="mt-3">
                    <input
                        id="uiScale"
                        type="range"
                        min="50"
                        max="200"
                        step="10"
                        value={settings.uiScale}
                        onChange={(e) => setCurrentSettings(prev => ({ ...prev, uiScale: Number(e.target.value) }))}
                        className="w-full h-2 bg-border-color rounded-lg appearance-none cursor-pointer range-slider"
                    />
                     <div className="flex justify-between text-xs text-text-secondary mt-1">
                        <span>50%</span>
                        <button onClick={() => setCurrentSettings(prev => ({ ...prev, uiScale: 100 }))} className="text-xs text-text-secondary hover:text-primary">
                            Reset
                        </button>
                        <span>200%</span>
                    </div>
                </div>
            </section>

             <section className="p-6 bg-secondary rounded-lg border border-border-color">
                <h2 className="text-xl font-semibold text-text-main mb-4">Icon Set</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <CardButton name="Heroicons" description="A classic, solid set." value="heroicons" isSelected={settings.iconSet === 'heroicons'} onClick={(v) => setCurrentSettings(s => ({...s, iconSet: v}))}>
                        <HeroIcons.PlusIcon className="w-5 h-5" /> <HeroIcons.SparklesIcon className="w-5 h-5" /> <HeroIcons.FolderIcon className="w-5 h-5" />
                    </CardButton>
                    <CardButton name="Lucide" description="A modern, clean set." value="lucide" isSelected={settings.iconSet === 'lucide'} onClick={(v) => setCurrentSettings(s => ({...s, iconSet: v}))}>
                        <LucideIcons.PlusIcon className="w-5 h-5" /> <LucideIcons.SparklesIcon className="w-5 h-5" /> <LucideIcons.FolderIcon className="w-5 h-5" />
                    </CardButton>
                    <CardButton name="Feather" description="Simply beautiful icons." value="feather" isSelected={settings.iconSet === 'feather'} onClick={(v) => setCurrentSettings(s => ({...s, iconSet: v}))}>
                        <FeatherIcons.PlusIcon className="w-5 h-5" /> <FeatherIcons.SparklesIcon className="w-5 h-5" /> <FeatherIcons.FolderIcon className="w-5 h-5" />
                    </CardButton>
                    <CardButton name="Tabler" description="Pixel-perfect icons." value="tabler" isSelected={settings.iconSet === 'tabler'} onClick={(v) => setCurrentSettings(s => ({...s, iconSet: v}))}>
                        <TablerIcons.PlusIcon className="w-5 h-5" /> <TablerIcons.SparklesIcon className="w-5 h-5" /> <TablerIcons.FolderIcon className="w-5 h-5" />
                    </CardButton>
                    <CardButton name="Material" description="Google's design icons." value="material" isSelected={settings.iconSet === 'material'} onClick={(v) => setCurrentSettings(s => ({...s, iconSet: v}))}>
                         <MaterialIcons.PlusIcon className="w-5 h-5" /> <MaterialIcons.SparklesIcon className="w-5 h-5" /> <MaterialIcons.FolderIcon className="w-5 h-5" />
                    </CardButton>
                </div>
            </section>
        </div>
    );
};

const GeneralSettingsPanel: React.FC<PanelProps> = ({ settings, setCurrentSettings }) => {
    return (
         <div className="max-w-2xl mx-auto space-y-8">
            <section className="p-6 bg-secondary rounded-lg border border-border-color divide-y divide-border-color">
                 <SettingRow htmlFor="allowPrerelease" label="Receive Pre-releases" description="Get notified about new beta versions and test features early.">
                    <ToggleSwitch id="allowPrerelease" checked={settings.allowPrerelease} onChange={(val) => setCurrentSettings(s => ({...s, allowPrerelease: val}))} />
                </SettingRow>
                 <SettingRow htmlFor="autoSaveLogs" label="Auto-save Logs" description="Automatically save all logs to a daily file on your computer.">
                    <ToggleSwitch id="autoSaveLogs" checked={settings.autoSaveLogs} onChange={(val) => setCurrentSettings(s => ({...s, autoSaveLogs: val}))} />
                </SettingRow>
            </section>
        </div>
    );
};

const AdvancedSettingsPanel: React.FC<PanelProps> = ({ settings, setCurrentSettings }) => {
    const [jsonString, setJsonString] = useState(() => JSON.stringify(settings, null, 2));
    const [jsonError, setJsonError] = useState<string | null>(null);

    useEffect(() => {
        setJsonString(JSON.stringify(settings, null, 2));
        setJsonError(null);
    }, [settings]);

    const handleJsonChange = (newJson: string) => {
        setJsonString(newJson);
        try {
            const parsedSettings = JSON.parse(newJson);
            if (typeof parsedSettings === 'object' && parsedSettings !== null && !Array.isArray(parsedSettings)) {
                setCurrentSettings(parsedSettings);
                setJsonError(null);
            } else {
                throw new Error('Settings must be a valid JSON object.');
            }
        } catch (e) {
            setJsonError(e instanceof Error ? e.message : 'Invalid JSON format.');
        }
    };

    const handleExport = async () => {
        try {
            await storageService.exportSettings(JSON.stringify(settings, null, 2));
        } catch (e) {
            console.error(e);
            alert('Failed to export settings.');
        }
    };

    const handleImport = async () => {
        try {
            const fileContent = await storageService.importSettings();
            if (fileContent) {
                handleJsonChange(fileContent);
            }
        } catch (e) {
            console.error(e);
            alert(`Failed to import settings: ${e instanceof Error ? e.message : 'Unknown error'}`);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <section className="p-6 bg-secondary rounded-lg border border-border-color space-y-4">
                <h2 className="text-xl font-semibold text-text-main">JSON Configuration</h2>
                <p className="text-sm text-text-secondary">
                    Directly view and edit the settings file. Be careful, as incorrect values may cause issues.
                </p>
                <JsonEditor value={jsonString} onChange={handleJsonChange} />
                {jsonError && <p className="text-sm text-destructive-text p-2 bg-destructive-bg/50 rounded-md">{jsonError}</p>}
                <div className="flex gap-4 pt-2">
                    <Button onClick={handleImport} variant="secondary">Import from File...</Button>
                    <Button onClick={handleExport} variant="secondary">Export to File...</Button>
                </div>
            </section>
        </div>
    );
};


export default SettingsView;
