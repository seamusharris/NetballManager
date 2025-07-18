/**
 * Smart Response Middleware
 * 
 * Automatically wraps legacy responses in standardized format while preserving
 * backward compatibility and allowing gradual migration
 */

import { Request, Response, NextFunction } from 'express';
import { createSuccessResponse, createErrorResponse, ErrorCodes } from './api-response-standards';
import camelcaseKeys from 'camelcase-keys';

interface SmartMiddlewareOptions {
  enabled: boolean;
  wrapLegacyResponses: boolean;
  skipPatterns: string[];
  forceStandardize: string[];
  logUsage: boolean;
}

// Track endpoint usage for analysis
const endpointUsage = new Map<string, {
  count: number;
  lastUsed: Date;
  responseFormat: 'legacy' | 'standardized' | 'wrapped';
  userAgent?: string;
}>();

/**
 * Detects if a response is already standardized
 */
function isStandardizedResponse(data: any): boolean {
  return data && typeof data === 'object' && (
    (data.data !== undefined && data.meta !== undefined) ||
    (data.error !== undefined && typeof data.error === 'object' && data.error.code !== undefined)
  );
}

/**
 * Detects if a response is a simple error format
 */
function isSimpleError(data: any): boolean {
  return data && typeof data === 'object' && data.error && typeof data.error === 'string';
}

/**
 * Checks if URL matches any pattern
 */
function matchesPattern(url: string, patterns: string[]): boolean {
  return patterns.some(pattern => {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return regex.test(url);
  });
}

/**
 * Smart response middleware that wraps legacy responses
 */
export function smartResponseMiddleware(options: SmartMiddlewareOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;
    const endpoint = `${req.method} ${req.path}`;
    
    // Track usage
    if (options.logUsage) {
      const usage = endpointUsage.get(endpoint) || { 
        count: 0, 
        lastUsed: new Date(), 
        responseFormat: 'legacy',
        userAgent: req.headers['user-agent']
      };
      usage.count++;
      usage.lastUsed = new Date();
      usage.userAgent = req.headers['user-agent'];
      endpointUsage.set(endpoint, usage);
    }
    
    // Skip if middleware is disabled
    if (!options.enabled) {
      return next();
    }
    
    // Skip if URL matches skip patterns
    if (matchesPattern(req.path, options.skipPatterns)) {
      return next();
    }
    
    // Override res.json to intercept responses
    res.json = function(data: any) {
      // Determine if we should wrap this response
      const shouldWrap = options.wrapLegacyResponses && (
        options.forceStandardize.length === 0 || 
        matchesPattern(req.path, options.forceStandardize)
      );
      
      let responseData = data;
      
      if (shouldWrap) {
        // Track response format
        if (options.logUsage) {
          const usage = endpointUsage.get(endpoint)!;
          if (isStandardizedResponse(data)) {
            usage.responseFormat = 'standardized';
          } else {
            usage.responseFormat = 'wrapped';
          }
        }
        
        // Skip wrapping if already standardized
        if (!isStandardizedResponse(data)) {
          // Handle simple error format
          if (isSimpleError(data)) {
            responseData = createErrorResponse(
              ErrorCodes.INTERNAL_ERROR,
              data.error
            );
          }
          // Handle success responses (wrap legacy format)
          else if (res.statusCode >= 200 && res.statusCode < 300) {
            responseData = createSuccessResponse(data, {
              requestId: req.headers['x-request-id'] as string
            });
          }
          // Handle error responses
          else if (res.statusCode >= 400) {
            const errorCode = res.statusCode >= 500 ? ErrorCodes.INTERNAL_ERROR : ErrorCodes.INVALID_REQUEST;
            responseData = createErrorResponse(
              errorCode,
              data.message || data.error || 'An error occurred',
              process.env.NODE_ENV === 'development' ? data : undefined
            );
          }
        }
      }
      
      // Apply case conversion to final response (integrated case conversion)
      if (responseData && typeof responseData === 'object') {
        // Skip conversion for specific endpoints that need to maintain original case
        const skipConversionPaths = [
          '/api/games/stats/batch',
          '/api/games/scores/batch',
          '/api/clubs/*/games/stats/batch',
          '/api/clubs/*/games/scores/batch',
          '/api/debug/*',
          '/api/admin/*'
        ];
        
        const shouldSkipConversion = skipConversionPaths.some(pattern => {
          const regex = new RegExp(pattern.replace('*', '\\d+'));
          return regex.test(req.path);
        });
        
        if (!shouldSkipConversion) {
          responseData = camelcaseKeys(responseData, { deep: true });
        }
      }
      
      return originalJson.call(this, responseData);
    };
    
    next();
  };
}

/**
 * Get endpoint usage statistics
 */
export function getEndpointUsageStats() {
  const stats = Array.from(endpointUsage.entries()).map(([endpoint, usage]) => ({
    endpoint,
    ...usage
  }));
  
  return {
    totalEndpoints: stats.length,
    totalRequests: stats.reduce((sum, stat) => sum + stat.count, 0),
    endpoints: stats.sort((a, b) => b.count - a.count),
    mostUsed: stats.slice(0, 10),
    leastUsed: stats.filter(s => s.count <= 2).slice(0, 10),
    formatBreakdown: {
      legacy: stats.filter(s => s.responseFormat === 'legacy').length,
      standardized: stats.filter(s => s.responseFormat === 'standardized').length,
      wrapped: stats.filter(s => s.responseFormat === 'wrapped').length
    }
  };
}

/**
 * Register usage stats endpoint
 */
export function registerUsageStatsEndpoint(app: any) {
  app.get('/api/admin/usage-stats', (req: Request, res: Response) => {
    const stats = getEndpointUsageStats();
    res.json(createSuccessResponse(stats));
  });
}