import { keysToCamelCase } from './utils/column-mapper';
import { getEndpointConfig, applyFieldMappings } from './endpoint-config';
import camelcaseKeys from 'camelcase-keys';

/**
 * Utility functions for consistent API data transformation
 */

/**
 * Transform data to API format with endpoint-specific field mappings
 * @param data - The data to transform
 * @param endpointPath - Optional endpoint path for specific field mappings
 */
export function transformToApiFormat(data: any, endpointPath?: string): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  // If we have an endpoint path, try to get specific configuration
  if (endpointPath) {
    const config = getEndpointConfig(endpointPath);
    
    if (config?.fieldMappings && config.convertResponse) {
      // Apply reverse field mappings (snake_case → camelCase)
      const reverseMapping: Record<string, string> = {};
      for (const [camelCase, snake_case] of Object.entries(config.fieldMappings)) {
        reverseMapping[snake_case] = camelCase;
      }
      
      // Apply reverse mappings first, then general camelCase conversion for unmapped fields
      const mappedData = applyFieldMappings(data, reverseMapping);
      return camelcaseKeys(mappedData, { deep: true });
    }
  }

  // Fallback to generic camelCase conversion
  return keysToCamelCase(data);
}

/**
 * Standard API Response Utilities
 * Creates consistent response formats across all endpoints
 */

export interface ApiMeta {
  timestamp: string;
  count?: number;
  page?: number;
  total?: number;
  [key: string]: any;
}

export interface ApiSuccessResponse<T = any> {
  data: T;
  meta: ApiMeta;
  success: true;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
  meta: ApiMeta;
  success: false;
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(
  data: T, 
  meta: Partial<ApiMeta> = {}
): ApiSuccessResponse<T> {
  const baseMeta: ApiMeta = {
    timestamp: new Date().toISOString(),
    ...meta
  };

  // Add count for arrays
  if (Array.isArray(data)) {
    baseMeta.count = data.length;
  }

  return {
    data,
    meta: baseMeta,
    success: true
  };
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  code: string,
  message: string,
  details?: any,
  meta: Partial<ApiMeta> = {}
): ApiErrorResponse {
  return {
    error: {
      code,
      message,
      details
    },
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    },
    success: false
  };
}

/**
 * Create a standardized array response with count
 */
export function createArrayResponse<T>(
  data: T[],
  meta: Partial<ApiMeta> = {}
): ApiSuccessResponse<T[]> {
  return createSuccessResponse(data, {
    count: data.length,
    ...meta
  });
}

/**
 * Create a standardized paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  total: number,
  meta: Partial<ApiMeta> = {}
): ApiSuccessResponse<T[]> {
  return createSuccessResponse(data, {
    count: data.length,
    page,
    total,
    ...meta
  });
}
