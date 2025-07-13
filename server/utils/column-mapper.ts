import { camelCase, snakeCase } from 'change-case';

/**
 * Recursively converts all object keys to camelCase.
 */
export function keysToCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(keysToCamelCase);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [camelCase(k), keysToCamelCase(v)])
    );
  }
  return obj;
}

/**
 * Recursively converts all object keys to snake_case.
 */
export function keysToSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(keysToSnakeCase);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [snakeCase(k), keysToSnakeCase(v)])
    );
  }
  return obj;
} 