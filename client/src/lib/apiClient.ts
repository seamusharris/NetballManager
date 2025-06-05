import { queryClient } from './queryClient';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

import { useClub } from '../contexts/ClubContext';

// Get current club ID for requests
function getCurrentClubId(): string | null {
  // Try to get from localStorage first (use consistent key with ClubContext)
  const savedClubId = localStorage.getItem('currentClubId');
  if (savedClubId) {
    return savedClubId;
  }
  return null;
}

// Get current team ID for requests
function getCurrentTeamId(): string | null {
  const savedTeamId = localStorage.getItem('current-team-id');
  if (savedTeamId) {
    return savedTeamId;
  }
  return null;
}

// Create a singleton API client that can access club context
export class ApiClient {
  private baseURL: string;
  private clubContext: { currentClubId: number | null } = { currentClubId: null };

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
  }

  setClubContext(context: { currentClubId: number | null }) {
    this.clubContext = context;
    console.log('API Client: Club context set to:', context.currentClubId);
  }

  async request<T>(method: string, endpoint: string, data?: any, customHeaders?: Record<string, string>): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add club context header if available
    const clubId = getCurrentClubId();
    if (clubId) {
      headers['x-current-club-id'] = clubId;
    }

    // Add team context header if available, but respect custom header overrides
    const teamId = getCurrentTeamId();
    if (teamId && (!customHeaders || !customHeaders.hasOwnProperty('x-current-team-id'))) {
      headers['x-current-team-id'] = teamId;
    }

    // Apply custom headers (these can override defaults)
    if (customHeaders) {
      Object.assign(headers, customHeaders);

      // Special handling for empty string values to clear headers
      Object.keys(customHeaders).forEach(key => {
        if (customHeaders[key] === '') {
          delete headers[key];
        }
      });
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