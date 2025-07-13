
/**
 * Utility functions for consistent API data transformation
 */

export function transformToApiFormat(data: any): any {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => transformToApiFormat(item));
  }
  
  if (typeof data === 'object') {
    const transformed: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      // Convert snake_case to camelCase
      const camelKey = snakeToCamel(key);
      transformed[camelKey] = transformToApiFormat(value);
    }
    
    return transformed;
  }
  
  return data;
}

export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
}
