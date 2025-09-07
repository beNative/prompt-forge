
import React from 'react';
import Modal from './Modal';
import { FileIcon } from './Icons';
import Button from './Button';

interface AboutModalProps {
  onClose: () => void;
  version: string;
}

const isElectron = !!window.electronAPI;

const AboutModal: React.FC<AboutModalProps> = ({ onClose, version }) => {
    const handleLinkClick = (url: string) => {
        if (isElectron) {
            window.electronAPI?.openExternalLink(url);
        } else {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };
    
  return (
    <Modal onClose={onClose} title="About PromptForge">
      <div className="p-6 text-text-main text-center">
        <FileIcon className="w-20 h-20 text-primary mx-auto mb-4" />
        <h3 className="text-2xl font-bold">PromptForge</h3>
        <p className="text-sm text-text-secondary mt-1">Version {version}</p>
        <p className="mt-4 max-w-md mx-auto">
          A modern, open-source tool for crafting, managing, and refining your prompts for large language models.
        </p>

        <div className="mt-6 flex justify-center gap-4">
            <Button variant="secondary" onClick={() => handleLinkClick('https://github.com/your-repo/promptforge')}>
                View on GitHub
            </Button>
             <Button variant="secondary" onClick={() => handleLinkClick('https://github.com/your-repo/promptforge/issues')}>
                Report an Issue
            </Button>
        </div>
        
        <footer className="text-xs text-text-secondary mt-8">
            © 2025 Tim Sinaeve. Released under the MIT License.
        </footer>
      </div>
    </Modal>
  );
};

export default AboutModal;
