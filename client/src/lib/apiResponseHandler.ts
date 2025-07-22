/**
 * API Response Handler
 * 
 * This module provides utility functions for handling API responses consistently
 * across the application, supporting both standardized and legacy response formats.
 */

/**
 * Standard API response format
 */
export interface StandardApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    count?: number;
    page?: number;
    total?: number;
  };
}

/**
 * Extract data from an API response, handling both standardized and legacy formats
 * 
 * @param response The API response to extract data from
 * @returns The extracted data
 */
export function extractApiData<T>(response: any): T {
  // Check if this is a standardized success response with data property
  if (response && 
      typeof response === 'object' && 
      response.hasOwnProperty('data')) {
    return response.data;
  }
  
  // Return as-is for legacy responses or if data property doesn't exist
  return response;
}

/**
 * Extract error message from an API response
 * 
 * @param response The API error response
 * @returns The extracted error message
 */
export function extractApiError(response: any): string {
  // Check if this is a standardized error response
  if (response && 
      typeof response === 'object' && 
      response.hasOwnProperty('error')) {
    
    // Handle both string errors and object errors
    if (typeof response.error === 'string') {
      return response.error;
    }
    
    if (typeof response.error === 'object' && response.error.message) {
      return response.error.message;
    }
  }
  
  // Handle legacy error format with message property
  if (response && 
      typeof response === 'object' && 
      response.hasOwnProperty('message')) {
    return response.message;
  }
  
  // Return generic error for unknown formats
  return 'An unknown error occurred';
}

/**
 * Helper function to make API requests with standardized response handling
 * 
 * @param url The URL to fetch from
 * @param options Fetch options
 * @returns The extracted data from the response
 */
export async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    // Try to parse error response
    try {
      const errorData = await response.json();
      const errorMessage = extractApiError(errorData);
      throw new Error(errorMessage);
    } catch (e) {
      // If parsing fails, throw generic error with status code
      throw new Error(`HTTP error ${response.status}`);
    }
  }
  
  // Handle 204 No Content responses
  if (response.status === 204) {
    return {} as T;
  }
  
  // Check if there's content to parse
  const contentType = response.headers.get('content-type');
  const contentLength = response.headers.get('content-length');
  
  if (contentLength === '0' || !contentType?.includes('application/json')) {
    return {} as T;
  }
  
  const result = await response.json();
  return extractApiData<T>(result);
}

/**
 * Create a standardized API response
 * 
 * @param data The data to include in the response
 * @param meta Optional metadata
 * @returns A standardized API response
 */
export function createApiResponse<T>(data: T, meta?: any): StandardApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    }
  };
}

/**
 * Create a standardized API error response
 * 
 * @param code The error code
 * @param message The error message
 * @param details Optional error details
 * @returns A standardized API error response
 */
export function createApiErrorResponse(code: string, message: string, details?: any): StandardApiResponse<never> {
  return {
    success: false,
    error: {
      code,
      message,
      details
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  };
}