/**
 * API Standardization Framework
 * 
 * This module defines the standard patterns and utilities for consistent API design
 * across the entire application.
 */

import { Request, Response, NextFunction } from 'express';
import camelcaseKeys from 'camelcase-keys';
import snakecaseKeys from 'snakecase-keys';

// ============================================================================
// STANDARD API PATTERNS
// ============================================================================

/**
 * Standard API URL Patterns
 * 
 * All APIs should follow RESTful conventions:
 * - Resource collections: /api/{resource}
 * - Individual resources: /api/{resource}/{id}
 * - Nested resources: /api/{parent}/{parentId}/{child}
 * - Actions on resources: /api/{resource}/{id}/{action}
 */

export const API_PATTERNS = {
  // Core Resources
  CLUBS: '/api/clubs',
  CLUB_BY_ID: '/api/clubs/:clubId',
  
  TEAMS: '/api/teams',
  TEAM_BY_ID: '/api/teams/:teamId',
  CLUB_TEAMS: '/api/clubs/:clubId/teams',
  
  PLAYERS: '/api/players',
  PLAYER_BY_ID: '/api/players/:playerId',
  TEAM_PLAYERS: '/api/teams/:teamId/players',
  CLUB_PLAYERS: '/api/clubs/:clubId/players',
  
  GAMES: '/api/games',
  GAME_BY_ID: '/api/games/:gameId',
  TEAM_GAMES: '/api/teams/:teamId/games',
  CLUB_GAMES: '/api/clubs/:clubId/games',
  
  // Nested Resources
  GAME_STATS: '/api/games/:gameId/stats',
  GAME_TEAM_STATS: '/api/games/:gameId/teams/:teamId/stats',
  GAME_SCORES: '/api/games/:gameId/scores',
  GAME_ROSTERS: '/api/games/:gameId/rosters',
  GAME_TEAM_ROSTERS: '/api/games/:gameId/teams/:teamId/rosters',
  
  // Batch Operations
  BATCH_GAME_STATS: '/api/games/stats/batch',
  BATCH_GAME_SCORES: '/api/games/scores/batch',
  BATCH_CLUB_GAME_STATS: '/api/clubs/:clubId/games/stats/batch',
  BATCH_CLUB_GAME_SCORES: '/api/clubs/:clubId/games/scores/batch',
  
  // Actions
  GAME_AVAILABILITY: '/api/games/:gameId/availability',
  PLAYER_BORROWING: '/api/clubs/:clubId/player-borrowing',
  GAME_PERMISSIONS: '/api/games/:gameId/permissions',
} as const;

// ============================================================================
// STANDARD RESPONSE FORMATS
// ============================================================================

export interface StandardApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    timestamp: string;
  };
}

export interface PaginatedResponse<T = any> extends StandardApiResponse<T[]> {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    timestamp: string;
  };
}

// ============================================================================
// CASE CONVERSION MIDDLEWARE
// ============================================================================

/**
 * Middleware to automatically convert request body from camelCase to snake_case
 * and response body from snake_case to camelCase
 */
export function standardCaseConversion() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Convert incoming request body to snake_case for database operations
    if (req.body && typeof req.body === 'object') {
      // Skip conversion for specific endpoints that need camelCase
      const skipConversionPaths = [
        '/api/games/stats/batch',
        '/api/games/scores/batch',
        '/api/clubs/*/games/stats/batch',
        '/api/clubs/*/games/scores/batch'
      ];
      
      const shouldSkipConversion = skipConversionPaths.some(pattern => {
        const regex = new RegExp(pattern.replace('*', '\\d+'));
        return regex.test(req.path);
      });
      
      if (!shouldSkipConversion) {
        req.body = snakecaseKeys(req.body, { deep: true });
      }
    }

    // Override res.json to convert outgoing responses to camelCase
    const originalJson = res.json;
    res.json = function(data: any) {
      if (data && typeof data === 'object') {
        // Convert to camelCase for frontend consumption
        const camelData = camelcaseKeys(data, { deep: true });
        return originalJson.call(this, camelData);
      }
      return originalJson.call(this, data);
    };

    next();
  };
}

// ============================================================================
// STANDARD RESPONSE HELPERS
// ============================================================================

export class ApiResponse {
  static success<T>(data: T, message?: string): StandardApiResponse<T> {
    return {
      success: true,
      data,
      message,
      meta: {
        timestamp: new Date().toISOString()
      }
    };
  }

  static error(error: string, statusCode: number = 400): StandardApiResponse {
    return {
      success: false,
      error,
      meta: {
        timestamp: new Date().toISOString()
      }
    };
  }

  static paginated<T>(
    data: T[],
    total: number,
    page: number,
    limit: number
  ): PaginatedResponse<T> {
    const totalPages = Math.ceil(total / limit);
    
    return {
      success: true,
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        timestamp: new Date().toISOString()
      }
    };
  }
}

// ============================================================================
// STANDARD CONTEXT HEADERS
// ============================================================================

export interface RequestContext {
  clubId?: number;
  teamId?: number;
  userId?: number;
}

/**
 * Middleware to extract and validate context headers
 */
export function extractRequestContext() {
  return (req: Request & { context?: RequestContext }, res: Response, next: NextFunction) => {
    const context: RequestContext = {};

    // Extract club context
    const clubIdHeader = req.headers['x-current-club-id'] as string;
    if (clubIdHeader) {
      const clubId = parseInt(clubIdHeader);
      if (!isNaN(clubId)) {
        context.clubId = clubId;
      }
    }

    // Extract team context
    const teamIdHeader = req.headers['x-current-team-id'] as string;
    if (teamIdHeader) {
      const teamId = parseInt(teamIdHeader);
      if (!isNaN(teamId)) {
        context.teamId = teamId;
      }
    }

    // Extract user context (if available from auth)
    if (req.user?.id) {
      context.userId = req.user.id;
    }

    // Attach context to request
    req.context = context;
    next();
  };
}

// ============================================================================
// URL STANDARDIZATION
// ============================================================================

/**
 * Map legacy URL patterns to standardized patterns
 */
export const URL_MIGRATIONS = {
  // Legacy game-centric patterns to standardized patterns
  '/api/game/:gameId/team/:teamId': '/api/games/:gameId/teams/:teamId',
  '/api/game/:gameId/team/:teamId/stats': '/api/games/:gameId/teams/:teamId/stats',
  '/api/game/:gameId/team/:teamId/rosters': '/api/games/:gameId/teams/:teamId/rosters',
  
  // Legacy stats patterns
  '/api/game-stats/:id': '/api/games/stats/:id',
  '/api/gamestats/:id': '/api/games/stats/:id',
  
  // Batch endpoint standardization
  '/api/games/stats/batch': '/api/games/stats/batch', // Already standard
  '/api/games/scores/batch': '/api/games/scores/batch', // Already standard
} as const;

/**
 * Middleware to redirect legacy URLs to standardized patterns
 */
export function standardizeUrls() {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalUrl = req.originalUrl;
    
    // Check if this is a legacy URL pattern that needs migration
    for (const [legacyPattern, standardPattern] of Object.entries(URL_MIGRATIONS)) {
      const legacyRegex = new RegExp(legacyPattern.replace(/:(\w+)/g, '(\\d+)'));
      const match = originalUrl.match(legacyRegex);
      
      if (match) {
        // Extract parameters and build new URL
        const params = match.slice(1);
        let newUrl = standardPattern;
        
        // Replace parameter placeholders with actual values
        params.forEach((param, index) => {
          newUrl = newUrl.replace(/:(\w+)/, param);
        });
        
        // Redirect to standardized URL
        return res.redirect(301, newUrl);
      }
    }
    
    next();
  };
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function validateRequiredParams(params: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const missing = params.filter(param => !req.params[param]);
    
    if (missing.length > 0) {
      return res.status(400).json(
        ApiResponse.error(`Missing required parameters: ${missing.join(', ')}`)
      );
    }
    
    next();
  };
}

export function validateRequiredContext(requirements: (keyof RequestContext)[]) {
  return (req: Request & { context?: RequestContext }, res: Response, next: NextFunction) => {
    if (!req.context) {
      return res.status(400).json(
        ApiResponse.error('Request context not initialized')
      );
    }
    
    const missing = requirements.filter(requirement => !req.context![requirement]);
    
    if (missing.length > 0) {
      return res.status(400).json(
        ApiResponse.error(`Missing required context: ${missing.join(', ')}`)
      );
    }
    
    next();
  };
}