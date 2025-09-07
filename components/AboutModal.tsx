import React from 'react';
import Modal from './Modal';
import { FileIcon } from './Icons';
import Button from './Button';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  version: string;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, version }) => {
  if (!isOpen) return null;

  return (
    <Modal onClose={onClose} title="About PromptForge">
      <div className="p-6 text-center">
        <FileIcon className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-text-main">PromptForge</h2>
        {version && <p className="text-sm text-text-secondary mb-4">Version {version}</p>}
        
        <div className="my-6 text-base text-text-main space-y-1">
          <p>Design and concept by Tim Sinaeve</p>
          <p>Implementation by Gemini Pro 2.5</p>
        </div>

        <p className="text-xs text-text-secondary mt-8">© 2025 Tim Sinaeve. All rights reserved.</p>

        <div className="mt-6">
            <Button onClick={onClose} variant="primary">Close</Button>
        </div>
      </div>
    </Modal>
  );
};

export default AboutModal;