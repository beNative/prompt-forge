
import React, { useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import Modal from './Modal';
import type { Settings } from '../types';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { settings, saveSettings } = useSettings();
  const [currentSettings, setCurrentSettings] = useState<Settings>(settings);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    saveSettings(currentSettings);
    onClose();
  };

  return (
    <Modal onClose={onClose} title="Settings">
      <div className="p-6 space-y-4">
        <div>
          <label htmlFor="llmProviderUrl" className="block text-sm font-medium text-text-secondary mb-1">
            LLM Provider URL
          </label>
          <input
            type="text"
            id="llmProviderUrl"
            name="llmProviderUrl"
            value={currentSettings.llmProviderUrl}
            onChange={handleChange}
            className="w-full p-2 rounded-md bg-secondary text-text-main border border-border-color focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="e.g., http://localhost:11434/api/generate"
          />
           <p className="text-xs text-gray-400 mt-1">The API endpoint for your local LLM (e.g., Ollama, LMStudio).</p>
        </div>
        <div>
          <label htmlFor="llmModelName" className="block text-sm font-medium text-text-secondary mb-1">
            Model Name
          </label>
          <input
            type="text"
            id="llmModelName"
            name="llmModelName"
            value={currentSettings.llmModelName}
            onChange={handleChange}
            className="w-full p-2 rounded-md bg-secondary text-text-main border border-border-color focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="e.g., llama3"
          />
          <p className="text-xs text-gray-400 mt-1">The name of the model to use for AI assistance.</p>
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
            className="px-4 py-2 rounded-md bg-primary hover:bg-primary-hover text-white font-semibold"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
