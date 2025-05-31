import { queryClient } from './queryClient';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class ApiClient {
  private baseUrl = '';

  setCurrentClubId(clubId: number): void {
    localStorage.setItem('currentClubId', clubId.toString());
  }

  getCurrentClubId(): number | null {
    const stored = localStorage.getItem('currentClubId');
    if (stored && !isNaN(parseInt(stored, 10))) {
      return parseInt(stored, 10);
    }
    return null;
  }

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    // Add current club ID to headers if available
    const currentClubId = localStorage.getItem('currentClubId');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(currentClubId && { 'x-current-club-id': currentClubId }),
      ...options.headers,
    };

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
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