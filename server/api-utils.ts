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
