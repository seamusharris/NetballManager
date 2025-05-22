import { 
  useQuery, 
  useMutation, 
  UseMutationOptions,
  UseQueryOptions 
} from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Different data types have different refresh requirements
export const STALE_TIMES = {
  // Static data that rarely changes
  STATIC: 24 * 60 * 60 * 1000, // 24 hours
  
  // Reference data that changes occasionally
  REFERENCE: 60 * 60 * 1000, // 1 hour
  
  // Application data that changes regularly but not in real-time
  STANDARD: 5 * 60 * 1000, // 5 minutes
  
  // Game data that can change during a game
  GAME: 30 * 1000, // 30 seconds
  
  // Live statistics that change frequently during a game
  LIVE: 10 * 1000 // 10 seconds
};

// Helper to determine appropriate stale time based on endpoint
function getStaleTimeForEndpoint(endpoint: string): number {
  if (endpoint.includes('/api/players') || endpoint.includes('/api/opponents')) {
    return STALE_TIMES.REFERENCE;
  }
  
  if (endpoint.includes('/api/games') && !endpoint.includes('/stats')) {
    return STALE_TIMES.STANDARD;
  }
  
  if (endpoint.includes('/rosters')) {
    return STALE_TIMES.GAME;
  }
  
  if (endpoint.includes('/stats')) {
    return STALE_TIMES.LIVE;
  }
  
  // Default stale time
  return STALE_TIMES.STANDARD;
}

/**
 * Enhanced query hook with optimized stale times based on data type
 */
export function useOptimizedQuery<TData = unknown>(
  endpoint: string | [string, ...unknown[]],
  options?: Omit<UseQueryOptions<TData, Error, TData>, 'queryKey' | 'queryFn'>
) {
  const queryKey = Array.isArray(endpoint) ? endpoint : [endpoint];
  const actualEndpoint = queryKey[0] as string;
  
  return useQuery<TData, Error>({
    queryKey,
    ...options,
    staleTime: options?.staleTime || getStaleTimeForEndpoint(actualEndpoint)
  });
}

/**
 * Enhanced mutation hook that automatically invalidates related queries
 */
export function useOptimizedMutation<TData = unknown, TVariables = unknown>(
  endpoint: string,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'>
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: (variables) => apiRequest(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(variables)
    }),
    ...options,
    onSuccess: async (data, variables, context) => {
      // Call the original onSuccess if provided
      if (options?.onSuccess) {
        await options.onSuccess(data, variables, context);
      }
      
      // Extract the base path for cache invalidation
      let basePath = endpoint.split('/').slice(0, 3).join('/');
      
      // Invalidate all queries related to this endpoint
      await queryClient.invalidateQueries({ queryKey: [basePath] });
    }
  });
}

/**
 * Enhanced mutation hook for updating data
 */
export function useOptimizedUpdateMutation<TData = unknown, TVariables = unknown>(
  endpoint: string,
  id: number,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'>
) {
  const fullEndpoint = `${endpoint}/${id}`;
  
  return useMutation<TData, Error, TVariables>({
    mutationFn: (variables) => apiRequest(fullEndpoint, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(variables)
    }),
    ...options,
    onSuccess: async (data, variables, context) => {
      // Call the original onSuccess if provided
      if (options?.onSuccess) {
        await options.onSuccess(data, variables, context);
      }
      
      // Extract the base path for cache invalidation
      let basePath = endpoint.split('/').slice(0, 3).join('/');
      
      // Invalidate all queries related to this endpoint
      await queryClient.invalidateQueries({ queryKey: [basePath] });
      
      // Also invalidate the specific resource
      await queryClient.invalidateQueries({ queryKey: [fullEndpoint] });
    }
  });
}