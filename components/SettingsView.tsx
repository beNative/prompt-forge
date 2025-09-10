import React, { useState, useEffect } from 'react';
import type { Settings, DiscoveredLLMService, DiscoveredLLMModel } from '../types';
import { llmDiscoveryService } from '../services/llmDiscoveryService';
import { SparklesIcon } from './Icons';
import * as HeroIcons from './iconsets/Heroicons';
import * as LucideIcons from './iconsets/Lucide';
import Spinner from './Spinner';
import Button from './Button';
import JsonEditor from './JsonEditor';
import { storageService } from '../services/storageService';

interface SettingsViewProps {
  settings: Settings;
  onSave: (settings: Settings) => void;
  discoveredServices: DiscoveredLLMService[];
  onDetectServices: () => void;
  isDetecting: boolean;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSave, discoveredServices, onDetectServices, isDetecting }) => {
  const [currentSettings, setCurrentSettings] = useState<Settings>(settings);
  const [isDirty, setIsDirty] = useState(false);
  const [availableModels, setAvailableModels] = useState<DiscoveredLLMModel[]>([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [detectionError, setDetectionError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [jsonString, setJsonString] = useState(() => JSON.stringify(currentSettings, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);


  useEffect(() => {
    setIsDirty(JSON.stringify(settings) !== JSON.stringify(currentSettings));
  }, [settings, currentSettings]);
  
  // Effect to sync jsonString when currentSettings changes from UI
  useEffect(() => {
    if(!showAdvanced) return; // Only update if visible to avoid overwriting user edits
    setJsonString(JSON.stringify(currentSettings, null, 2));
    setJsonError(null);
  }, [currentSettings, showAdvanced]);

  const handleJsonChange = (newJson: string) => {
    setJsonString(newJson);
    try {
        const parsedSettings = JSON.parse(newJson);
        // Basic validation: check if it's an object
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
        await storageService.exportSettings(JSON.stringify(currentSettings, null, 2));
    } catch (e) {
        console.error(e);
        alert('Failed to export settings.');
    }
  };

  const handleImport = async () => {
    try {
        const fileContent = await storageService.importSettings();
        if (fileContent) {
            // This will trigger validation and update state via handleJsonChange
            handleJsonChange(fileContent);
        }
    } catch (e) {
        console.error(e);
        alert(`Failed to import settings: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  };

  // Re-scan for services when the settings view is opened for fresh data.
  useEffect(() => {
    onDetectServices();
  }, [onDetectServices]);
  
  // Effect to manage detection error message based on props
  useEffect(() => {
    if (!isDetecting && discoveredServices.length === 0) {
       setDetectionError('No local LLM services found. Ensure Ollama or a compatible service is running.');
    } else {
       setDetectionError(null);
    }
  }, [isDetecting, discoveredServices]);

  // Effect to pre-populate models if a service is already selected
  useEffect(() => {
    const preSelectService = async () => {
        const savedService = discoveredServices.find(s => s.generateUrl === currentSettings.llmProviderUrl);
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
  }, [discoveredServices, currentSettings.llmProviderUrl, availableModels.length]);


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
      // Pre-select model if it matches the saved one
      if (models.some(m => m.id === settings.llmModelName)) {
        setCurrentSettings(prev => ({ ...prev, llmModelName: settings.llmModelName }));
      }
    } catch (error) {
      console.error("Failed to fetch models:", error);
    } finally {
      setIsFetchingModels(false);
    }
  };

  const handleModelChange = (modelId: string) => {
    setCurrentSettings(prev => ({ ...prev, llmModelName: modelId }));
  };
  
  const handleIconSetChange = (iconSet: 'heroicons' | 'lucide') => {
    setCurrentSettings(prev => ({ ...prev, iconSet }));
  };
  
  const handleSave = () => {
    onSave(currentSettings);
  };

  const selectedService = discoveredServices.find(s => s.generateUrl === currentSettings.llmProviderUrl);

  const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-xl font-semibold text-text-main mb-4">{children}</h3>
  );

  const Label: React.FC<{ htmlFor?: string; children: React.ReactNode }> = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-text-secondary mb-1">
      {children}
    </label>
  );

  const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
     <select {...props} className={`w-full p-2 rounded-md bg-background text-text-main border border-border-color focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 ${props.className}`} />
  );
  
  const CardButton: React.FC<{name: string, description?: string, value: any, children: React.ReactNode, onClick: (value: any) => void, isSelected: boolean, isDisabled?: boolean, isAppIcon?: boolean}> = ({ name, description, value, children, onClick, isSelected, isDisabled = false, isAppIcon = false }) => (
    <button
      onClick={() => !isDisabled && onClick(value)}
      disabled={isDisabled}
      className={`p-4 rounded-lg border-2 text-left transition-all w-full ${
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border-color bg-secondary hover:border-border-color-hover hover:bg-border-color/20'
      } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-text-main">{name}</h4>
        {isDisabled && <span className="text-xs bg-border-color text-text-secondary px-2 py-0.5 rounded-full">Coming Soon</span>}
      </div>
      {description && <p className="text-xs text-text-secondary mb-3">{description}</p>}
      <div className={`flex items-center justify-around text-text-secondary ${isAppIcon ? 'py-4' : ''}`}>
        {children}
      </div>
    </button>
  );

  return (
    <div className="flex-1 flex flex-col p-6 bg-background overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-text-main">Settings</h1>
        <Button
            onClick={handleSave}
            disabled={!isDirty || !!jsonError || !currentSettings.llmProviderUrl || !currentSettings.llmModelName}
            variant="primary"
          >
            {isDirty ? 'Save Changes' : 'Saved'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <SectionTitle>LLM Provider</SectionTitle>
            <div className="p-6 bg-secondary rounded-lg border border-border-color space-y-4">
              <div className="flex justify-center my-4">
                  <Button
                      onClick={onDetectServices}
                      disabled={isDetecting}
                      variant="secondary"
                      isLoading={isDetecting}
                  >
                      {!isDetecting && <SparklesIcon className="w-5 h-5 mr-2" />}
                      {isDetecting ? 'Detecting...' : 'Re-Detect Services'}
                  </Button>
              </div>

              {detectionError && <p className="text-center text-sm text-destructive-text mt-2">{detectionError}</p>}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="llmService">Detected Service</Label>
                  <Select
                    id="llmService"
                    value={selectedService?.id || ''}
                    onChange={(e) => handleServiceChange(e.target.value)}
                    disabled={discoveredServices.length === 0}
                  >
                    <option value="" disabled>{discoveredServices.length > 0 ? 'Select a service' : 'No services detected'}</option>
                    {discoveredServices.map(service => (
                      <option key={service.id} value={service.id}>{service.name}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="llmModelName">Model Name</Label>
                  <div className="relative">
                    <Select
                      id="llmModelName"
                      value={currentSettings.llmModelName}
                      onChange={(e) => handleModelChange(e.target.value)}
                      disabled={!selectedService || availableModels.length === 0}
                      className="appearance-none pr-8"
                    >
                      <option value="" disabled>{!selectedService ? 'Select a service first' : 'Select a model'}</option>
                      {availableModels.map(model => (
                        <option key={model.id} value={model.id}>{model.name}</option>
                      ))}
                    </Select>
                    {isFetchingModels && <div className="absolute right-3 top-1/2 -translate-y-1/2"><Spinner /></div>}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <SectionTitle>Advanced</SectionTitle>
            <div className="p-6 bg-secondary rounded-lg border border-border-color space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-medium text-text-main">JSON Editor</h4>
                        <p className="text-sm text-text-secondary">Directly view and edit the settings file.</p>
                    </div>
                    <Button variant="secondary" onClick={() => setShowAdvanced(s => !s)}>
                        {showAdvanced ? 'Hide Editor' : 'Show Editor'}
                    </Button>
                </div>
                {showAdvanced && (
                    <div className="pt-4 space-y-4">
                        <JsonEditor value={jsonString} onChange={handleJsonChange} />
                        {jsonError && <p className="text-sm text-destructive-text p-2 bg-destructive-bg/50 rounded-md">{jsonError}</p>}
                        <div className="flex gap-4">
                            <Button onClick={handleImport} variant="secondary">Import from File...</Button>
                            <Button onClick={handleExport} variant="secondary">Export to File...</Button>
                        </div>
                    </div>
                )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-8">
           <section>
              <SectionTitle>Appearance</SectionTitle>
              <div className="p-6 bg-secondary rounded-lg border border-border-color">
                  <div>
                    <div className="flex items-center justify-between">
                        <div>
                            <label htmlFor="uiScale" className="font-medium text-text-main">Interface Zoom</label>
                            <p className="text-sm text-text-secondary">Adjust the size of the entire interface.</p>
                        </div>
                        <span className="font-semibold text-text-main tabular-nums min-w-[50px] text-right">{currentSettings.uiScale}%</span>
                    </div>
                    <div className="mt-3">
                        <input
                            id="uiScale"
                            type="range"
                            min="50"
                            max="400"
                            step="10"
                            value={currentSettings.uiScale}
                            onChange={(e) => setCurrentSettings(prev => ({ ...prev, uiScale: Number(e.target.value) }))}
                            className="w-full h-2 bg-border-color rounded-lg appearance-none cursor-pointer range-slider"
                        />
                         <div className="flex justify-between text-xs text-text-secondary mt-1">
                            <span>50%</span>
                            <button onClick={() => setCurrentSettings(prev => ({ ...prev, uiScale: 100 }))} className="text-xs text-text-secondary hover:text-primary">
                              Reset
                            </button>
                            <span>400%</span>
                        </div>
                    </div>
                  </div>
                  <div className="h-px bg-border-color my-6"></div>
                  <div>
                    <Label>UI Icon Set</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 mt-2">
                      <CardButton name="Heroicons" description="A classic, solid set." value="heroicons" isSelected={currentSettings.iconSet === 'heroicons'} onClick={handleIconSetChange}>
                          <HeroIcons.PlusIcon className="w-5 h-5" /> <HeroIcons.SparklesIcon className="w-5 h-5" /> <HeroIcons.FolderIcon className="w-5 h-5" />
                      </CardButton>
                      <CardButton name="Lucide" description="A modern, clean set." value="lucide" isSelected={currentSettings.iconSet === 'lucide'} onClick={handleIconSetChange}>
                          <LucideIcons.PlusIcon className="w-5 h-5" /> <LucideIcons.SparklesIcon className="w-5 h-5" /> <LucideIcons.FolderIcon className="w-5 h-5" />
                      </CardButton>
                      <CardButton name="Feather" description="Simply beautiful icons." value="feather" isSelected={false} onClick={() => {}} isDisabled>
                          <LucideIcons.FeatherIconPlaceholder className="w-5 h-5" />
                      </CardButton>
                      <CardButton name="Tabler" description="Pixel-perfect icons." value="tabler" isSelected={false} onClick={() => {}} isDisabled>
                          <LucideIcons.TablerIconPlaceholder className="w-5 h-5" />
                      </CardButton>
                      <CardButton name="Material" description="Google's design icons." value="material" isSelected={false} onClick={() => {}} isDisabled>
                          <LucideIcons.MaterialIconPlaceholder className="w-5 h-5" />
                      </CardButton>
                    </div>
                  </div>
              </div>
          </section>

          <section>
              <SectionTitle>Updates</SectionTitle>
              <div className="p-6 bg-secondary rounded-lg border border-border-color">
                  <div className="flex items-center justify-between">
                      <div>
                          <label htmlFor="allowPrerelease" className="font-medium text-text-main">Receive Pre-releases</label>
                          <p className="text-sm text-text-secondary">Get notified about beta versions.</p>
                      </div>
                      <button
                          id="allowPrerelease"
                          role="switch"
                          aria-checked={currentSettings.allowPrerelease}
                          onClick={() => setCurrentSettings(prev => ({ ...prev, allowPrerelease: !prev.allowPrerelease }))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${currentSettings.allowPrerelease ? 'bg-primary' : 'bg-border-color'}`}
                      >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${currentSettings.allowPrerelease ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                  </div>
              </div>
          </section>
          
           <section>
              <SectionTitle>Logging</SectionTitle>
              <div className="p-6 bg-secondary rounded-lg border border-border-color">
                  <div className="flex items-center justify-between">
                      <div>
                          <label htmlFor="autoSaveLogs" className="font-medium text-text-main">Auto-save Logs</label>
                          <p className="text-sm text-text-secondary">Automatically save logs to a file. (Desktop app only)</p>
                      </div>
                      <button
                          id="autoSaveLogs"
                          role="switch"
                          aria-checked={currentSettings.autoSaveLogs}
                          onClick={() => setCurrentSettings(prev => ({ ...prev, autoSaveLogs: !prev.autoSaveLogs }))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${currentSettings.autoSaveLogs ? 'bg-primary' : 'bg-border-color'}`}
                      >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${currentSettings.autoSaveLogs ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                  </div>
              </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;