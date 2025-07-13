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
    try {
      const teamId = req.params.teamId || req.query.teamId || req.body.teamId;

      if (!teamId) {
        return res.status(400).json({ error: 'Team ID required' });
      }

      if (!req.user?.currentClubId) {
        return res.status(403).json({ error: 'Club context required' });
      }

      // Verify team belongs to user's current club
      const teamResult = await db.execute(sql`
        SELECT club_id FROM teams WHERE id = ${teamId};
      `);

      if (teamResult.rows.length === 0) {
        return res.status(404).json({ error: 'Team not found' });
      }

      if (teamResult.rows[0].club_id !== req.user.currentClubId) {
        return res.status(403).json({ error: 'Access denied to this team' });
      }

      next();
    } catch (error) {
      console.error('Team access check error:', error);
      res.status(500).json({ error: 'Team authorization check failed' });
    }
  };
}

/**
 * Middleware to check if user can access a specific game
 */
export function requireGameAccess(requireEditAccess = false) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const gameId = req.params.gameId || req.params.id || req.query.gameId;

      if (!gameId) {
        return res.status(400).json({ error: 'Game ID required' });
      }

      if (!req.user?.currentClubId) {
        return res.status(403).json({ error: 'Club context required' });
      }

      // Check if user's club has access to this game
      const accessResult = await db.execute(sql`
        SELECT 
          g.id,
          g.home_team_id,
          g.away_team_id,
          ht.club_id as home_club_id,
          at.club_id as away_club_id,
          gp.can_edit_stats,
          gp.can_view_detailed_stats
        FROM games g
        LEFT JOIN teams ht ON g.home_team_id = ht.id
        LEFT JOIN teams at ON g.away_team_id = at.id
        LEFT JOIN game_permissions gp ON g.id = gp.game_id AND gp.club_id = ${req.user.currentClubId}
        WHERE g.id = ${gameId};
      `);

      if (accessResult.rows.length === 0) {
        return res.status(404).json({ error: 'Game not found' });
      }

      const game = accessResult.rows[0];
      const userClubId = req.user.currentClubId;

      // Check if user's club is involved in the game
      const hasDirectAccess = game.home_club_id === userClubId || game.away_club_id === userClubId;
      const hasPermissionAccess = game.can_view_detailed_stats || game.can_edit_stats;

      if (!hasDirectAccess && !hasPermissionAccess) {
        return res.status(403).json({ error: 'Access denied to this game' });
      }

      // Check edit access if required
      if (requireEditAccess) {
        const canEdit = hasDirectAccess || game.can_edit_stats;
        if (!canEdit) {
          return res.status(403).json({ error: 'Edit access denied for this game' });
        }
      }

      next();
    } catch (error) {
      console.error('Game access check error:', error);
      res.status(500).json({ error: 'Game authorization check failed' });
    }
  };
}

/**
 * Middleware to check if user can access a specific game via team context
 * This is the new team-based approach for REST API consistency
 */
export function requireTeamGameAccess(requireEditAccess = false) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const teamId = req.params.teamId;
      const gameId = req.params.gameId;

      if (!teamId || !gameId) {
        return res.status(400).json({ error: 'Team ID and Game ID required' });
      }

      if (!req.user?.currentClubId) {
        return res.status(403).json({ error: 'Club context required' });
      }

      // Verify team belongs to user's club and is involved in the game
      const accessResult = await db.execute(sql`
        SELECT 
          g.id,
          g.home_team_id,
          g.away_team_id,
          t.club_id as team_club_id,
          ht.club_id as home_club_id,
          at.club_id as away_club_id,
          gp.can_edit_stats,
          gp.can_view_detailed_stats
        FROM games g
        LEFT JOIN teams t ON t.id = ${teamId}
        LEFT JOIN teams ht ON g.home_team_id = ht.id
        LEFT JOIN teams at ON g.away_team_id = at.id
        LEFT JOIN game_permissions gp ON g.id = gp.game_id AND gp.club_id = ${req.user.currentClubId}
        WHERE g.id = ${gameId} AND (g.home_team_id = ${teamId} OR g.away_team_id = ${teamId});
      `);

      if (accessResult.rows.length === 0) {
        return res.status(404).json({ error: 'Game not found or team not involved in this game' });
      }

      const result = accessResult.rows[0];
      const userClubId = req.user.currentClubId;

      // Verify team belongs to user's club
      if (result.team_club_id !== userClubId) {
        return res.status(403).json({ error: 'Access denied to this team' });
      }

      // Check if user's club has access to this game
      const hasDirectAccess = result.home_club_id === userClubId || result.away_club_id === userClubId;
      const hasPermissionAccess = result.can_view_detailed_stats || result.can_edit_stats;

      if (!hasDirectAccess && !hasPermissionAccess) {
        return res.status(403).json({ error: 'Access denied to this game' });
      }

      // Check edit access if required
      if (requireEditAccess) {
        const canEdit = hasDirectAccess || result.can_edit_stats;
        if (!canEdit) {
          return res.status(403).json({ error: 'Edit access denied for this game' });
        }
      }

      next();
    } catch (error) {
      console.error('Team game access check error:', error);
      res.status(500).json({ error: 'Team game authorization check failed' });
    }
  };
}

/**
 * Basic authentication middleware - ensures user is authenticated
 */
export function requireAuth() {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      next();
    } catch (error) {
      console.error('Authentication check error:', error);
      res.status(500).json({ error: 'Authentication check failed' });
    }
  };
}



/**
 * Middleware to load user permissions and set up default user context
 * For now, this loads the first available user until proper authentication is implemented
 */
export async function loadUserPermissions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // Skip static assets and Vite HMR/internal requests
  const staticAssetRegex = /\.(js|css|png|jpg|jpeg|svg|ico|woff2?|ttf|map)$/i;
  const viteInternal = req.path.startsWith('/@vite') || req.path.startsWith('/@fs') || req.path.startsWith('/__vite_ping') || req.path.startsWith('/@react-refresh');
  if (staticAssetRegex.test(req.path) || viteInternal) {
    return next();
  }
  try {
    // For now, load all clubs as user clubs (consistent with /api/user/clubs endpoint)
    // This will be replaced with proper authentication later
    if (!req.user) {
      // Get all active clubs and return them as user clubs
      const result = await db.execute(sql`
        SELECT id, name, code FROM clubs WHERE is_active = true ORDER BY name
      `);

      const clubs = result.rows.map(club => ({
        clubId: Number(club.id),
        clubName: String(club.name),
        clubCode: String(club.code),
        role: "admin", // Default role for now
        permissions: {
          canManagePlayers: true,
          canManageGames: true,
          canManageStats: true,
          canViewOtherTeams: true,
        }
      }));

      // Check if there's a club ID in the header
      const headerClubIdRaw = req.headers['x-current-club-id'];
      const headerClubId = typeof headerClubIdRaw === 'string' ? parseInt(headerClubIdRaw) : null;
      // Set current club ID based on header or default to first club
      let currentClubId = clubs[0]?.clubId;
      if (headerClubId && Array.isArray(clubs) && clubs.some((c) => c.clubId === headerClubId)) {
        currentClubId = headerClubId;
      }

      req.user = {
        id: 1,
        username: 'admin',
        clubs,
        currentClubId
      };
    }
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
    try {
      // First ensure user is authenticated
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Check club access if required
      if (options.requireClub || options.permission) {
        const clubAccess = requireClubAccess(options.permission);
        return clubAccess(req, res, (err: any) => {
          if (err) return next(err);

          // Continue with additional checks
          if (options.requireGameAccess) {
            return requireGameAccess()(req, res, next);
          }
          if (options.requireTeamAccess) {
            return requireTeamAccess()(req, res, next);
          }
          next();
        });
      }

      // Direct game or team access checks
      if (options.requireGameAccess) {
        return requireGameAccess()(req, res, next);
      }
      if (options.requireTeamAccess) {
        return requireTeamAccess()(req, res, next);
      }

      next();
    } catch (error) {
      console.error('Standard auth middleware error:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
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