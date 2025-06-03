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
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchOnWindowFocus: false,
      retry: 1,
      // More aggressive stale time for faster dashboard performance
      staleTime: 10 * 60 * 1000, // 10 minutes (reduced from 30)
      // Much longer cache time to preserve data between season switches
      gcTime: 30 * 60 * 1000, // 30 minutes (reduced from 60)
      // Ensure network mode is online to prevent dispatcher issues
      networkMode: 'online',
    },
    mutations: {
      retry: 1,
      // Add a short delay before retrying mutations
      retryDelay: 1000,
      // Ensure network mode is online for mutations too
      networkMode: 'online',
    },
  },
});

// Legacy apiRequest has been replaced by apiClient