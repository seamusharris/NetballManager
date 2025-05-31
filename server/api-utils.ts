
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

export function flattenRelationshipData(data: any, relationships: Record<string, string[]>): any {
  const result = { ...data };
  
  for (const [relationshipName, fields] of Object.entries(relationships)) {
    const relationshipData = result[relationshipName];
    
    if (relationshipData) {
      // Add flattened fields with prefixes
      for (const field of fields) {
        const flatKey = `${relationshipName}${field.charAt(0).toUpperCase() + field.slice(1)}`;
        result[flatKey] = relationshipData[field];
      }
      
      // Remove the nested object (optional - keep for backward compatibility)
      // delete result[relationshipName];
    }
  }
  
  return result;
}

// Example usage:
// const gameWithFlatData = flattenRelationshipData(game, {
//   season: ['id', 'name', 'year'],
//   opponent: ['id', 'teamName', 'primaryContact']
// });
