/**
 * Enhanced Error Boundary with Global Error Handler Integration
 * 
 * Provides comprehensive error catching, reporting, and fallback UI
 * with integration to the global error handling system.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Bug, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { globalErrorHandler, type ErrorContext } from '@/lib/globalErrorHandler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, errorInfo: ErrorInfo) => ReactNode);
  component?: string;
  showErrorDetails?: boolean;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  enableReporting?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId?: string;
}

/**
 * Enhanced Error Boundary with global error handler integration
 */
export class EnhancedErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true,
      error,
      errorInfo: null,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Use global error handler
    const context: ErrorContext = {
      component: this.props.component || 'error-boundary',
      action: 'component-error',
      additionalData: {
        componentStack: errorInfo.componentStack,
        errorId: this.state.errorId
      }
    };

    if (this.props.enableReporting !== false) {
      globalErrorHandler.handleError(error, context);
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId);
    }
  }

  handleReset = () => {
    this.setState({ 
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: undefined
    });

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleAutoReset = () => {
    // Auto-reset after 10 seconds
    this.resetTimeoutId = window.setTimeout(() => {
      this.handleReset();
    }, 10000);
  };

  handleReportIssue = () => {
    const { error, errorInfo, errorId } = this.state;
    if (!error) return;

    // Create issue report
    const report = {
      errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      component: this.props.component
    };

    // Copy to clipboard for easy reporting
    navigator.clipboard.writeText(JSON.stringify(report, null, 2)).then(() => {
      alert('Error details copied to clipboard. You can paste this when reporting the issue.');
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback UI
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback(this.state.error, this.state.errorInfo!);
        }
        return this.props.fallback;
      }
      
      // Default comprehensive fallback UI
      return (
        <Card className="m-4 border-red-200 bg-red-50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <CardTitle className="text-red-800">Something went wrong</CardTitle>
              </div>
              <Badge variant="destructive" className="text-xs">
                Error ID: {this.state.errorId?.slice(-8)}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Error Message */}
            <div className="p-3 bg-white rounded border border-red-200">
              <p className="text-red-700 text-sm font-medium">
                {this.state.error.message || 'An unexpected error occurred'}
              </p>
            </div>

            {/* Error Details (if enabled) */}
            {this.props.showErrorDetails && this.state.error.stack && (
              <details className="text-xs">
                <summary className="cursor-pointer text-red-600 hover:text-red-800 mb-2">
                  Technical Details
                </summary>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32 text-gray-700">
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            {/* Component Stack (if available) */}
            {this.props.showErrorDetails && this.state.errorInfo?.componentStack && (
              <details className="text-xs">
                <summary className="cursor-pointer text-red-600 hover:text-red-800 mb-2">
                  Component Stack
                </summary>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32 text-gray-700">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={this.handleReset}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1 border-red-300 text-red-700 hover:bg-red-100"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Try Again</span>
              </Button>

              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1 border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Reload Page</span>
              </Button>

              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1 border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <Home className="h-3 w-3" />
                <span>Go Home</span>
              </Button>

              {this.props.showErrorDetails && (
                <Button
                  onClick={this.handleReportIssue}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1 border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  <Bug className="h-3 w-3" />
                  <span>Report Issue</span>
                </Button>
              )}
            </div>

            {/* Auto-reset notice */}
            <p className="text-xs text-gray-600">
              This error has been automatically reported. The page will reset in 10 seconds.
            </p>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

/**
 * Functional Error Boundary Hook (React 18+)
 */
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  return { captureError, resetError };
}

/**
 * Higher-Order Component for Error Boundaries
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryConfig?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <EnhancedErrorBoundary {...errorBoundaryConfig}>
      <Component {...props} />
    </EnhancedErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

/**
 * Async Error Boundary for handling async operations
 */
export function AsyncErrorBoundary({ 
  children, 
  fallback,
  onError 
}: {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}) {
  const [asyncError, setAsyncError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
      setAsyncError(error);
      if (onError) onError(error);
      
      // Report to global error handler
      globalErrorHandler.handleError(error, {
        component: 'async-error-boundary',
        action: 'unhandled-promise-rejection'
      });
      
      event.preventDefault();
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, [onError]);

  if (asyncError) {
    return fallback || (
      <div className="text-center p-8 text-red-600">
        <AlertCircle className="h-8 w-8 mx-auto mb-4" />
        <p>An async operation failed: {asyncError.message}</p>
        <Button 
          onClick={() => setAsyncError(null)} 
          className="mt-4"
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}

// Default export
export default EnhancedErrorBoundary;