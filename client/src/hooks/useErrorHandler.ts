/**
 * React Hook for Error Handling
 * 
 * Provides easy-to-use error handling functions in React components
 * with automatic context detection and toast integration.
 */

import { useCallback, useEffect } from 'react';
import { useToast } from './use-toast';
import { 
  globalErrorHandler, 
  handleError, 
  handleApiError, 
  handleValidationError,
  type ErrorContext, 
  type AppError 
} from '@/lib/globalErrorHandler';

interface UseErrorHandlerOptions {
  component?: string;
  enableToast?: boolean;
  customToastFn?: (message: string, type?: 'error' | 'warning' | 'info') => void;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { toast } = useToast();
  const { component, enableToast = true, customToastFn } = options;

  // Setup toast function for global error handler
  useEffect(() => {
    if (enableToast) {
      const toastFn = customToastFn || ((message: string, type = 'error') => {
        toast({
          title: type === 'error' ? 'Error' : 'Warning',
          description: message,
          variant: type === 'error' ? 'destructive' : 'default',
        });
      });
      
      globalErrorHandler.setToastFunction(toastFn);
    }
  }, [toast, enableToast, customToastFn]);

  // Create error handlers with component context
  const createContext = useCallback((additionalContext?: Partial<ErrorContext>): ErrorContext => {
    return {
      component,
      ...additionalContext
    };
  }, [component]);

  const handleComponentError = useCallback((
    error: unknown, 
    action?: string,
    additionalContext?: Partial<ErrorContext>
  ): AppError => {
    const context = createContext({ action, ...additionalContext });
    return handleError(error, context);
  }, [createContext]);

  const handleAsyncError = useCallback((
    error: unknown,
    action?: string,
    additionalContext?: Partial<ErrorContext>
  ): AppError => {
    const context = createContext({ action: action || 'async-operation', ...additionalContext });
    return handleError(error, context);
  }, [createContext]);

  const handleFormError = useCallback((
    errors: Record<string, string>,
    additionalContext?: Partial<ErrorContext>
  ): void => {
    const context = createContext({ action: 'form-submission', ...additionalContext });
    handleValidationError(errors, context);
  }, [createContext]);

  const handleApiCallError = useCallback((
    error: unknown,
    endpoint: string,
    method: string,
    additionalContext?: Partial<ErrorContext>
  ): void => {
    const context = createContext({ action: 'api-call', ...additionalContext });
    handleApiError(error, endpoint, method, context);
  }, [createContext]);

  // Wrapper for async operations with error handling
  const withErrorHandling = useCallback(<T>(
    asyncFn: () => Promise<T>,
    action?: string,
    additionalContext?: Partial<ErrorContext>
  ) => {
    return async (): Promise<T | null> => {
      try {
        return await asyncFn();
      } catch (error) {
        handleAsyncError(error, action, additionalContext);
        return null;
      }
    };
  }, [handleAsyncError]);

  // Safe async wrapper that doesn't throw
  const safeAsync = useCallback(<T>(
    asyncFn: () => Promise<T>,
    fallback?: T,
    action?: string
  ) => {
    return async (): Promise<T | undefined> => {
      try {
        return await asyncFn();
      } catch (error) {
        handleAsyncError(error, action);
        return fallback;
      }
    };
  }, [handleAsyncError]);

  return {
    // Core error handlers
    handleError: handleComponentError,
    handleAsyncError,
    handleFormError,
    handleApiError: handleApiCallError,
    
    // Utility functions
    withErrorHandling,
    safeAsync,
    createContext,

    // Re-export types for convenience
    AppError,
    ErrorContext
  };
}

// Specialized hooks for common use cases

/**
 * Hook for API operations
 */
export function useApiErrorHandler(component?: string) {
  const { handleApiError, handleAsyncError } = useErrorHandler({ component });

  const handleApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    endpoint: string,
    method: string
  ): Promise<T | null> => {
    try {
      return await apiCall();
    } catch (error) {
      handleApiError(error, endpoint, method);
      return null;
    }
  }, [handleApiError]);

  return {
    handleApiCall,
    handleApiError,
    handleAsyncError
  };
}

/**
 * Hook for form operations
 */
export function useFormErrorHandler(component?: string) {
  const { handleFormError, handleAsyncError } = useErrorHandler({ component });

  const handleFormSubmission = useCallback(async <T>(
    submitFn: () => Promise<T>,
    validationErrors?: Record<string, string>
  ): Promise<T | null> => {
    try {
      // Handle validation errors first
      if (validationErrors && Object.keys(validationErrors).length > 0) {
        handleFormError(validationErrors);
        return null;
      }

      return await submitFn();
    } catch (error) {
      handleAsyncError(error, 'form-submission');
      return null;
    }
  }, [handleFormError, handleAsyncError]);

  return {
    handleFormSubmission,
    handleFormError,
    handleAsyncError
  };
}

/**
 * Hook for React Query operations
 */
export function useQueryErrorHandler(component?: string) {
  const { handleError } = useErrorHandler({ component });

  const handleQueryError = useCallback((
    error: unknown,
    queryKey: unknown[]
  ) => {
    return handleError(error, 'query-error', {
      additionalData: {
        queryKey: Array.isArray(queryKey) ? queryKey.join(',') : String(queryKey)
      }
    });
  }, [handleError]);

  const handleMutationError = useCallback((
    error: unknown,
    mutationKey?: string
  ) => {
    return handleError(error, 'mutation-error', {
      additionalData: {
        mutationKey
      }
    });
  }, [handleError]);

  return {
    handleQueryError,
    handleMutationError
  };
}