
import React from 'react';
import { PlusIcon, FileIcon } from './Icons';

interface WelcomeScreenProps {
    onNewPrompt: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNewPrompt }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-text-secondary p-8">
            <FileIcon className="w-24 h-24 text-border-color mb-6" />
            <h2 className="text-2xl font-semibold text-text-main mb-2">Welcome to PromptForge</h2>
            <p className="max-w-md mb-6">
                Create, manage, and refine your LLM prompts with ease. Get started by creating your first prompt.
            </p>
            <button
                onClick={onNewPrompt}
                className="flex items-center gap-2 px-5 py-3 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold transition-colors duration-200"
            >
                <PlusIcon className="w-5 h-5" />
                Create New Prompt
            </button>
        </div>
    );
};
