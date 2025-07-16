/**
 * API Response Format Standards
 * 
 * Defines consistent response formats across all API endpoints
 */

export interface ApiResponse<T = any> {
  data: T;
  meta?: ApiMeta;
  links?: ApiLinks;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: ApiMeta;
}

export interface ApiMeta {
  timestamp: string;
  requestId?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  performance?: {
    duration: number;
    queries: number;
  };
}

export interface ApiLinks {
  self?: string;
  first?: string;
  last?: string;
  prev?: string;
  next?: string;
}

/**
 * Standard success response wrapper
 */
export function createSuccessResponse<T>(
  data: T, 
  meta?: Partial<ApiMeta>, 
  links?: ApiLinks
): ApiResponse<T> {
  return {
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    },
    ...(links && { links })
  };
}

/**
 * Standard error response wrapper
 */
export function createErrorResponse(
  code: string,
  message: string,
  details?: any,
  meta?: Partial<ApiMeta>
): ApiErrorResponse {
  return {
    error: {
      code,
      message,
      ...(details && { details })
    },
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    }
  };
}

/**
 * Standard error codes
 */
export const ErrorCodes = {
  // Client Errors (4xx)
  INVALID_REQUEST: 'INVALID_REQUEST',
  INVALID_PARAMETER: 'INVALID_PARAMETER', 
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  
  // Server Errors (5xx)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE'
} as const;

/**
 * Response format middleware
 */
export function standardizeResponse() {
  return (req: any, res: any, next: any) => {
    const originalJson = res.json;
    
    res.json = function(data: any) {
      // Skip standardization for already standardized responses
      if (data && (data.data !== undefined || data.error !== undefined)) {
        return originalJson.call(this, data);
      }
      
      // Skip standardization for error responses that should remain as-is
      if (data && data.error && typeof data.error === 'string') {
        return originalJson.call(this, data);
      }
      
      // Wrap successful responses
      const standardResponse = createSuccessResponse(data);
      return originalJson.call(this, standardResponse);
    };
    
    next();
  };
}

/**
 * Error handling middleware
 */
export function standardizeErrors() {
  return (err: any, req: any, res: any, next: any) => {
    console.error('API Error:', err);
    
    // Determine error code and message
    let code = ErrorCodes.INTERNAL_ERROR;
    let message = 'An internal error occurred';
    let statusCode = 500;
    
    if (err.name === 'ValidationError') {
      code = ErrorCodes.VALIDATION_ERROR;
      message = 'Validation failed';
      statusCode = 400;
    } else if (err.message?.includes('not found')) {
      code = ErrorCodes.RESOURCE_NOT_FOUND;
      message = err.message;
      statusCode = 404;
    } else if (err.message?.includes('invalid input syntax')) {
      code = ErrorCodes.INVALID_PARAMETER;
      message = 'Invalid parameter format';
      statusCode = 400;
    }
    
    const errorResponse = createErrorResponse(
      code,
      message,
      process.env.NODE_ENV === 'development' ? err.stack : undefined
    );
    
    res.status(statusCode).json(errorResponse);
  };
}