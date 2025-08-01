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
const instanceId = Math.random().toString(36).substr(2, 9);
console.log(`🔧 Smart case conversion middleware created with ID: ${instanceId}`);

export function smartCaseConversion() {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Since middleware is mounted on /api, we need to reconstruct the full path
      const fullPath = `/api${req.path}`;
      
      const { convertRequest, convertResponse, config } = shouldConvertEndpoint(fullPath);
      

      // Handle request body conversion with error handling
      if (convertRequest && req.body && typeof req.body === 'object') {
        try {
          // Always use automatic snake_case conversion for requests
          // This converts camelCase from client to snake_case for server/database
          req.body = snakecaseKeys(req.body, { deep: true });
        } catch (conversionError) {
          console.error('Request case conversion error:', conversionError);
          // Continue without conversion rather than crash
        }
      } else if (req.method === 'PATCH' && fullPath.includes('/clubs/')) {
        console.log('🚫 SKIPPING REQUEST CONVERSION (convertRequest=false)');
        console.log('🔍 Request body BEFORE/AFTER (unchanged):', JSON.stringify(req.body, null, 2));
      }

      // Handle response conversion with error handling
      if (convertResponse) {
        const originalJson = res.json;
        res.json = function(data: any) {
          try {
            if (req.path === '/players' && req.method === 'POST') {
              console.log('🎯 CONVERTING RESPONSE');
              console.log('🎯 Original response data:', JSON.stringify(data, null, 2));
            }
            
            if (data && typeof data === 'object') {
              const camelData = camelcaseKeys(data, { deep: true });
              
              if (req.path === '/players' && req.method === 'POST') {
                console.log('🎯 Converted response data:', JSON.stringify(camelData, null, 2));
              }
              
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