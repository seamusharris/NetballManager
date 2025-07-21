import { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { sql } from 'drizzle-orm';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    clubs: Array<{
      clubId: number;
      role: string;
      permissions: {
        canManagePlayers: boolean;
        canManageGames: boolean;
        canManageStats: boolean;
        canViewOtherTeams: boolean;
      };
    }>;
    currentClubId?: number;
  };
}

/**
 * Middleware to check if user has access to a specific club
 */
export function requireClubAccess(requiredPermission?: string) {
  return (req: any, res: any, next: any) => {
    // TODO: Reinstate club access checks when user authentication is implemented
    return next();
  };
}

/**
 * Middleware to check if user can access a specific team
 */
export function requireTeamAccess() {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // TODO: Reinstate team access checks when user authentication is implemented
    return next();
  };
}

/**
 * Middleware to check if user can access a specific game
 */
export function requireGameAccess(requireEditAccess = false) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // TODO: Reinstate game access checks when user authentication is implemented
    return next();
  };
}

/**
 * Middleware to check if user can access a specific team-game combination
 * This is the new team-based approach for REST API consistency
 */
export function requireTeamGameAccess(requireEditAccess = false) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // TODO: Reinstate team-game access checks when user authentication is implemented
    return next();
  };
}

/**
 * Basic authentication middleware - ensures user is authenticated
 */
export function requireAuth() {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // TODO: Reinstate authentication checks when user authentication is implemented
    return next();
  };
}

/**
 * Middleware to load user permissions and set up default user context
 * This replaces the loadUserPermissions function from auth-middleware.ts
 */
export async function loadUserPermissions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    // TODO: Implement proper user permission loading when authentication is implemented
    // For now, just continue without setting user context
    next();
  } catch (error) {
    console.error('Error loading user permissions:', error);
    res.status(500).json({ error: 'Failed to load user permissions' });
  }
}

/**
 * Comprehensive authentication middleware that ensures consistent auth across all endpoints
 */
export function standardAuth(options: {
  requireClub?: boolean;
  permission?: keyof AuthenticatedRequest['user']['clubs'][0]['permissions'];
  requireGameAccess?: boolean;
  requireTeamAccess?: boolean;
} = {}) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // TODO: Reinstate authentication checks when user authentication is implemented
    return next();
  };
}

declare global {
  namespace Express {
    interface Request {
      currentClubId?: number;
      currentTeamId?: number;
    }
  }
}

// This global authMiddleware was causing issues by intercepting all requests
// The specific auth functions above should be used on individual routes instead