

import React, { useState, useEffect, useCallback } from 'react';
import type { Settings, DiscoveredLLMService, DiscoveredLLMModel } from '../types';
import { llmDiscoveryService } from '../services/llmDiscoveryService';
import { SparklesIcon } from './Icons';
import Spinner from './Spinner';
import Button from './Button';

interface SettingsViewProps {
  settings: Settings;
  onSave: (settings: Settings) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSave }) => {
  const [currentSettings, setCurrentSettings] = useState<Settings>(settings);
  const [isDirty, setIsDirty] = useState(false);

  const [discoveredServices, setDiscoveredServices] = useState<DiscoveredLLMService[]>([]);
  const [availableModels, setAvailableModels] = useState<DiscoveredLLMModel[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [detectionError, setDetectionError] = useState<string | null>(null);

  useEffect(() => {
    setIsDirty(JSON.stringify(settings) !== JSON.stringify(currentSettings));
  }, [settings, currentSettings]);

  const handleDetectServices = useCallback(async () => {
    setIsDetecting(true);
    setDetectionError(null);
    setDiscoveredServices([]);
    setAvailableModels([]);
    try {
      const services = await llmDiscoveryService.discoverServices();
      if (services.length === 0) {
        setDetectionError('No local LLM services found. Ensure Ollama or a compatible service is running.');
      } else {
        setDiscoveredServices(services);
        // If there's a previously saved URL, try to pre-select the service
        const savedService = services.find(s => s.generateUrl === settings.llmProviderUrl);
        if (savedService) {
          handleServiceChange(savedService.id);
        }
      }
    } catch (error) {
      setDetectionError('An error occurred during detection.');
      console.error(error);
    } finally {
      setIsDetecting(false);
    }
  }, [settings.llmProviderUrl]);

  // Automatically detect services when the view is opened
  useEffect(() => {
    handleDetectServices();
  }, [handleDetectServices]);

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

  const Label: React.FC<{ htmlFor: string; children: React.ReactNode }> = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-text-secondary mb-1">
      {children}
    </label>
  );

  const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
     <select {...props} className={`w-full p-2 rounded-md bg-background text-text-main border border-border-color focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 ${props.className}`} />
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

      <div className="space-y-8 max-w-3xl">
        <section>
            <SectionTitle>Appearance</SectionTitle>
            <div className="p-6 bg-secondary rounded-lg border border-border-color">
                <Label htmlFor="iconSet">Icon Set</Label>
                <Select
                    id="iconSet"
                    value={currentSettings.iconSet}
                    onChange={(e) => handleIconSetChange(e.target.value as 'heroicons' | 'lucide')}
                >
                    <option value="heroicons">Heroicons (Classic)</option>
                    <option value="lucide">Lucide (Modern)</option>
                </Select>
            </div>
        </section>

        <section>
          <SectionTitle>LLM Provider</SectionTitle>
          <div className="p-6 bg-secondary rounded-lg border border-border-color space-y-4">
            <div className="flex justify-center my-4">
                <Button
                    onClick={handleDetectServices}
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
            <SectionTitle>Logging</SectionTitle>
            <div className="p-6 bg-secondary rounded-lg border border-border-color">
                <div className="flex items-center justify-between">
                    <div>
                        <label htmlFor="autoSaveLogs" className="font-medium text-text-main">Auto-save Logs</label>
                        <p className="text-sm text-text-secondary">Automatically save all log messages to a file. (Desktop app only)</p>
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
  );
};

export default SettingsView;