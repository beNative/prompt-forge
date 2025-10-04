import React, { createContext, useContext, useMemo } from 'react';
import { loadInstrumentationConfig } from './config';
import { StructuredLogger } from './logger';
import { ClientMetricsCollector, setupPerformanceObserver } from './metrics';
import { InMemoryTestHarness } from './testHarness';
import { createAutomationBridge } from './uiAutomationBridge';
import type { InstrumentationApi } from './types';

const InstrumentationContext = createContext<InstrumentationApi | null>(null);

export const InstrumentationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const value = useMemo<InstrumentationApi>(() => {
        const config = loadInstrumentationConfig();
        const logger = new StructuredLogger(config.environment === 'production' ? 'INFO' : 'DEBUG', config.enableConsoleLog);
        const metrics = new ClientMetricsCollector();
        if (config.enablePerformanceMetrics) {
            setupPerformanceObserver(metrics);
        }
        const harness = new InMemoryTestHarness();
        const automation = createAutomationBridge(config.enableUiAutomationBridge);

        logger.info('Instrumentation initialised', { environment: config.environment });

        return {
            config,
            logger,
            metrics,
            harness,
            automation
        };
    }, []);

    return (
        <InstrumentationContext.Provider value={value}>
            {children}
        </InstrumentationContext.Provider>
    );
};

export const useInstrumentation = (): InstrumentationApi => {
    const ctx = useContext(InstrumentationContext);
    if (!ctx) {
        throw new Error('useInstrumentation must be used inside InstrumentationProvider');
    }
    return ctx;
};

