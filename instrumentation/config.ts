import { InstrumentationConfig } from './types';

const DEFAULT_CONFIG: InstrumentationConfig = {
    environment: 'development',
    enableConsoleLog: true,
    enablePerformanceMetrics: typeof window !== 'undefined' && 'PerformanceObserver' in window,
    enableUiAutomationBridge: true,
    enableTraceCollection: true,
    defaultTimeoutMs: 30_000,
    metadata: {}
};

const CONFIG_GLOBAL_KEY = '__PROMPT_FORGE_CONFIG__';

export const loadInstrumentationConfig = (): InstrumentationConfig => {
    const fromGlobal = typeof window !== 'undefined' ? (window as unknown as Record<string, unknown>)[CONFIG_GLOBAL_KEY] : undefined;
    const fromEnv = typeof process !== 'undefined' ? (process.env?.PROMPT_FORGE_INSTRUMENTATION ?? '{}') : '{}';

    let parsedEnv: Partial<InstrumentationConfig> = {};
    if (typeof fromEnv === 'string') {
        try {
            parsedEnv = JSON.parse(fromEnv);
        } catch (error) {
            console.warn('[instrumentation] Failed to parse PROMPT_FORGE_INSTRUMENTATION env variable', error);
        }
    }

    const merged: InstrumentationConfig = {
        ...DEFAULT_CONFIG,
        ...(typeof fromGlobal === 'object' && fromGlobal ? fromGlobal as Partial<InstrumentationConfig> : {}),
        ...parsedEnv,
        metadata: {
            ...DEFAULT_CONFIG.metadata,
            ...(typeof (fromGlobal as { metadata?: Record<string, string> })?.metadata === 'object' ? (fromGlobal as { metadata?: Record<string, string> }).metadata ?? {} : {}),
            ...parsedEnv.metadata
        }
    };

    return merged;
};

export const setRuntimeConfig = (config: Partial<InstrumentationConfig>) => {
    if (typeof window === 'undefined') return;
    const current = loadInstrumentationConfig();
    const next = { ...current, ...config, metadata: { ...current.metadata, ...config.metadata } };
    (window as unknown as Record<string, unknown>)[CONFIG_GLOBAL_KEY] = next;
};

