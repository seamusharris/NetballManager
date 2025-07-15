/**
 * Comprehensive error reporting service
 * Handles error tracking, categorization, and reporting
 */

export interface ErrorReport {
  id: string;
  timestamp: number;
  error: Error;
  context: string;
  userAgent: string;
  url: string;
  componentStack?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'api' | 'ui' | 'network' | 'validation' | 'auth' | 'unknown';
  metadata?: Record<string, any>;
  resolved?: boolean;
}

export interface ErrorReportingConfig {
  enabled: boolean;
  logToConsole: boolean;
  sendToServer: boolean;
  maxErrorsPerMinute: number;
  ignoredErrors: string[];
  severityThreshold: 'low' | 'medium' | 'high' | 'critical';
}

class ErrorReportingService {
  private errors: ErrorReport[] = [];
  private config: ErrorReportingConfig;
  private errorCount = 0;
  private lastErrorTime = 0;

  constructor(config: Partial<ErrorReportingConfig> = {}) {
    this.config = {
      enabled: true,
      logToConsole: true,
      sendToServer: false,
      maxErrorsPerMinute: 10,
      ignoredErrors: [],
      severityThreshold: 'low',
      ...config
    };

    this.setupGlobalErrorHandlers();
  }

  private setupGlobalErrorHandlers() {
    if (typeof window !== 'undefined') {
      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.reportError(event.reason, 'unhandled-rejection', 'critical');
      });

      // Handle JavaScript errors
      window.addEventListener('error', (event) => {
        this.reportError(event.error, 'javascript-error', 'high');
      });
    }
  }

  private shouldIgnoreError(error: Error): boolean {
    return this.config.ignoredErrors.some(pattern => 
      error.message.includes(pattern) || error.stack?.includes(pattern)
    );
  }

  private getSeverityLevel(error: Error, context: string): 'low' | 'medium' | 'high' | 'critical' {
    // Critical errors
    if (error.message.includes('Network Error') || 
        error.message.includes('Failed to fetch') ||
        context.includes('auth')) {
      return 'critical';
    }

    // High severity errors
    if (error.message.includes('500') || 
        error.message.includes('Internal Server Error') ||
        context.includes('api')) {
      return 'high';
    }

    // Medium severity errors
    if (error.message.includes('400') || 
        error.message.includes('Validation') ||
        context.includes('validation')) {
      return 'medium';
    }

    return 'low';
  }

  private getErrorCategory(error: Error, context: string): ErrorReport['category'] {
    if (context.includes('api') || error.message.includes('fetch')) {
      return 'api';
    }
    if (context.includes('auth') || error.message.includes('401') || error.message.includes('403')) {
      return 'auth';
    }
    if (error.message.includes('Network') || error.message.includes('fetch')) {
      return 'network';
    }
    if (error.message.includes('Validation') || error.message.includes('400')) {
      return 'validation';
    }
    if (context.includes('ui') || context.includes('component')) {
      return 'ui';
    }
    return 'unknown';
  }

  private rateLimitCheck(): boolean {
    const now = Date.now();
    if (now - this.lastErrorTime < 60000) { // Within 1 minute
      this.errorCount++;
      if (this.errorCount > this.config.maxErrorsPerMinute) {
        return false; // Rate limited
      }
    } else {
      this.errorCount = 1;
      this.lastErrorTime = now;
    }
    return true;
  }

  reportError(
    error: Error, 
    context: string, 
    severity?: 'low' | 'medium' | 'high' | 'critical',
    metadata?: Record<string, any>
  ): void {
    if (!this.config.enabled || this.shouldIgnoreError(error)) {
      return;
    }

    if (!this.rateLimitCheck()) {
      console.warn('Error reporting rate limited');
      return;
    }

    const errorReport: ErrorReport = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      error,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
      severity: severity || this.getSeverityLevel(error, context),
      category: this.getErrorCategory(error, context),
      metadata,
      resolved: false
    };

    this.errors.push(errorReport);

    // Log to console if enabled
    if (this.config.logToConsole) {
      this.logError(errorReport);
    }

    // Send to server if enabled
    if (this.config.sendToServer) {
      this.sendToServer(errorReport);
    }

    // Trigger error analytics
    this.triggerAnalytics(errorReport);
  }

  private logError(errorReport: ErrorReport): void {
    const { error, context, severity, category } = errorReport;
    
    console.group(`🚨 Error Report [${severity.toUpperCase()}]`);
    console.error('Error:', error);
    console.error('Context:', context);
    console.error('Category:', category);
    console.error('Timestamp:', new Date(errorReport.timestamp).toISOString());
    console.error('URL:', errorReport.url);
    if (errorReport.metadata) {
      console.error('Metadata:', errorReport.metadata);
    }
    console.groupEnd();
  }

  private async sendToServer(errorReport: ErrorReport): Promise<void> {
    try {
      // In a real implementation, you would send this to your error reporting service
      // like Sentry, LogRocket, or your own error tracking endpoint

      
      // Example: await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport)
      // });
    } catch (err) {
      console.error('Failed to send error report:', err);
    }
  }

  private triggerAnalytics(errorReport: ErrorReport): void {
    // Track error metrics for analytics
    const { severity, category } = errorReport;
    
    // Example: Google Analytics error tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'error', {
        error_category: category,
        error_severity: severity,
        error_message: errorReport.error.message,
        error_context: errorReport.context
      });
    }
  }

  getErrors(
    filters?: {
      severity?: ErrorReport['severity'];
      category?: ErrorReport['category'];
      resolved?: boolean;
      since?: number;
    }
  ): ErrorReport[] {
    let filtered = this.errors;

    if (filters?.severity) {
      filtered = filtered.filter(e => e.severity === filters.severity);
    }

    if (filters?.category) {
      filtered = filtered.filter(e => e.category === filters.category);
    }

    if (filters?.resolved !== undefined) {
      filtered = filtered.filter(e => e.resolved === filters.resolved);
    }

    if (filters?.since) {
      filtered = filtered.filter(e => e.timestamp >= filters.since!);
    }

    return filtered;
  }

  getErrorStats(): {
    total: number;
    bySeverity: Record<ErrorReport['severity'], number>;
    byCategory: Record<ErrorReport['category'], number>;
    recentErrors: number;
  } {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);

    const bySeverity = this.errors.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {} as Record<ErrorReport['severity'], number>);

    const byCategory = this.errors.reduce((acc, error) => {
      acc[error.category] = (acc[error.category] || 0) + 1;
      return acc;
    }, {} as Record<ErrorReport['category'], number>);

    const recentErrors = this.errors.filter(e => e.timestamp >= oneHourAgo).length;

    return {
      total: this.errors.length,
      bySeverity,
      byCategory,
      recentErrors
    };
  }

  markAsResolved(errorId: string): void {
    const error = this.errors.find(e => e.id === errorId);
    if (error) {
      error.resolved = true;
    }
  }

  clearErrors(): void {
    this.errors = [];
  }

  updateConfig(newConfig: Partial<ErrorReportingConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Create singleton instance
export const errorReporting = new ErrorReportingService();

// Export convenience functions
export const reportError = (
  error: Error, 
  context: string, 
  severity?: 'low' | 'medium' | 'high' | 'critical',
  metadata?: Record<string, any>
) => errorReporting.reportError(error, context, severity, metadata);

export const getErrorStats = () => errorReporting.getErrorStats();
export const getErrors = (filters?: Parameters<typeof errorReporting.getErrors>[0]) => errorReporting.getErrors(filters); 