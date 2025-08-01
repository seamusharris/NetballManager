/**
 * Global Error Handling System
 * 
 * Provides standardized error handling, type-safe error interfaces,
 * and integration with React Query, API client, and UI components.
 */

import { errorReporting } from './errorReporting';
import { queryClient } from './queryClient';
import { ApiResponse, NetworkError, AppError, ValidationError } from '@shared/types';

// Export error types from shared types
export type { AppError, NetworkError, ValidationError } from '@shared/types';

/**
 * Enhanced API Error with HTTP details
 */
export interface ApiError extends NetworkError {
  response?: Response;
  data?: any;
  code: string;
}

/**
 * Error context for better categorization
 */
export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  clubId?: number;
  teamId?: number;
  gameId?: number;
  additionalData?: Record<string, unknown>;
}

/**
 * Global error handler configuration
 */
export interface GlobalErrorConfig {
  enableReporting: boolean;
  enableConsoleLogging: boolean;
  enableToastNotifications: boolean;
  retryConfig: {
    maxRetries: number;
    retryDelayMs: number;
    retryableStatuses: number[];
  };
}

const DEFAULT_CONFIG: GlobalErrorConfig = {
  enableReporting: true,
  enableConsoleLogging: true,
  enableToastNotifications: true,
  retryConfig: {
    maxRetries: 3,
    retryDelayMs: 1000,
    retryableStatuses: [500, 502, 503, 504, 408, 429]
  }
};

/**
 * Global Error Handler Class
 */
class GlobalErrorHandler {
  private config: GlobalErrorConfig;
  private toastFunction?: (message: string, type?: 'error' | 'warning' | 'info') => void;

  constructor(config: Partial<GlobalErrorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.setupGlobalHandlers();
  }

  /**
   * Set toast notification function
   */
  setToastFunction(toastFn: (message: string, type?: 'error' | 'warning' | 'info') => void) {
    this.toastFunction = toastFn;
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, { component: 'global', action: 'unhandledrejection' });
      event.preventDefault(); // Prevent console error
    });

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError(event.error, { component: 'global', action: 'javascript-error' });
    });
  }

  /**
   * Main error handling method
   */
  handleError(error: unknown, context: ErrorContext = {}): AppError {
    const normalizedError = this.normalizeError(error, context);
    
    // Log to console if enabled
    if (this.config.enableConsoleLogging) {
      this.logError(normalizedError, context);
    }

    // Report to error service if enabled
    if (this.config.enableReporting) {
      errorReporting.reportError(
        new Error(normalizedError.message), 
        `${context.component || 'unknown'}:${context.action || 'unknown'}`,
        this.getSeverity(normalizedError),
        { ...context, errorDetails: normalizedError }
      );
    }

    // Show toast notification if enabled
    if (this.config.enableToastNotifications && this.toastFunction) {
      this.showUserNotification(normalizedError);
    }

    return normalizedError;
  }

  /**
   * Handle API errors with enhanced context
   */
  handleApiError(error: unknown, endpoint: string, method: string, context: ErrorContext = {}): ApiError {
    const baseError = this.normalizeError(error, context);
    
    const apiError: ApiError = {
      ...baseError,
      url: endpoint,
      status: this.extractHttpStatus(error),
      code: this.generateErrorCode(error, endpoint, method)
    };

    // Add response data if available
    if (error instanceof Response) {
      apiError.response = error;
    }

    // Enhanced context for API errors
    const apiContext: ErrorContext = {
      ...context,
      action: `api-${method.toLowerCase()}`,
      additionalData: {
        endpoint,
        method,
        status: apiError.status,
        ...context.additionalData
      }
    };

    this.handleError(apiError, apiContext);
    return apiError;
  }

  /**
   * Handle React Query errors
   */
  handleQueryError(error: unknown, queryKey: unknown[], context: ErrorContext = {}): AppError {
    const normalizedError = this.normalizeError(error, context);
    
    const queryContext: ErrorContext = {
      ...context,
      action: 'react-query-error',
      additionalData: {
        queryKey: Array.isArray(queryKey) ? queryKey.join(',') : String(queryKey),
        ...context.additionalData
      }
    };

    return this.handleError(normalizedError, queryContext);
  }

  /**
   * Handle form validation errors
   */
  handleValidationError(errors: Record<string, string>, context: ErrorContext = {}): ValidationError {
    const validationError: ValidationError = {
      message: 'Validation failed',
      timestamp: new Date().toISOString(),
      code: 'VALIDATION_ERROR',
      field: Object.keys(errors)[0], // First error field
      value: Object.values(errors)[0] // First error message
    };

    const validationContext: ErrorContext = {
      ...context,
      action: 'form-validation',
      additionalData: {
        validationErrors: errors,
        ...context.additionalData
      }
    };

    this.handleError(validationError, validationContext);
    return validationError;
  }

  /**
   * Normalize different error types into standard AppError
   */
  private normalizeError(error: unknown, context: ErrorContext): AppError {
    // Already an AppError
    if (this.isAppError(error)) {
      return error;
    }

    // Native Error object
    if (error instanceof Error) {
      return {
        message: error.message,
        timestamp: new Date().toISOString(),
        code: this.generateErrorCode(error, context.component, context.action),
        details: {
          stack: error.stack,
          name: error.name
        }
      };
    }

    // Network/Response error
    if (error instanceof Response) {
      return {
        message: `HTTP ${error.status}: ${error.statusText}`,
        timestamp: new Date().toISOString(),
        code: `HTTP_${error.status}`,
        details: {
          status: error.status,
          statusText: error.statusText,
          url: error.url
        }
      };
    }

    // String error
    if (typeof error === 'string') {
      return {
        message: error,
        timestamp: new Date().toISOString(),
        code: 'UNKNOWN_ERROR'
      };
    }

    // Object with message
    if (error && typeof error === 'object' && 'message' in error) {
      return {
        message: String(error.message),
        timestamp: new Date().toISOString(),
        code: 'OBJECT_ERROR',
        details: error
      };
    }

    // Fallback for unknown error types
    return {
      message: 'An unknown error occurred',
      timestamp: new Date().toISOString(),
      code: 'UNKNOWN_ERROR',
      details: error
    };
  }

  /**
   * Type guard for AppError
   */
  private isAppError(error: unknown): error is AppError {
    return error !== null && 
           typeof error === 'object' && 
           'message' in error && 
           'timestamp' in error;
  }

  /**
   * Extract HTTP status code from various error types
   */
  private extractHttpStatus(error: unknown): number | undefined {
    if (error instanceof Response) {
      return error.status;
    }
    
    if (error && typeof error === 'object') {
      if ('status' in error && typeof error.status === 'number') {
        return error.status;
      }
      if ('response' in error && error.response && typeof error.response === 'object' && 'status' in error.response) {
        return error.response.status as number;
      }
    }

    // Parse from error message
    const errorMessage = error instanceof Error ? error.message : String(error);
    const statusMatch = errorMessage.match(/HTTP (\d{3})/);
    return statusMatch ? parseInt(statusMatch[1]) : undefined;
  }

  /**
   * Generate consistent error codes
   */
  private generateErrorCode(error: unknown, component?: string, action?: string): string {
    const parts: string[] = [];
    
    if (component) parts.push(component.toUpperCase());
    if (action) parts.push(action.toUpperCase());
    
    // Add error type
    if (error instanceof Error) {
      parts.push(error.name.toUpperCase());
    } else if (error instanceof Response) {
      parts.push(`HTTP_${error.status}`);
    } else {
      parts.push('UNKNOWN');
    }

    return parts.join('_');
  }

  /**
   * Determine error severity
   */
  private getSeverity(error: AppError): 'low' | 'medium' | 'high' | 'critical' {
    // Critical: Auth, network failures, 5xx errors
    if (error.message.includes('401') || 
        error.message.includes('403') || 
        error.message.includes('Network') ||
        error.message.includes('Failed to fetch') ||
        (error.code && error.code.includes('HTTP_5'))) {
      return 'critical';
    }

    // High: Server errors, data corruption
    if (error.message.includes('500') || 
        error.message.includes('502') ||
        error.message.includes('503') ||
        error.code?.includes('SERVER')) {
      return 'high';
    }

    // Medium: Client errors, validation failures
    if (error.message.includes('400') || 
        error.message.includes('404') ||
        error.code?.includes('VALIDATION')) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Log error with structured format
   */
  private logError(error: AppError, context: ErrorContext) {
    console.group(`🚨 ${this.getSeverity(error).toUpperCase()} ERROR`);
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Timestamp:', error.timestamp);
    
    if (context.component) console.error('Component:', context.component);
    if (context.action) console.error('Action:', context.action);
    if (context.userId) console.error('User ID:', context.userId);
    if (context.clubId) console.error('Club ID:', context.clubId);
    if (context.gameId) console.error('Game ID:', context.gameId);
    
    if (error.details) console.error('Details:', error.details);
    if (context.additionalData) console.error('Additional Data:', context.additionalData);
    
    console.groupEnd();
  }

  /**
   * Show user-friendly notification
   */
  private showUserNotification(error: AppError) {
    if (!this.toastFunction) return;

    const userMessage = this.getUserFriendlyMessage(error);
    const severity = this.getSeverity(error);
    
    this.toastFunction(userMessage, severity === 'critical' || severity === 'high' ? 'error' : 'warning');
  }

  /**
   * Convert technical errors to user-friendly messages
   */
  private getUserFriendlyMessage(error: AppError): string {
    // Network errors
    if (error.message.includes('Failed to fetch') || 
        error.message.includes('Network Error')) {
      return 'Connection problem. Please check your internet connection and try again.';
    }

    // Authentication errors
    if (error.message.includes('401')) {
      return 'Your session has expired. Please log in again.';
    }

    if (error.message.includes('403')) {
      return 'You don\'t have permission to perform this action.';
    }

    // Server errors
    if (error.message.includes('500') || 
        error.message.includes('502') || 
        error.message.includes('503')) {
      return 'Server is experiencing issues. Please try again in a few moments.';
    }

    // Validation errors
    if (error.code?.includes('VALIDATION')) {
      return 'Please check your input and try again.';
    }

    // Not found errors
    if (error.message.includes('404')) {
      return 'The requested resource was not found.';
    }

    // Rate limiting
    if (error.message.includes('429')) {
      return 'Too many requests. Please wait a moment and try again.';
    }

    // Generic fallback
    return 'Something went wrong. Please try again.';
  }

  /**
   * Check if error is retryable
   */
  isRetryable(error: AppError): boolean {
    // Check for retryable HTTP status codes
    if (error.details && typeof error.details === 'object' && 'status' in error.details) {
      const status = error.details.status as number;
      return this.config.retryConfig.retryableStatuses.includes(status);
    }

    // Check error message patterns
    const retryablePatterns = [
      'Network Error',
      'Failed to fetch',
      'timeout',
      '502',
      '503',
      '504',
      '408',
      '429'
    ];

    return retryablePatterns.some(pattern => 
      error.message.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  /**
   * Get retry delay with exponential backoff
   */
  getRetryDelay(attemptNumber: number): number {
    return Math.min(
      this.config.retryConfig.retryDelayMs * Math.pow(2, attemptNumber - 1),
      30000 // Max 30 seconds
    );
  }
}

// Create singleton instance
export const globalErrorHandler = new GlobalErrorHandler();

// Convenience functions
export const handleError = (error: unknown, context?: ErrorContext) => 
  globalErrorHandler.handleError(error, context);

export const handleApiError = (error: unknown, endpoint: string, method: string, context?: ErrorContext) => 
  globalErrorHandler.handleApiError(error, endpoint, method, context);

export const handleQueryError = (error: unknown, queryKey: unknown[], context?: ErrorContext) => 
  globalErrorHandler.handleQueryError(error, queryKey, context);

export const handleValidationError = (errors: Record<string, string>, context?: ErrorContext) => 
  globalErrorHandler.handleValidationError(errors, context);

export const isRetryable = (error: AppError) => globalErrorHandler.isRetryable(error);
export const getRetryDelay = (attemptNumber: number) => globalErrorHandler.getRetryDelay(attemptNumber);

// React Query error handler
export const reactQueryErrorHandler = (error: unknown, query: { queryKey: unknown[] }) => {
  return handleQueryError(error, query.queryKey, {
    component: 'react-query',
    action: 'query-error'
  });
};

// API client error interceptor
export const apiClientErrorInterceptor = (error: unknown, endpoint: string, method: string) => {
  return handleApiError(error, endpoint, method, {
    component: 'api-client',
    action: 'request-error'
  });
};