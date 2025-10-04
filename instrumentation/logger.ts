import { InstrumentationLogger, LogEntry, LogLevel } from './types';

const LOG_LEVEL_ORDER: LogLevel[] = ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR'];

const shouldLog = (current: LogLevel, desired: LogLevel): boolean => {
    return LOG_LEVEL_ORDER.indexOf(current) <= LOG_LEVEL_ORDER.indexOf(desired);
};

const consoleMethodForLevel: Record<LogLevel, 'debug' | 'info' | 'warn' | 'error' | 'log'> = {
    TRACE: 'debug',
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error'
};

export class StructuredLogger implements InstrumentationLogger {
    private listeners = new Set<(entry: LogEntry) => void>();

    constructor(public readonly level: LogLevel, private readonly enableConsole: boolean) {}

    trace(message: string, context?: Record<string, unknown>) {
        this.log('TRACE', message, context);
    }

    debug(message: string, context?: Record<string, unknown>) {
        this.log('DEBUG', message, context);
    }

    info(message: string, context?: Record<string, unknown>) {
        this.log('INFO', message, context);
    }

    warn(message: string, context?: Record<string, unknown>) {
        this.log('WARN', message, context);
    }

    error(message: string, context?: Record<string, unknown>) {
        this.log('ERROR', message, context);
    }

    attachListener(listener: (entry: LogEntry) => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private log(level: LogLevel, message: string, context?: Record<string, unknown>) {
        if (!shouldLog(this.level, level)) {
            return;
        }

        const entry: LogEntry = {
            timestamp: Date.now(),
            level,
            message,
            context
        };

        if (this.enableConsole && typeof console !== 'undefined') {
            const method = consoleMethodForLevel[level] ?? 'log';
            const formattedContext = context ? JSON.stringify(context) : '';
            (console[method] ?? console.log).call(console, `[instrumentation][${level}] ${message}`, formattedContext);
        }

        this.listeners.forEach(listener => listener(entry));
    }
}

