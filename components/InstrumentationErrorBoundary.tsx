import React from 'react';
import { useInstrumentation } from '../instrumentation';
import type { InstrumentationApi } from '../instrumentation';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

interface InstrumentedProps extends Props {
    instrumentation: InstrumentationApi;
}

export class InstrumentationErrorBoundary extends React.Component<InstrumentedProps, State> {

    constructor(props: InstrumentedProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        const { instrumentation } = this.props;
        instrumentation.logger.error('Unhandled error boundary exception', { error: error.message, stack: errorInfo.componentStack });
    }

    render(): React.ReactNode {
        if (this.state.hasError) {
            return (
                <div role="alert" data-testid="instrumentation-error-boundary">
                    <h1>Something went wrong.</h1>
                    <p>The application encountered an unexpected issue. Please check the logs for more details.</p>
                </div>
            );
        }
        return this.props.children;
    }
}

export const InstrumentationErrorBoundaryWithHook: React.FC<Props> = ({ children }) => {
    const instrumentation = useInstrumentation();
    return <InstrumentationErrorBoundary instrumentation={instrumentation}>{children}</InstrumentationErrorBoundary>;
};

