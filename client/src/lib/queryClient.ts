import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Re-export apiClient for convenience
export { apiClient } from './apiClient';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      // Try to get a JSON error response first
      const contentType = res.headers.get('content-type');
      let errorText;

      if (contentType && contentType.includes('application/json')) {
        // Clone the response so we can read it as JSON
        const clonedRes = res.clone();
        try {
          const jsonError = await clonedRes.json();
          errorText = JSON.stringify(jsonError);
          console.error('API Error Response (JSON):', jsonError);
        } catch (jsonError) {
          // If JSON parsing fails, fall back to text
          errorText = await res.text() || res.statusText;
          console.error('API Error Response (Text after JSON parse failed):', errorText);
        }
      } else {
        // Not a JSON response, read as text
        errorText = await res.text() || res.statusText;
        console.error('API Error Response (Text):', errorText);
      }

      throw new Error(`${res.status}: ${errorText}`);
    } catch (parseError) {
      // If all else fails, just use the status text
      console.error('Error parsing error response:', parseError);
      throw new Error(`${res.status}: ${res.statusText}`);
    }
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: any,
): Promise<any> {
  // Fix URL format for game stats endpoints to ensure consistent RESTful path structure
  // We're standardizing on the /api/games/:gameId/stats pattern for better RESTful design
  let correctedUrl = url;
  if (typeof url === 'string') {
    // Handle batch endpoint (special case)
    if (url.startsWith('/api/games/stats/batch')) {
      correctedUrl = '/api/games/stats/batch';

    }
    // Handle legacy direct game stats endpoints
    else if (url.includes('/api/game-stats/')) {
      // Extract potential ID
      const match = url.match(/\/api\/game-stats\/(\d+)/);
      if (match && match[1]) {
        // URL with ID - convert to nested resource pattern
        correctedUrl = `/api/games/${match[1]}/stats`;
      } else {
        // URL without ID - just standardize the base endpoint
        correctedUrl = url.replace('/api/game-stats/', '/api/games/stats/');
      }

    } 
    else if (url.includes('/api/gamestats/')) {
        const match = url.match(/\/api\/gamestats\/(\d+)/);
        if (match && match[1]) {
          correctedUrl = `/api/games/stats/${match[1]}`;
        } else {
          correctedUrl = url.replace('/api/gamestats/', '/api/games/stats/');
        }
    }
  }

  // Make a deep copy of the data to avoid mutating the original
  let processedData = data ? JSON.parse(JSON.stringify(data)) : undefined;

  // Special handling for player data to ensure position_preferences is properly formatted
  if (processedData && (method === 'POST' || method === 'PATCH')) {
    // Handle URLs with /api/players
    if (typeof url === 'string' && (url.includes('/api/players'))) {
      // Handle position preferences field specially
      if ('positionPreferences' in processedData) {
        // Ensure it's always an array
        if (!Array.isArray(processedData.positionPreferences)) {
          if (typeof processedData.positionPreferences === 'string') {
            // Convert single string to array
            processedData.positionPreferences = [processedData.positionPreferences];
          } else if (!processedData.positionPreferences) {
            // Default to empty array if null or undefined
            processedData.positionPreferences = [];
          } else {
            // Default to empty array for any other invalid type
            processedData.positionPreferences = [];
          }
        } else if (processedData.positionPreferences.length === 0) {
          // Ensure at least one position is present (required by schema)
          processedData.positionPreferences = ["GS"];
        }

      } else if (method === 'POST') {
        // For new players, ensure positionPreferences is set (required field)
        processedData.positionPreferences = ["GS"];

      }
    }
  }

  // Handle GET requests with data as query parameters
  if (method === 'GET' && processedData !== undefined) {
    // Convert data object to URLSearchParams
    const params = new URLSearchParams();
    for (const key in processedData) {
      if (processedData.hasOwnProperty(key) && processedData[key] !== undefined) {
        params.append(key, processedData[key].toString());
      }
    }

    // Add params to URL
    const queryString = params.toString();
    if (queryString) {
      correctedUrl += (correctedUrl.includes('?') ? '&' : '?') + queryString;

    }
  }

  const options: RequestInit = {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    }
  };

  // Add body for non-GET requests
  if (method !== 'GET' && processedData !== undefined) {
    options.body = JSON.stringify(processedData);
  }


  const res = await fetch(correctedUrl, options);
  await throwIfResNotOk(res);

  // Parse and return JSON data directly
  return await res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Import apiClient here to avoid circular dependencies
    const { apiClient } = await import('./apiClient');
    
    // Fix URL format for game stats endpoints to ensure consistent RESTful path structure
    let url = queryKey[0] as string;
    if (typeof url === 'string') {
      // Handle batch endpoint (special case)
      if (url.startsWith('/api/games/stats/batch')) {
        url = '/api/games/stats/batch';

      }
      // Handle legacy direct game stats endpoints
      else if (url.includes('/api/game-stats/')) {
        // Extract potential ID
        const match = url.match(/\/api\/game-stats\/(\d+)/);
        if (match && match[1]) {
          // URL with ID - convert to nested resource pattern
          url = `/api/games/${match[1]}/stats`;
        } else {
          // URL without ID - just standardize the base endpoint
          url = url.replace('/api/game-stats/', '/api/games/stats/');
        }
      } 
      else if (url.includes('/api/gamestats/')) {
          const match = url.match(/\/api\/gamestats\/(\d+)/);
          if (match && match[1]) {
            url = `/api/games/stats/${match[1]}`;
          } else {
            url = url.replace('/api/gamestats/', '/api/games/stats/');
          }
      }
    }

    try {
      // Use apiClient.get() to ensure proper headers are included
      const result = await apiClient.get(url);
      return result as any;
    } catch (error: any) {
      if (unauthorizedBehavior === "returnNull" && 
          (error?.message?.includes('401') || error?.status === 401)) {
        return null as any;
      }
      throw error;
    }
  };

/**
 * Optimized query client configuration with smart caching
 * to prevent infinite loops and improve performance
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15 * 60 * 1000, // 15 minutes - increased for better navigation caching
      gcTime: 60 * 60 * 1000, // 1 hour - keep data longer in memory
      refetchOnWindowFocus: false, // Prevent unnecessary refetches
      refetchOnMount: false, // Don't refetch on every mount
      refetchOnReconnect: false, // Don't refetch on reconnect to preserve cache
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
      retry: 1, // Reduced retries for mutations
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      networkMode: 'online',
    },
  },
});

// Cache configuration by data type
export const CACHE_CONFIG = {
  // Base entity data - stable, long-lived
  STABLE: {
    staleTime: 15 * 60 * 1000,    // 15 minutes
    gcTime: 60 * 60 * 1000,       // 1 hour
  },

  // Game data - medium volatility
  MEDIUM: {
    staleTime: 10 * 60 * 1000,    // 10 minutes
    gcTime: 30 * 60 * 1000,       // 30 minutes
  },

  // Statistics - high volatility during live games
  LIVE: {
    staleTime: 2 * 60 * 1000,     // 2 minutes
    gcTime: 15 * 60 * 1000,       // 15 minutes
  },

  // Computed/analysis data - depends on other data
  COMPUTED: {
    staleTime: 5 * 60 * 1000,     // 5 minutes
    gcTime: 20 * 60 * 1000,       // 20 minutes
  }
};