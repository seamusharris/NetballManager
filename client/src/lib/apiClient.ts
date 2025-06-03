import { queryClient } from './queryClient';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

import { useClub } from '../contexts/ClubContext';

// Create a singleton API client that can access club context
class ApiClient {
  private clubContextRef: { currentClubId: number | null } | null = null;

  setClubContext(clubContext: { currentClubId: number | null }) {
    this.clubContextRef = clubContext;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add club ID header if available
    if (this.clubContextRef?.currentClubId) {
      headers['x-current-club-id'] = this.clubContextRef.currentClubId.toString();
      console.log(`API Request adding club ID header: ${this.clubContextRef.currentClubId}`);
    } else {
      console.log('API Request: No club ID available for header');
    }

    return headers;
  }

  async get(url: string): Promise<any> {
    console.log(`API Request to ${url} with club ID: ${this.clubContextRef?.currentClubId}`);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('API request failed:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async post(url: string, data?: any): Promise<any> {
    console.log(`API Request to POST ${url} with club ID: ${this.clubContextRef?.currentClubId}`);
    console.log('POST data:', data);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('API POST request failed:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('API POST request failed:', error);
      throw error;
    }
  }

  async patch(url: string, data: any): Promise<any> {
    console.log(`API Request to PATCH ${url} with club ID: ${this.clubContextRef?.currentClubId}`);

    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('API PATCH request failed:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('API PATCH request failed:', error);
      throw error;
    }
  }

  async delete(url: string): Promise<any> {
    console.log(`API Request to DELETE ${url} with club ID: ${this.clubContextRef?.currentClubId}`);

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('API DELETE request failed:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      if (response.status === 204) {
        return null; // No content
      }

      return response.json();
    } catch (error) {
      console.error('API DELETE request failed:', error);
      throw error;
    }
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