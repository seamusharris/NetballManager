import { queryClient } from './queryClient';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

import { useClub } from '../contexts/ClubContext';

// These functions are no longer used - context is set via setClubContext()
// Keeping them for potential future use but they should not be called in request method

// Create a singleton API client that can access club context
interface ClubContext {
  currentClubId: number | null;
  currentTeamId?: number | null;
}

class ApiClient {
  private baseURL: string;
  private clubContext: ClubContext = { currentClubId: null, currentTeamId: null };

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
  }

  setClubContext(context: ClubContext) {
    this.clubContext = context;
    console.log('API Client: Club context set to:', context.currentClubId, 'Team:', context.currentTeamId);
  }

  async request<T>(method: string, endpoint: string, data?: any, customHeaders?: Record<string, string>): Promise<T> {
    console.log(`\n=== API CLIENT REQUEST START ===`);
    console.log(`API Client: ${method} ${endpoint} at ${new Date().toISOString()}`);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add club context header if available
    if (this.clubContext.currentClubId) {
      headers['x-current-club-id'] = this.clubContext.currentClubId.toString();
      console.log(`API Client: Added club header: ${this.clubContext.currentClubId}`);
    } else {
      console.log(`API Client: No club ID available in context`);
    }

    // Add team context header if available
    if (this.clubContext.currentTeamId) {
      headers['x-current-team-id'] = this.clubContext.currentTeamId.toString();
      console.log(`API Client: Added team header: ${this.clubContext.currentTeamId}`);
    } else {
      console.log(`API Client: No team ID available in context`);
    }

    // Merge custom headers
    if (customHeaders) {
      Object.assign(headers, customHeaders);
      console.log(`API Client: Added custom headers:`, customHeaders);
    }

    console.log('API Client: All headers being sent:', headers);
    console.log(`API Client: Final headers:`, headers);

    // For GET/HEAD requests, don't include body even if data is provided
    const shouldIncludeBody = method.toUpperCase() !== 'GET' && method.toUpperCase() !== 'HEAD';
    
    if (data && shouldIncludeBody) {
      const dataString = JSON.stringify(data);
      console.log('API Client: Request data size:', dataString.length + ' bytes');
      console.log(`API Client: Request data:`, JSON.stringify(data, null, 2));
    } else if (data && !shouldIncludeBody) {
      console.log('API Client: Data provided but not included in body for GET/HEAD request:', data);
    } else {
      console.log('API Client: No request data.');
    }

    try {
      console.log(`API Client: Making fetch request to ${this.baseURL}${endpoint}`);

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method,
        headers,
        body: (data && shouldIncludeBody) ? JSON.stringify(data) : undefined,
      });

      console.log(`API Client: Response status: ${response.status} ${response.statusText} at ${new Date().toISOString()}`);
      const responseHeaders: { [key: string]: string } = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      console.log('API Client: Response headers:', responseHeaders);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Client: ERROR Response body:`, errorText);
        console.error(`API Client: ERROR Details:`, {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url: `${this.baseURL}${endpoint}`,
          method,
          headers,
          requestData: data
        });
        console.log(`=== API CLIENT REQUEST ERROR END ===\n`);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // Handle empty responses (common with DELETE requests)
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');

      if (contentLength === '0' || !contentType?.includes('application/json')) {
        console.log(`API Client: Empty or non-JSON response`);
        console.log(`=== API CLIENT REQUEST SUCCESS END ===\n`);
        return {} as T;
      }

      const result = await response.json();
      console.log(`API Client: SUCCESS Response:`, result);
      console.log(`=== API CLIENT REQUEST SUCCESS END ===\n`);

      // Auto-invalidate cache for mutation operations
      if (method !== 'GET' && endpoint.includes('/games/')) {
        const gameIdMatch = endpoint.match(/\/games\/(\d+)/);
        if (gameIdMatch) {
          const gameId = parseInt(gameIdMatch[1]);
          // Import dynamically to avoid circular dependency
          import('./cacheInvalidation').then(({ invalidateGameData }) => {
            invalidateGameData(gameId);
          });
        }
      }

      return result;
    } catch (error) {
      console.error(`API Client: Request failed with error:`, error);
      console.error('\n=== API CLIENT ERROR ===');
      console.error('API Client Error at:', new Date().toISOString());
      console.error('API Client Error details:', {
        endpoint: `${this.baseURL}${endpoint}`,
        method,
        headers,
        data,
        error: error instanceof Error ? { message: error.message, stack: error.stack } : error
      });
      console.error('API Client Error message:', error instanceof Error ? error.message : String(error));
      console.error('API Client Error stack:', error instanceof Error ? error.stack : undefined);
      console.log(`=== API CLIENT REQUEST FAILURE END ===\n`);
      throw error;
    }
  }

  // HTTP method helpers
  async get<T>(endpoint: string, queryParams?: any, additionalHeaders?: Record<string, string>): Promise<T> {
    // For GET requests, don't pass queryParams as data since they shouldn't be in the body
    return this.request<T>('GET', endpoint, undefined, additionalHeaders);
  }

  async post<T>(endpoint: string, data?: any, customHeaders?: Record<string, string>): Promise<T> {
    return this.request<T>('POST', endpoint, data, customHeaders);
  }

  async put<T>(endpoint: string, data?: any, customHeaders?: Record<string, string>): Promise<T> {
    return this.request<T>('PUT', endpoint, data, customHeaders);
  }

  async patch<T>(endpoint: string, data?: any, customHeaders?: Record<string, string>): Promise<T> {
    return this.request<T>('PATCH', endpoint, data, customHeaders);
  }

  async delete<T>(endpoint: string, customHeaders?: Record<string, string>): Promise<T> {
    return this.request<T>('DELETE', endpoint, undefined, customHeaders);
  }
}

export const apiClient = new ApiClient();

// Helper function for mutations with automatic cache invalidation
export async function mutateWithInvalidation<T>(
  mutationFn: () => Promise<T>,
  invalidatePatterns: (string | (string | number | undefined)[])[]
): Promise<T> {
  const result = await mutationFn();

  // Invalidate queries after successful mutation
  invalidatePatterns.forEach(pattern => {
    if (Array.isArray(pattern)) {
      // Filter out undefined values from the array
      const cleanPattern = pattern.filter(p => p !== undefined);
      queryClient.invalidateQueries({ queryKey: cleanPattern });
    } else {
      queryClient.invalidateQueries({ queryKey: [pattern] });
    }
  });

  return result;
}

// Legacy export for backward compatibility - creating a unified request method
export const apiRequest = async (method: string, url: string, data?: any) => {
  switch (method.toUpperCase()) {
    case 'GET':
      return apiClient.request(method, url);
    case 'POST':
      return apiClient.request(method, url, data);
    case 'PATCH':
      return apiClient.request(method, url, data);
    case 'DELETE':
      return apiClient.request(method, url);
    default:
      throw new Error(`Unsupported HTTP method: ${method}`);
  }
};