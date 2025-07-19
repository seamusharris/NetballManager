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
    const { convertRequest, convertResponse, config } = shouldConvertEndpoint(req.path);

    // Handle request body conversion
    if (convertRequest && req.body && typeof req.body === 'object') {
      if (config?.fieldMappings) {
        // Use specific field mappings for precise control
        req.body = applyFieldMappings(req.body, config.fieldMappings);
      } else {
        // Use general snake_case conversion
        req.body = snakecaseKeys(req.body, { deep: true });
      }
    }

    // Handle response conversion
    if (convertResponse) {
      const originalJson = res.json;
      res.json = function(data: any) {
        if (data && typeof data === 'object') {
          const camelData = camelcaseKeys(data, { deep: true });
          return originalJson.call(this, camelData);
        }
        return originalJson.call(this, data);
      };
    }

    next();
  };
}

/**
 * Legacy case conversion function - kept for backward compatibility
 * This is now just a wrapper around the smart conversion
 */
export function standardCaseConversion() {
  return smartCaseConversion();
}