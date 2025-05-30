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
    const stored = localStorage.getItem('currentClubId');
    return stored ? parseInt(stored, 10) : null;
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
    const effectiveClubId = clubId || (!endpoint.includes('/clubs') && !endpoint.includes('/user/clubs') ? this.getCurrentClubId() : null);

    // Add club context to headers or query params
    if (effectiveClubId) {
      if (method === 'GET') {
        const urlObj = new URL(url, window.location.origin);
        urlObj.searchParams.set('clubId', effectiveClubId.toString());
        endpoint = urlObj.pathname + urlObj.search;
      } else if (data) {
        data.clubId = effectiveClubId;
      } else {
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