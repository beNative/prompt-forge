import { TestHarness, TestHookRegistration } from './types';

export class InMemoryTestHarness implements TestHarness {
    private hooks = new Map<string, TestHookRegistration>();

    registerHook(hook: TestHookRegistration): () => void {
        if (this.hooks.has(hook.id)) {
            console.warn(`[instrumentation] Overriding test hook ${hook.id}`);
        }
        this.hooks.set(hook.id, hook);
        return () => this.hooks.delete(hook.id);
    }

    async invokeHook(id: string, payload?: unknown): Promise<unknown> {
        const hook = this.hooks.get(id);
        if (!hook) {
            throw new Error(`Test hook not found: ${id}`);
        }
        return hook.invoke(payload);
    }

    listHooks(): TestHookRegistration[] {
        return Array.from(this.hooks.values());
    }
}

