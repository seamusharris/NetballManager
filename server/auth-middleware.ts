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
export function requireClubAccess(requiredPermission?: keyof AuthenticatedRequest['user']['clubs'][0]['permissions']) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Extract club ID from request (URL param, header, query, or body), fallback to user's current club
      let clubId = req.params.clubId || req.headers['x-current-club-id'] || req.query.clubId || req.body.clubId || req.user?.currentClubId;

      // Convert to number if it's a string
      if (typeof clubId === 'string') {
        clubId = parseInt(clubId);
      }

      if (!clubId || isNaN(clubId)) {
        console.error('Club access check failed - no valid club ID found', {
          params: req.params,
          query: req.query,
          userClubs: req.user?.clubs?.map(c => c.clubId),
          currentClubId: req.user?.currentClubId,
          extractedClubId: clubId
        });
        return res.status(400).json({ error: 'Club ID required' });
      }

      // Check if user has access to this club
      const userClub = req.user.clubs.find(club => club.clubId === clubId);

      if (!userClub) {
        console.error('Club access denied', {
          requestedClubId: clubId,
          userClubs: req.user.clubs?.map(c => c.clubId)
        });
        return res.status(403).json({ error: 'Access denied to this club' });
      }

      // Check specific permission if required
      if (requiredPermission && !userClub.permissions[requiredPermission]) {
        return res.status(403).json({ error: `Permission denied: ${requiredPermission}` });
      }

      // Add club context to request
      req.user.currentClubId = clubId;
      next();
    } catch (error) {
      console.error('Club access check error:', error);
      res.status(500).json({ error: 'Authorization check failed' });
    }
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
 * Load user's club permissions
 */
export async function loadUserClubPermissions(userId: number) {
  const result = await db.execute(sql`
    SELECT 
      cu.club_id,
      cu.role,
      cu.can_manage_players,
      cu.can_manage_games,
      cu.can_manage_stats,
      cu.can_view_other_teams,
      c.name as club_name,
      c.code as club_code
    FROM club_users cu
    JOIN clubs c ON cu.club_id = c.id
    WHERE cu.user_id = ${userId} AND cu.is_active = true;
  `);

  return result.rows.map(row => ({
    clubId: row.club_id,
    clubName: row.club_name,
    clubCode: row.club_code,
    role: row.role,
    permissions: {
      canManagePlayers: row.can_manage_players,
      canManageGames: row.can_manage_games,
      canManageStats: row.can_manage_stats,
      canViewOtherTeams: row.can_view_other_teams,
    }
  }));
}

/**
 * Middleware to load user permissions and set up default user context
 * For now, this loads the first available user until proper authentication is implemented
 */
export async function loadUserPermissions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    // For now, load the first available user from the database
    // This will be replaced with proper authentication later
    if (!req.user) {
      const userResult = await db.execute(sql`
        SELECT 
          u.id,
          u.username,
          cu.club_id,
          cu.role,
          cu.can_manage_players,
          cu.can_manage_games,
          cu.can_manage_stats,
          cu.can_view_other_teams
        FROM users u
        JOIN club_users cu ON u.id = cu.user_id
        WHERE cu.is_active = true
        LIMIT 1
      `);

      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        req.user = {
          id: user.id,
          username: user.username,
          clubs: [{
            clubId: user.club_id,
            role: user.role,
            permissions: {
              canManagePlayers: user.can_manage_players,
              canManageGames: user.can_manage_games,
              canManageStats: user.can_manage_stats,
              canViewOtherTeams: user.can_view_other_teams,
            }
          }],
          currentClubId: user.club_id
        };
      } else {
        // Fallback if no users found
        req.user = {
          id: 1,
          username: 'admin',
          clubs: [{
            clubId: 1,
            role: 'admin',
            permissions: {
              canManagePlayers: true,
              canManageGames: true,
              canManageStats: true,
              canViewOtherTeams: true,
            }
          }],
          currentClubId: 1
        };
      }
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
        return clubAccess(req, res, (err) => {
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