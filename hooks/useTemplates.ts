
import { useState, useEffect, useCallback } from 'react';
import type { PromptTemplate } from '../types';
import { LOCAL_STORAGE_KEYS, EXAMPLE_TEMPLATES } from '../constants';
import { storageService } from '../services/storageService';
import { useLogger } from './useLogger';

export const useTemplates = () => {
  const { addLog } = useLogger();
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);

  useEffect(() => {
    const initializeTemplates = async () => {
      const isInitialized = await storageService.load<boolean>(LOCAL_STORAGE_KEYS.TEMPLATES_INITIALIZED, false);
      if (!isInitialized) {
        addLog('INFO', 'First run detected. Loading initial set of example prompt templates.');
        const initialTemplates: PromptTemplate[] = EXAMPLE_TEMPLATES.map(t => ({
          ...t,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        setTemplates(initialTemplates);
        await storageService.save(LOCAL_STORAGE_KEYS.TEMPLATES, initialTemplates);
        await storageService.save(LOCAL_STORAGE_KEYS.TEMPLATES_INITIALIZED, true);
      } else {
        const loadedTemplates = await storageService.load<PromptTemplate[]>(LOCAL_STORAGE_KEYS.TEMPLATES, []);
        setTemplates(loadedTemplates);
        addLog('DEBUG', `${loadedTemplates.length} templates loaded from storage.`);
      }
    };
    initializeTemplates();
  }, [addLog]);

  const persistTemplates = useCallback(async (newTemplates: PromptTemplate[]) => {
    setTemplates(newTemplates);
    await storageService.save(LOCAL_STORAGE_KEYS.TEMPLATES, newTemplates);
    addLog('DEBUG', `${newTemplates.length} templates saved to storage.`);
  }, [addLog]);

  const addTemplate = useCallback(() => {
    const newTemplate: PromptTemplate = {
      id: crypto.randomUUID(),
      title: 'Untitled Template',
      content: 'Your template with {{variables}} here.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const newTemplates = [newTemplate, ...templates];
    persistTemplates(newTemplates);
    addLog('INFO', `New template created with ID: ${newTemplate.id}`);
    return newTemplate;
  }, [templates, persistTemplates, addLog]);

  const updateTemplate = useCallback((id: string, updatedTemplate: Partial<Omit<PromptTemplate, 'id'>>) => {
    const newTemplates = templates.map((t) =>
      t.id === id ? { ...t, ...updatedTemplate, updatedAt: new Date().toISOString() } : t
    );
    persistTemplates(newTemplates);
    addLog('DEBUG', `Template updated with ID: ${id}`);
  }, [templates, persistTemplates, addLog]);

  const deleteTemplate = useCallback((id: string) => {
    const newTemplates = templates.filter((t) => t.id !== id);
    persistTemplates(newTemplates);
    addLog('INFO', `Deleted template with ID: ${id}`);
    return newTemplates;
  }, [templates, persistTemplates, addLog]);

  return { templates, addTemplate, updateTemplate, deleteTemplate };
};
