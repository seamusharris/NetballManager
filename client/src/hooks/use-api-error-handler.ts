import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  retryOnError?: boolean;
  maxRetries?: number;
}

/**
 * Enhanced API error handling hook
 * Provides consistent error handling across the application
 */
export const useApiErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const { toast } = useToast();
  
  const {
    showToast = true,
    logToConsole = true,
    retryOnError = false,
    maxRetries = 3
  } = options;

  const handleError = useCallback((error: any, context?: string) => {
    const apiError: ApiError = {
      message: 'An unexpected error occurred',
      status: 500,
      code: 'UNKNOWN_ERROR'
    };

    // Extract error information
    if (error?.response?.data) {
      apiError.message = error.response.data.error || error.response.data.message || apiError.message;
      apiError.status = error.response.status;
      apiError.details = error.response.data;
    } else if (error?.message) {
      apiError.message = error.message;
    } else if (typeof error === 'string') {
      apiError.message = error;
    }

    // Log error if enabled
    if (logToConsole) {
      console.group(`API Error in ${context || 'unknown context'}`);
      console.error('Error:', error);
      console.error('API Error Details:', apiError);
      console.error('Status:', apiError.status);
      console.error('Message:', apiError.message);
      console.groupEnd();
    }

    // Show toast notification if enabled
    if (showToast) {
      const toastVariant = apiError.status && apiError.status >= 500 ? 'destructive' : 'default';
      
      toast({
        title: getErrorTitle(apiError.status),
        description: apiError.message,
        variant: toastVariant,
        duration: 5000,
      });
    }

    return apiError;
  }, [toast, showToast, logToConsole]);

  const handleNetworkError = useCallback((error: any, context?: string) => {
    const networkError: ApiError = {
      message: 'Network connection error. Please check your internet connection.',
      status: 0,
      code: 'NETWORK_ERROR'
    };

    if (logToConsole) {
      console.error(`Network error in ${context || 'unknown context'}:`, error);
    }

    if (showToast) {
      toast({
        title: 'Connection Error',
        description: networkError.message,
        variant: 'destructive',
        duration: 8000,
      });
    }

    return networkError;
  }, [toast, showToast, logToConsole]);

  const handleValidationError = useCallback((errors: any, context?: string) => {
    const validationError: ApiError = {
      message: 'Please check your input and try again.',
      status: 400,
      code: 'VALIDATION_ERROR',
      details: errors
    };

    if (logToConsole) {
      console.error(`Validation error in ${context || 'unknown context'}:`, errors);
    }

    if (showToast) {
      toast({
        title: 'Validation Error',
        description: validationError.message,
        variant: 'destructive',
        duration: 5000,
      });
    }

    return validationError;
  }, [toast, showToast, logToConsole]);

  const handleAuthError = useCallback((error: any, context?: string) => {
    const authError: ApiError = {
      message: 'Authentication required. Please log in again.',
      status: 401,
      code: 'AUTH_ERROR'
    };

    if (logToConsole) {
      console.error(`Authentication error in ${context || 'unknown context'}:`, error);
    }

    if (showToast) {
      toast({
        title: 'Authentication Error',
        description: authError.message,
        variant: 'destructive',
        duration: 5000,
      });
    }

    // Redirect to login if needed
    // window.location.href = '/login';

    return authError;
  }, [toast, showToast, logToConsole]);

  const handlePermissionError = useCallback((error: any, context?: string) => {
    const permissionError: ApiError = {
      message: 'You do not have permission to perform this action.',
      status: 403,
      code: 'PERMISSION_ERROR'
    };

    if (logToConsole) {
      console.error(`Permission error in ${context || 'unknown context'}:`, error);
    }

    if (showToast) {
      toast({
        title: 'Permission Denied',
        description: permissionError.message,
        variant: 'destructive',
        duration: 5000,
      });
    }

    return permissionError;
  }, [toast, showToast, logToConsole]);

  return {
    handleError,
    handleNetworkError,
    handleValidationError,
    handleAuthError,
    handlePermissionError,
  };
};

/**
 * Get appropriate error title based on status code
 */
function getErrorTitle(status?: number): string {
  if (!status) return 'Error';
  
  switch (status) {
    case 400:
      return 'Bad Request';
    case 401:
      return 'Unauthorized';
    case 403:
      return 'Forbidden';
    case 404:
      return 'Not Found';
    case 409:
      return 'Conflict';
    case 422:
      return 'Validation Error';
    case 429:
      return 'Too Many Requests';
    case 500:
      return 'Server Error';
    case 502:
      return 'Bad Gateway';
    case 503:
      return 'Service Unavailable';
    case 504:
      return 'Gateway Timeout';
    default:
      return 'Error';
  }
}

/**
 * Retry utility for failed API calls
 */
export const useRetryHandler = (maxRetries = 3, delay = 1000) => {
  const retry = useCallback(async <T>(
    fn: () => Promise<T>,
    retryCount = 0
  ): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      if (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * (retryCount + 1)));
        return retry(fn, retryCount + 1);
      }
      throw error;
    }
  }, [maxRetries, delay]);

  return { retry };
}; 