import type { ReactNode } from 'react';

export type LogLevel = 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface InstrumentationConfig {
    readonly environment: 'development' | 'test' | 'staging' | 'production';
    readonly enableConsoleLog: boolean;
    readonly enablePerformanceMetrics: boolean;
    readonly enableUiAutomationBridge: boolean;
    readonly enableTraceCollection: boolean;
    readonly defaultTimeoutMs: number;
    readonly metadata: Record<string, string>;
}

export interface InstrumentationLogger {
    readonly level: LogLevel;
    trace(message: string, context?: Record<string, unknown>): void;
    debug(message: string, context?: Record<string, unknown>): void;
    info(message: string, context?: Record<string, unknown>): void;
    warn(message: string, context?: Record<string, unknown>): void;
    error(message: string, context?: Record<string, unknown>): void;
    attachListener(listener: (entry: LogEntry) => void): () => void;
}

export interface LogEntry {
    readonly timestamp: number;
    readonly level: LogLevel;
    readonly message: string;
    readonly context?: Record<string, unknown>;
}

export interface MetricSample {
    readonly name: string;
    readonly value: number;
    readonly unit: 'ms' | 'count' | 'bytes';
    readonly tags?: Record<string, string>;
    readonly timestamp: number;
}

export interface MetricsCollector {
    record(sample: MetricSample): void;
    startTimer(name: string, tags?: Record<string, string>): () => void;
    attachListener(listener: (sample: MetricSample) => void): () => void;
}

export interface TestHookRegistration {
    readonly id: string;
    readonly description: string;
    readonly invoke: (payload?: unknown) => Promise<unknown>;
}

export interface TestHarness {
    registerHook(hook: TestHookRegistration): () => void;
    invokeHook(id: string, payload?: unknown): Promise<unknown>;
    listHooks(): TestHookRegistration[];
}

export interface AutomationActionResult {
    readonly status: 'success' | 'error';
    readonly message?: string;
    readonly data?: unknown;
}

export interface UiAutomationBridge {
    expose(name: string, handler: (payload: unknown) => Promise<AutomationActionResult> | AutomationActionResult): () => void;
    invoke(name: string, payload?: unknown): Promise<AutomationActionResult>;
    list(): string[];
    registerRegion(id: string, element: HTMLElement): () => void;
}

export interface InstrumentationApi {
    readonly config: InstrumentationConfig;
    readonly logger: InstrumentationLogger;
    readonly metrics: MetricsCollector;
    readonly harness: TestHarness;
    readonly automation: UiAutomationBridge;
    readonly ErrorBoundaryFallback?: ReactNode;
}

