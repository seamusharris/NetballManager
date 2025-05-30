import { queryClient } from './queryClient';

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  error?: string;
}

export class ApiClient {
  private baseUrl = '';

  // Get current club ID from localStorage
  private getCurrentClubId(): number | null {
    // Try to get from localStorage first
    const stored = localStorage.getItem('currentClubId');
    if (stored && !isNaN(parseInt(stored, 10))) {
      return parseInt(stored, 10);
    }

    // Return null if no valid club ID is found
    // This will be handled by the server with a fallback
    return null;
  }

  setCurrentClubId(clubId: number): void {
    localStorage.setItem('currentClubId', clubId.toString());
  }

  async request<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    data?: any,
    clubId?: number
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Auto-include current club ID if not provided and not for club-management endpoints
    const shouldIncludeClubId = !endpoint.includes('/clubs') && 
                               !endpoint.includes('/user/clubs') && 
                               !endpoint.includes('/game-statuses') &&
                               !endpoint.includes('/seasons');
    const effectiveClubId = clubId || (shouldIncludeClubId ? this.getCurrentClubId() : null);

    // Add club context to headers for all requests
    if (effectiveClubId) {
      config.headers = {
        ...config.headers,
        'X-Club-ID': effectiveClubId.toString()
      };

      // For non-GET requests, also include in body if needed
      if (method !== 'GET' && data && typeof data === 'object') {
        data.clubId = effectiveClubId;
      } else if (method !== 'GET' && !data) {
        data = { clubId: effectiveClubId };
      }
    }

    if (data && method !== 'GET') {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(url, config);

    if (method === 'DELETE' && response.status === 204) {
      return true as T;
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return await response.text() as T;
  }

  // Convenience methods
  get<T>(endpoint: string, clubId?: number): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, clubId);
  }

  post<T>(endpoint: string, data?: any, clubId?: number): Promise<T> {
    return this.request<T>('POST', endpoint, data, clubId);
  }

  put<T>(endpoint: string, data?: any, clubId?: number): Promise<T> {
    return this.request<T>('PUT', endpoint, data, clubId);
  }

  patch<T>(endpoint: string, data?: any, clubId?: number): Promise<T> {
    return this.request<T>('PATCH', endpoint, data, clubId);
  }

  delete<T>(endpoint: string, clubId?: number): Promise<T> {
    return this.request<T>('DELETE', endpoint, undefined, clubId);
  }
}

export const apiClient = new ApiClient();

// Helper function for mutations with automatic cache invalidation
export async function mutateWithInvalidation<T>(
  mutationFn: () => Promise<T>,
  invalidatePatterns: string[]
): Promise<T> {
  const result = await mutationFn();

  // Invalidate related queries
  invalidatePatterns.forEach(pattern => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey[0];
        return typeof queryKey === 'string' && queryKey.includes(pattern);
      }
    });
  });

  return result;
}

// Legacy export for backward compatibility
export const apiRequest = apiClient.request.bind(apiClient);