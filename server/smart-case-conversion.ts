/**
 * Smart Case Conversion Middleware
 * 
 * Provides endpoint-specific case conversion based on configuration
 */

import { Request, Response, NextFunction } from 'express';
import camelcaseKeys from 'camelcase-keys';
import snakecaseKeys from 'snakecase-keys';
import { shouldConvertEndpoint, applyFieldMappings } from './endpoint-config';

/**
 * Smart case conversion middleware that applies conversion based on endpoint configuration
 */
export function smartCaseConversion() {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const { convertRequest, convertResponse, config } = shouldConvertEndpoint(req.path);

      // Handle request body conversion with error handling
      if (convertRequest && req.body && typeof req.body === 'object') {
        try {
          if (config?.fieldMappings) {
            // Use specific field mappings for precise control
            req.body = applyFieldMappings(req.body, config.fieldMappings);
          } else {
            // Use general snake_case conversion
            req.body = snakecaseKeys(req.body, { deep: true });
          }
        } catch (conversionError) {
          console.error('Request case conversion error:', conversionError);
          // Continue without conversion rather than crash
        }
      }

      // Handle response conversion with error handling
      if (convertResponse) {
        const originalJson = res.json;
        res.json = function(data: any) {
          try {
            if (data && typeof data === 'object') {
              const camelData = camelcaseKeys(data, { deep: true });
              return originalJson.call(this, camelData);
            }
            return originalJson.call(this, data);
          } catch (conversionError) {
            console.error('Response case conversion error:', conversionError);
            // Return original data if conversion fails
            return originalJson.call(this, data);
          }
        };
      }

      next();
    } catch (error) {
      console.error('Smart case conversion middleware error:', error);
      // Continue processing even if case conversion fails
      next();
    }
  };
}

/**
 * Legacy case conversion function - kept for backward compatibility
 * This is now just a wrapper around the smart conversion
 */
export function standardCaseConversion() {
  return smartCaseConversion();
}