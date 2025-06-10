import { QueryClient, QueryFunction } from "@tanstack/react-query";

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
      console.log(`Standardized batch URL path from ${url} to ${correctedUrl}`);
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
      console.log(`Corrected URL path from ${url} to ${correctedUrl}`);
    } 
    else if (url.includes('/api/gamestats/')) {
        const match = url.match(/\/api\/gamestats\/(\d+)/);
        if (match && match[1]) {
          correctedUrl = `/api/games/stats/${match[1]}`;
        } else {
          correctedUrl = url.replace('/api/gamestats/', '/api/games/stats/');
        }
      console.log(`Corrected URL path from ${url} to ${correctedUrl}`);
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
        console.log("Formatted positionPreferences for API request:", processedData.positionPreferences);
      } else if (method === 'POST') {
        // For new players, ensure positionPreferences is set (required field)
        processedData.positionPreferences = ["GS"];
        console.log("Added default positionPreferences for new player:", processedData.positionPreferences);
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
      console.log(`Added query params to URL: ${correctedUrl}`);
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

  console.log(`Making GET request to ${correctedUrl}`);
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
    // Fix URL format for game stats endpoints to ensure consistent RESTful path structure
    let url = queryKey[0] as string;
    if (typeof url === 'string') {
      // Handle batch endpoint (special case)
      if (url.startsWith('/api/games/stats/batch')) {
        url = '/api/games/stats/batch';
        console.log(`Standardized batch URL from ${queryKey[0]} to ${url}`);
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
        console.log(`Corrected query URL from ${queryKey[0]} to ${url}`);
      } 
      else if (url.includes('/api/gamestats/')) {
          const match = url.match(/\/api\/gamestats\/(\d+)/);
          if (match && match[1]) {
            url = `/api/games/stats/${match[1]}`;
          } else {
            url = url.replace('/api/gamestats/', '/api/games/stats/');
          }
        console.log(`Corrected query URL from ${queryKey[0]} to ${url}`);
      }
    }

    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

/**
 * Optimized query client configuration with aggressive caching
 * for better performance across season switches
 */
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Use cached data when available
      retry: (failureCount, error: any) => {
        // Don't retry on 404s or other client errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      // Enable request deduplication
      networkMode: 'always',
      queryFn: getQueryFn({ on401: "throw" }),
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error && typeof error === 'object' && 'message' in error) {
          const message = error.message as string;
          if (message.includes('4')) return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Differentiated stale times by data type
      staleTime: 10 * 60 * 1000, // 10 minutes default
      // Longer cache time to preserve data between navigations
      gcTime: 30 * 60 * 1000, // 30 minutes default
      // Ensure network mode is online to prevent dispatcher issues
      networkMode: 'online',
      // Enable background refetching for better UX
      refetchOnMount: 'always',
      refetchOnReconnect: 'always',
    },
    mutations: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      networkMode: 'online',
      // Optimistic updates for better UX
      onMutate: async () => {
        // Cancel outgoing refetches to avoid optimistic update conflicts
        await queryClient.cancelQueries();
      },
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