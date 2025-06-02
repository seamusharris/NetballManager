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

    // Always get the current club ID from localStorage for each request
    let currentClubId = localStorage.getItem('currentClubId');

    // Define routes that explicitly don't need club ID
    const excludedRoutes = ['/api/user/clubs', '/api/seasons'];
    const isExcludedRoute = excludedRoutes.some(route => endpoint.includes(route));

    // For most API endpoints, wait for club ID if not available yet
    if (!isExcludedRoute && !currentClubId) {
      console.warn('No club ID found for', endpoint, '- waiting for initialization...');
      
      // Wait longer for club context to initialize, with retries
      for (let i = 0; i < 15; i++) {
        await new Promise(resolve => setTimeout(resolve, 150));
        currentClubId = localStorage.getItem('currentClubId');
        if (currentClubId) {
          console.log('Club ID found after retry:', currentClubId);
          break;
        }
      }

      // If still no club ID and it's not an excluded route, throw an error
      if (!currentClubId) {
        console.error('Failed to get club ID for:', endpoint);
        throw new Error('Club context not available - please refresh the page');
      }
    }

    // Log for debugging
    console.log(`API Request to ${endpoint} with club ID: ${currentClubId}`);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Include club ID header for all routes except explicitly excluded ones
    if (currentClubId && !isExcludedRoute) {
      headers['x-current-club-id'] = currentClubId;
      console.log(`API Request to ${endpoint} with club ID: ${currentClubId}`);
    } else if (!isExcludedRoute) {
      console.warn(`API Request to ${endpoint} WITHOUT club ID header`);
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        // Better error handling with response details
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.log('API Error Response (JSON):', errorData);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          console.log('Error parsing error response:', parseError);
        }
        throw new Error(errorMessage);
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