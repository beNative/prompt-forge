
import React, { useState, useEffect, useCallback } from 'react';
import Modal from './Modal';
import type { Settings, DiscoveredLLMService, DiscoveredLLMModel } from '../types';
import { llmDiscoveryService } from '../services/llmDiscoveryService';
import { SparklesIcon } from './Icons';
import Spinner from './Spinner';
import Button from './Button';

interface SettingsModalProps {
  onClose: () => void;
  settings: Settings;
  onSave: (settings: Settings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, settings, onSave }) => {
  const [currentSettings, setCurrentSettings] = useState<Settings>(settings);

  const [discoveredServices, setDiscoveredServices] = useState<DiscoveredLLMService[]>([]);
  const [availableModels, setAvailableModels] = useState<DiscoveredLLMModel[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [detectionError, setDetectionError] = useState<string | null>(null);

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

  // Automatically detect services when the modal is opened
  useEffect(() => {
    handleDetectServices();
  }, [handleDetectServices]);

  const handleServiceChange = async (serviceId: string) => {
    const selectedService = discoveredServices.find(s => s.id === serviceId);
    if (!selectedService) return;

    setCurrentSettings(prev => ({ ...prev, llmProviderUrl: selectedService.generateUrl, apiType: selectedService.apiType, llmModelName: '' }));
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
    onClose();
  };

  const selectedService = discoveredServices.find(s => s.generateUrl === currentSettings.llmProviderUrl);

  const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-lg font-semibold text-text-main mb-3">{children}</h3>
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
    <Modal onClose={onClose} title="Settings">
      <div className="p-6 space-y-6">
        <div>
            <SectionTitle>Appearance</SectionTitle>
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

        <div className="border-t border-border-color"></div>

        <div>
          <SectionTitle>LLM Provider</SectionTitle>
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
        
        <div className="pt-6 flex justify-end gap-3 border-t border-border-color">
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!currentSettings.llmProviderUrl || !currentSettings.llmModelName}
            variant="primary"
          >
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
