/**
 * Utility function to extract data from standardized API responses
 * Handles both old format (direct data) and new format ({ success: true, data: [...] })
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
 * Utility function to extract error from standardized API responses
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
  
  // Return generic error for unknown formats
  return 'An unknown error occurred';
}

/**
 * Helper function to update direct fetch calls to handle standardized API responses
 * 
 * @param url The URL to fetch from
 * @param options Fetch options
 * @returns The extracted data from the response
 */
export async function fetchWithExtract<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = extractApiError(errorData) || `HTTP error ${response.status}`;
    throw new Error(errorMessage);
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