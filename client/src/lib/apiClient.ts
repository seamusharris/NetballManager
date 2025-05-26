
import { queryClient } from './queryClient';

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  error?: string;
}

export class ApiClient {
  private baseUrl = '';

  async request<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    data?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

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
  get<T>(endpoint: string): Promise<T> {
    return this.request<T>('GET', endpoint);
  }

  post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>('POST', endpoint, data);
  }

  put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>('PUT', endpoint, data);
  }

  patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>('PATCH', endpoint, data);
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>('DELETE', endpoint);
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
