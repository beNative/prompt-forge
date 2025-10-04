import { MetricSample, MetricsCollector } from './types';

type Listener = (sample: MetricSample) => void;

export class ClientMetricsCollector implements MetricsCollector {
    private listeners = new Set<Listener>();

    record(sample: MetricSample) {
        this.listeners.forEach(listener => listener(sample));
    }

    startTimer(name: string, tags?: Record<string, string>): () => void {
        const start = performance.now();
        return () => {
            const end = performance.now();
            this.record({
                name,
                value: end - start,
                unit: 'ms',
                tags,
                timestamp: Date.now()
            });
        };
    }

    attachListener(listener: Listener): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
}

export const setupPerformanceObserver = (collector: MetricsCollector): void => {
    if (typeof PerformanceObserver === 'undefined') return;
    const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
            collector.record({
                name: entry.name || entry.entryType,
                value: entry.duration,
                unit: 'ms',
                tags: { entryType: entry.entryType },
                timestamp: Date.now()
            });
        });
    });

    try {
        observer.observe({ entryTypes: ['measure', 'mark', 'longtask'] });
    } catch (error) {
        console.warn('[instrumentation] Unable to initialise PerformanceObserver', error);
    }
};

