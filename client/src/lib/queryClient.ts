import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest<T = any>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  // Fix URL format for game stats endpoints to ensure correct path
  // The server expects /api/gamestats/ (no hyphen) not /api/game-stats/ (with hyphen)
  let correctedUrl = url;
  if (url.includes('/api/game-stats/')) {
    correctedUrl = url.replace('/api/game-stats/', '/api/gamestats/');
    console.log(`Corrected URL path from ${url} to ${correctedUrl}`);
  }

  const res = await fetch(correctedUrl, {
    credentials: "include",
    ...options
  });

  await throwIfResNotOk(res);
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
      url = url.replace('/api/game-stats/', '/api/gamestats/');
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
