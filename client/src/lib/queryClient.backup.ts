
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15 * 60 * 1000, // 15 minutes - increased for better navigation caching
      gcTime: 60 * 60 * 1000, // 1 hour - keep data longer in memory
      refetchOnWindowFocus: false,
      refetchOnMount: true, // Changed back to true for proper cache invalidation
      refetchOnReconnect: false, // Changed to false to preserve cache across reconnects
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        if (error && typeof error === 'object' && 'message' in error) {
          const message = error.message.toLowerCase();
          if (message.includes('400') || message.includes('401') || 
              message.includes('403') || message.includes('404')) {
            return false;
          }
        }
        return failureCount < 2; // Reduced retries to prevent cache thrashing
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      networkMode: 'online',
      queryFn: getQueryFn({ on401: "throw" }),
    },
    mutations: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      networkMode: 'online',
      // Remove aggressive query cancellation that was causing cache thrashing
      // Individual mutations should handle their own cache invalidation specifically
    },
  },
});

// CHECKPOINT CREATED: 2025-06-23
// This file contains the original queryClient configuration before changing refetchOnMount to false
// To revert: copy this configuration back to queryClient.ts
