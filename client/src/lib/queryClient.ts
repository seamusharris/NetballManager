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
  // Fix URL format for game stats endpoints to ensure correct path
  // The server now expects /api/games/stats/ (plural) instead of /api/gamestats/ or /api/game-stats/
  let correctedUrl = url;
  if (typeof url === 'string') {
    if (url.includes('/api/game-stats/')) {
      correctedUrl = url.replace('/api/game-stats/', '/api/games/stats/');
      console.log(`Corrected URL path from ${url} to ${correctedUrl}`);
    } else if (url.includes('/api/gamestats/')) {
      correctedUrl = url.replace('/api/gamestats/', '/api/games/stats/');
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

  console.log(`Making ${method} request to ${correctedUrl}`);
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
    // Fix URL format for game stats endpoints to ensure correct path
    let url = queryKey[0] as string;
    if (url.includes('/api/game-stats/')) {
      url = url.replace('/api/game-stats/', '/api/games/stats/');
      console.log(`Corrected query URL from ${queryKey[0]} to ${url}`);
    } else if (url.includes('/api/gamestats/')) {
      url = url.replace('/api/gamestats/', '/api/games/stats/');
      console.log(`Corrected query URL from ${queryKey[0]} to ${url}`);
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
 * Optimized query client configuration with proper stale times
 * based on data type and frequency of updates
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchOnWindowFocus: false,
      retry: 1,
      // Default stale time - we'll override this for specific queries
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Cache time longer than stale time allows for faster return to previously seen data
      gcTime: 15 * 60 * 1000, // 15 minutes
    },
    mutations: {
      retry: 1,
      // Add a short delay before retrying mutations
      retryDelay: 1000,
    },
  },
});
