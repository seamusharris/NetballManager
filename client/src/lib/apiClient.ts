// Simple, robust API client
let currentClubId: number | null = null;

export const apiClient = {
  setCurrentClubId(clubId: number | null) {
    currentClubId = clubId;
    if (clubId) {
      localStorage.setItem('currentClubId', clubId.toString());
    }
  },

  getCurrentClubId(): number | null {
    if (currentClubId) return currentClubId;

    const stored = localStorage.getItem('currentClubId');
    if (stored) {
      currentClubId = parseInt(stored, 10);
      return currentClubId;
    }

    return null;
  },

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Routes that don't need club headers
    const excludedRoutes = [
      '/api/user/clubs',
      '/api/auth',
      '/api/seasons',
    ];

    const isExcludedRoute = excludedRoutes.some(route => endpoint.includes(route));

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    // Add club ID header for non-excluded routes
    const clubId = this.getCurrentClubId();
    if (clubId && !isExcludedRoute) {
      headers['x-current-club-id'] = clubId.toString();
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(endpoint, config);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      if (!text) return null as T;

      try {
        return JSON.parse(text);
      } catch {
        return text as T;
      }
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  },

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  },

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  },
};