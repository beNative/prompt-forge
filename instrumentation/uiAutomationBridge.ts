import { AutomationActionResult, UiAutomationBridge } from './types';

type AutomationHandler = (payload: unknown) => Promise<AutomationActionResult> | AutomationActionResult;

const GLOBAL_AUTOMATION_KEY = '__PROMPT_FORGE_AUTOMATION__';

export class BrowserUiAutomationBridge implements UiAutomationBridge {
    private handlers = new Map<string, AutomationHandler>();
    private regions = new Map<string, HTMLElement>();

    constructor() {
        if (typeof window !== 'undefined') {
            (window as unknown as Record<string, unknown>)[GLOBAL_AUTOMATION_KEY] = this;
        }
    }

    expose(name: string, handler: AutomationHandler): () => void {
        this.handlers.set(name, handler);
        return () => this.handlers.delete(name);
    }

    async invoke(name: string, payload?: unknown): Promise<AutomationActionResult> {
        const handler = this.handlers.get(name);
        if (!handler) {
            return { status: 'error', message: `No automation handler registered for ${name}` };
        }
        try {
            const result = await handler(payload);
            return result;
        } catch (error) {
            return { status: 'error', message: error instanceof Error ? error.message : String(error) };
        }
    }

    list(): string[] {
        return Array.from(this.handlers.keys());
    }

    registerRegion(id: string, element: HTMLElement): () => void {
        this.regions.set(id, element);
        return () => this.regions.delete(id);
    }

    getRegion(id: string): HTMLElement | undefined {
        return this.regions.get(id);
    }
}

class NoopUiAutomationBridge implements UiAutomationBridge {
    expose(): () => void {
        return () => undefined;
    }

    async invoke(): Promise<AutomationActionResult> {
        return { status: 'error', message: 'UI automation bridge disabled by configuration' };
    }

    list(): string[] {
        return [];
    }

    registerRegion(): () => void {
        return () => undefined;
    }
}

export const getAutomationBridge = (): UiAutomationBridge => {
    if (typeof window !== 'undefined') {
        const existing = (window as unknown as Record<string, unknown>)[GLOBAL_AUTOMATION_KEY];
        if (existing && typeof existing === 'object') {
            return existing as UiAutomationBridge;
        }
    }
    return new BrowserUiAutomationBridge();
};

export const createAutomationBridge = (enabled: boolean): UiAutomationBridge => {
    return enabled ? getAutomationBridge() : new NoopUiAutomationBridge();
};

