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