import { queryClient } from './queryClient';
import camelcaseKeys from 'camelcase-keys';
import snakecaseKeys from 'snakecase-keys';

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

  /**
   * Unwraps standardized API responses for backward compatibility
   * Converts { data: [...], meta: {...} } back to [...]
   */
  private unwrapStandardizedResponse<T>(response: any): T {
    // Check if this is a standardized success response
    if (response && typeof response === 'object' && response.data !== undefined && response.meta !== undefined) {
      console.log('API Client: Detected standardized response, unwrapping data');
      return response.data;
    }
    
    // Check if this is a standardized error response
    if (response && typeof response === 'object' && response.error !== undefined && typeof response.error === 'object') {
      console.log('API Client: Detected standardized error response');
      // For errors, we might want to throw or handle differently
      // For now, return as-is to maintain error handling
      return response;
    }
    
    // Return as-is for legacy responses
    return response;
  }

  async request<T>(method: string, endpoint: string, data?: any, customHeaders?: Record<string, string>): Promise<T> {
    console.log(`\n=== API CLIENT REQUEST START ===`);
    console.log(`API Client: ${method} ${endpoint} at ${new Date().toISOString()}`);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Get club context if not already set - try multiple sources
    if (!this.clubContext.currentClubId) {
      // Try to get from URL first (most reliable)
      const urlMatch = window.location.pathname.match(/\/club\/(\d+)|\/team\/(\d+)/);
      if (urlMatch) {
        const clubIdFromUrl = urlMatch[1];
        const teamIdFromUrl = urlMatch[2];

        if (clubIdFromUrl) {
          this.clubContext.currentClubId = parseInt(clubIdFromUrl);
        } else if (teamIdFromUrl) {
          // For team URLs, we need to map team to club - for now use a default
          // This should be improved to look up the team's club
          this.clubContext.currentClubId = 54; // Default to current club for now
        }
      }
    }

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

    let requestBody: any = undefined;
    if (data) {
      // Bypass snakecaseKeys for batch scores/stats endpoints that require camelCase
      const isCamelCaseBatchEndpoint =
        endpoint.includes('/games/scores/batch') ||
        endpoint.includes('/games/stats/batch');
      if (isCamelCaseBatchEndpoint) {
        requestBody = JSON.stringify(data);
        console.log('API Client: Request data (camelCase, no snakecaseKeys):', JSON.stringify(data, null, 2));
      } else {
        const snakeData = snakecaseKeys(data, { deep: true });
        requestBody = JSON.stringify(snakeData);
        console.log('API Client: Request data (snake_case):', JSON.stringify(snakeData, null, 2));
      }
      console.log('API Client: Request data size:', requestBody.length + ' bytes');
    } else {
      console.log('API Client: No request data.');
    }

    try {
      console.log(`API Client: Making fetch request to ${this.baseURL}${endpoint}`);

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method,
        headers,
        body: data ? requestBody : undefined,
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
      const camelResult = camelcaseKeys(result, { deep: true });
      
      // Auto-unwrap standardized responses for backward compatibility
      const unwrappedResult = this.unwrapStandardizedResponse(camelResult);
      
      console.log(`API Client: SUCCESS Response (camelCase):`, camelResult);
      if (unwrappedResult !== camelResult) {
        console.log(`API Client: Unwrapped standardized response`);
      }
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

      return unwrappedResult;
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
  async get<T>(endpoint: string, customHeaders?: Record<string, string>): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, customHeaders);
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

export const apiClient = new ApiClient('http://localhost:3000');

// Helper function for mutations with automatic cache invalidation
export async function mutateWithInvalidation<T>(
  method: string,
  url: string,
  data?: any,
  options?: {
    invalidatePattern?: string;
    onSuccess?: () => void;
    onError?: (error: any) => void;
    smartInvalidation?: {
      type: 'GAME_STATS' | 'GAME_SCORES' | 'GAME_STATUS' | 'ROSTER_CHANGES';
      gameId: number;
      context?: {
        teamId?: number;
        clubId?: number;
        isLiveGame?: boolean;
      };
    };
  }
): Promise<any> {
  try {
    const response = await apiClient.request<T>(method, url, data);

    // Success callback
    if (options?.onSuccess) {
      options.onSuccess();
    }

    // Smart hierarchical invalidation (preferred)
    if (options?.smartInvalidation) {
      const { SmartCacheInvalidator } = await import('./cacheInvalidation');
      const invalidator = SmartCacheInvalidator.getInstance();
      await invalidator.invalidateGameData(
        options.smartInvalidation.gameId,
        options.smartInvalidation.type,
        options.smartInvalidation.context
      );
    }
    // Fallback to pattern-based cache invalidation
    else if (options?.invalidatePattern) {
      console.log(`Invalidating cache pattern: ${options.invalidatePattern}`);
      await queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey[0];
          return typeof queryKey === 'string' && queryKey.includes(options.invalidatePattern!);
        }
      });
    }

    return response;
  } catch (error) {
    if (options?.onError) {
      options.onError(error);
    }
    throw error;
  }
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