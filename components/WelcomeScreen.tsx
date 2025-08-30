
import React from 'react';
import { PlusIcon, FileIcon } from './Icons';

interface WelcomeScreenProps {
    onNewPrompt: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNewPrompt }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-text-secondary p-8 bg-grid-pattern">
            <div className="p-8 bg-background rounded-2xl shadow-2xl border border-border-color/50">
                <FileIcon className="w-24 h-24 text-primary mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-text-main mb-2">Welcome to PromptForge</h2>
                <p className="max-w-md mb-8">
                    Your creative space for crafting, refining, and managing LLM prompts. Let's get started.
                </p>
                <button
                    onClick={onNewPrompt}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary hover:bg-primary-hover text-primary-text font-semibold transition-all duration-200 shadow-lg shadow-primary/30 transform hover:scale-105"
                >
                    <PlusIcon className="w-5 h-5" />
                    Create New Prompt
                </button>
            </div>
            <style>{`
                .bg-grid-pattern {
                    background-image: linear-gradient(rgba(var(--color-grid-pattern)) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--color-grid-pattern)) 1px, transparent 1px);
                    background-size: 2rem 2rem;
                }
            `}</style>
        </div>
    );
};
