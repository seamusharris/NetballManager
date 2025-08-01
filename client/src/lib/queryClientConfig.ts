/**
 * React Query Configuration with Global Error Handler Integration
 * 
 * Provides enhanced React Query configuration with automatic error handling,
 * retry logic, and integration with the global error handling system.
 */

import { QueryClient, QueryClientConfig, MutationCache, QueryCache } from '@tanstack/react-query';
import { 
  reactQueryErrorHandler, 
  globalErrorHandler,
  isRetryable,
  getRetryDelay,
  type ErrorContext 
} from './globalErrorHandler';

/**
 * Enhanced Query Client with global error handling
 */
export function createEnhancedQueryClient(config: Partial<QueryClientConfig> = {}): QueryClient {
  const queryCache = new QueryCache({
    onError: (error, query) => {
      const context: ErrorContext = {
        component: 'react-query',
        action: 'query-error',
        additionalData: {
          queryKey: query.queryKey,
          queryHash: query.queryHash,
          state: query.state.status
        }
      };

      globalErrorHandler.handleError(error, context);
    },
    onSuccess: (data, query) => {
      // Optional: Log successful queries for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log(`Query success: ${JSON.stringify(query.queryKey)}`);
      }
    }
  });

  const mutationCache = new MutationCache({
    onError: (error, variables, context, mutation) => {
      const errorContext: ErrorContext = {
        component: 'react-query',
        action: 'mutation-error',
        additionalData: {
          mutationKey: mutation.options.mutationKey,
          variables,
          context
        }
      };

      globalErrorHandler.handleError(error, errorContext);
    },
    onSuccess: (data, variables, context, mutation) => {
      // Optional: Log successful mutations for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log(`Mutation success: ${JSON.stringify(mutation.options.mutationKey)}`);
      }
    }
  });

  return new QueryClient({
    queryCache,
    mutationCache,
    defaultOptions: {
      queries: {
        // Retry configuration with global error handler integration
        retry: (failureCount, error) => {
          // Convert error to AppError and check if retryable
          const normalizedError = globalErrorHandler.handleError(error, {
            component: 'react-query',
            action: 'query-retry-check'
          });

          // Don't retry if not retryable or exceeded max retries
          if (!isRetryable(normalizedError) || failureCount >= 3) {
            return false;
          }

          return true;
        },
        
        // Dynamic retry delay using global error handler
        retryDelay: (attemptIndex) => getRetryDelay(attemptIndex + 1),
        
        // Stale time configuration
        staleTime: 5 * 60 * 1000, // 5 minutes
        
        // Cache time configuration
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        
        // Refetch configuration
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchOnMount: true,
        
        // Error handling
        throwOnError: false, // Let error boundaries handle errors
        
        ...config.defaultOptions?.queries
      },
      
      mutations: {
        // Retry configuration for mutations
        retry: (failureCount, error) => {
          const normalizedError = globalErrorHandler.handleError(error, {
            component: 'react-query',
            action: 'mutation-retry-check'
          });

          // Only retry idempotent operations and retryable errors
          return isRetryable(normalizedError) && failureCount < 2;
        },
        
        // Dynamic retry delay
        retryDelay: (attemptIndex) => getRetryDelay(attemptIndex + 1),
        
        // Error handling
        throwOnError: false,
        
        ...config.defaultOptions?.mutations
      }
    },
    
    ...config
  });
}

/**
 * Default enhanced query client instance
 */
export const enhancedQueryClient = createEnhancedQueryClient();

/**
 * Query and Mutation hooks with enhanced error handling
 */
import { 
  useQuery as useBaseQuery, 
  useMutation as useBaseMutation,
  UseQueryOptions,
  UseMutationOptions,
  UseQueryResult,
  UseMutationResult
} from '@tanstack/react-query';

/**
 * Enhanced useQuery hook with automatic error handling
 */
export function useEnhancedQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends readonly unknown[] = readonly unknown[]
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> & {
    errorContext?: Partial<ErrorContext>;
  }
): UseQueryResult<TData, TError> {
  const { errorContext, ...queryOptions } = options;

  return useBaseQuery({
    ...queryOptions,
    onError: (error) => {
      const context: ErrorContext = {
        component: 'useEnhancedQuery',
        action: 'query-error',
        ...errorContext,
        additionalData: {
          queryKey: options.queryKey,
          ...errorContext?.additionalData
        }
      };

      globalErrorHandler.handleError(error, context);
      
      // Call original onError if provided
      if (queryOptions.onError) {
        queryOptions.onError(error);
      }
    }
  });
}

/**
 * Enhanced useMutation hook with automatic error handling
 */
export function useEnhancedMutation<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown
>(
  options: UseMutationOptions<TData, TError, TVariables, TContext> & {
    errorContext?: Partial<ErrorContext>;
  }
): UseMutationResult<TData, TError, TVariables, TContext> {
  const { errorContext, ...mutationOptions } = options;

  return useBaseMutation({
    ...mutationOptions,
    onError: (error, variables, context) => {
      const errorCtx: ErrorContext = {
        component: 'useEnhancedMutation',
        action: 'mutation-error',
        ...errorContext,
        additionalData: {
          mutationKey: options.mutationKey,
          variables,
          context,
          ...errorContext?.additionalData
        }
      };

      globalErrorHandler.handleError(error, errorCtx);
      
      // Call original onError if provided
      if (mutationOptions.onError) {
        mutationOptions.onError(error, variables, context);
      }
    }
  });
}

/**
 * Safe query hook that returns null on error instead of throwing
 */
export function useSafeQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends readonly unknown[] = readonly unknown[]
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> & {
    errorContext?: Partial<ErrorContext>;
    fallbackData?: TData;
  }
): UseQueryResult<TData | null, TError> {
  const { fallbackData = null, ...queryOptions } = options;

  const result = useEnhancedQuery({
    ...queryOptions,
    select: (data) => {
      try {
        return queryOptions.select ? queryOptions.select(data) : data;
      } catch (error) {
        console.error('Error in query select function:', error);
        return fallbackData as TData;
      }
    }
  });

  // Return fallback data on error
  if (result.error && !result.data) {
    return {
      ...result,
      data: fallbackData as TData
    };
  }

  return result as UseQueryResult<TData | null, TError>;
}

/**
 * Optimistic mutation hook with automatic rollback on error
 */
export function useOptimisticMutation<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown
>(
  options: UseMutationOptions<TData, TError, TVariables, TContext> & {
    errorContext?: Partial<ErrorContext>;
    optimisticUpdate?: (variables: TVariables) => void;
    rollback?: (context: TContext) => void;
  }
): UseMutationResult<TData, TError, TVariables, TContext> {
  const { optimisticUpdate, rollback, ...mutationOptions } = options;

  return useEnhancedMutation({
    ...mutationOptions,
    onMutate: async (variables) => {
      // Apply optimistic update
      if (optimisticUpdate) {
        optimisticUpdate(variables);
      }

      // Return context for rollback
      const context = mutationOptions.onMutate ? await mutationOptions.onMutate(variables) : undefined;
      return context;
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (rollback && context) {
        rollback(context);
      }

      // Call original onError if provided
      if (mutationOptions.onError) {
        mutationOptions.onError(error, variables, context);
      }
    }
  });
}

// Export the enhanced query client as default
export default enhancedQueryClient;