
import React, { useState, useEffect, useCallback } from 'react';
import { useSettings } from '../hooks/useSettings';
import Modal from './Modal';
import type { Settings, DiscoveredLLMService, DiscoveredLLMModel } from '../types';
import { llmDiscoveryService } from '../services/llmDiscoveryService';
import { SparklesIcon } from './Icons';
import Spinner from './Spinner';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { settings, saveSettings } = useSettings();
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

  const handleSave = () => {
    saveSettings(currentSettings);
    onClose();
  };

  const selectedService = discoveredServices.find(s => s.generateUrl === currentSettings.llmProviderUrl);

  return (
    <Modal onClose={onClose} title="Settings">
      <div className="p-6 space-y-6">
        <div className="flex justify-center">
            <button
                onClick={handleDetectServices}
                disabled={isDetecting}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-secondary-light hover:bg-border-color text-text-main font-semibold disabled:opacity-50"
            >
                {isDetecting ? <Spinner /> : <SparklesIcon className="w-5 h-5 text-primary" />}
                {isDetecting ? 'Detecting Services...' : 'Re-Detect Services'}
            </button>
        </div>

        {detectionError && <p className="text-center text-sm text-red-400">{detectionError}</p>}
        
        <div>
          <label htmlFor="llmService" className="block text-sm font-medium text-text-secondary mb-1">
            Detected Service
          </label>
          <select
            id="llmService"
            value={selectedService?.id || ''}
            onChange={(e) => handleServiceChange(e.target.value)}
            disabled={discoveredServices.length === 0}
            className="w-full p-2 rounded-md bg-secondary text-text-main border border-border-color focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
          >
            <option value="" disabled>{discoveredServices.length > 0 ? 'Select a service' : 'No services detected'}</option>
            {discoveredServices.map(service => (
              <option key={service.id} value={service.id}>{service.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="llmModelName" className="block text-sm font-medium text-text-secondary mb-1">
            Model Name
          </label>
          <div className="relative">
            <select
              id="llmModelName"
              value={currentSettings.llmModelName}
              onChange={(e) => handleModelChange(e.target.value)}
              disabled={!selectedService || availableModels.length === 0}
              className="w-full p-2 rounded-md bg-secondary text-text-main border border-border-color focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 appearance-none pr-8"
            >
              <option value="" disabled>{!selectedService ? 'Select a service first' : 'Select a model'}</option>
              {availableModels.map(model => (
                <option key={model.id} value={model.id}>{model.name}</option>
              ))}
            </select>
            {isFetchingModels && <div className="absolute right-2 top-1/2 -translate-y-1/2"><Spinner /></div>}
          </div>
        </div>
        
        <div className="pt-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-secondary-light hover:bg-border-color text-text-main font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!currentSettings.llmProviderUrl || !currentSettings.llmModelName}
            className="px-4 py-2 rounded-md bg-primary hover:bg-primary-hover text-white font-semibold disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
