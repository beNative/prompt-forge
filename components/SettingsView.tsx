



import React, { useState, useEffect } from 'react';
// FIX: Correcting module imports. These will work once `types.ts`, `Icons.tsx`, and iconset files are created.
import type { Settings, DiscoveredLLMService, DiscoveredLLMModel, AppIcon } from '../types';
import { llmDiscoveryService } from '../services/llmDiscoveryService';
import { SparklesIcon, FileIcon as DefaultAppIcon, CommandIcon, GearIcon, FolderIcon } from './Icons';
import * as HeroIcons from './iconsets/Heroicons';
import * as LucideIcons from './iconsets/Lucide';
import Spinner from './Spinner';
import Button from './Button';

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

  useEffect(() => {
    setIsDirty(JSON.stringify(settings) !== JSON.stringify(currentSettings));
  }, [settings, currentSettings]);

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
  
  const handleAppIconChange = (appIcon: AppIcon) => {
    setCurrentSettings(prev => ({ ...prev, appIcon }));
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
            disabled={!isDirty || !currentSettings.llmProviderUrl || !currentSettings.llmModelName}
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
            <SectionTitle>Application Icon</SectionTitle>
              <div className="p-6 bg-secondary rounded-lg border border-border-color">
                  <p className="text-sm text-text-secondary mb-4">Choose the icon for the application. Requires a restart to take full effect on shortcuts and the taskbar.</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      <CardButton name="Default" value="default" isSelected={currentSettings.appIcon === 'default'} onClick={handleAppIconChange} isAppIcon><DefaultAppIcon className="w-8 h-8" /></CardButton>
                      <CardButton name="Sparkles" value="sparkles" isSelected={currentSettings.appIcon === 'sparkles'} onClick={handleAppIconChange} isAppIcon><SparklesIcon className="w-8 h-8" /></CardButton>
                      <CardButton name="Command" value="command" isSelected={currentSettings.appIcon === 'command'} onClick={handleAppIconChange} isAppIcon><CommandIcon className="w-8 h-8" /></CardButton>
                      <CardButton name="Gear" value="gear" isSelected={currentSettings.appIcon === 'gear'} onClick={handleAppIconChange} isAppIcon><GearIcon className="w-8 h-8" /></CardButton>
                      <CardButton name="Folder" value="folder" isSelected={currentSettings.appIcon === 'folder'} onClick={handleAppIconChange} isAppIcon><FolderIcon className="w-8 h-8" /></CardButton>
                  </div>
              </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-8">
           <section>
              <SectionTitle>Appearance</SectionTitle>
              <div className="p-6 bg-secondary rounded-lg border border-border-color space-y-4">
                  <Label>UI Icon Set</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
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