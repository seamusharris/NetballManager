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
  private baseURL: string;
  private clubContext: { currentClubId: number | null } = { currentClubId: null };

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || '';
  }

  setClubContext(context: { currentClubId: number | null }) {
    this.clubContext = context;
  }

  async request<T>(method: string, endpoint: string, data?: any): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add club ID header if available
    if (this.clubContext.currentClubId) {
      headers['x-current-club-id'] = this.clubContext.currentClubId.toString();
      console.log(`API Request to ${endpoint} with club ID: ${this.clubContext.currentClubId}`);
    }

    const config: RequestInit = {
      method,
      headers,
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.body = JSON.stringify(data);
    }

    console.log('API Request adding club ID header:', this.clubContext.currentClubId);
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
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