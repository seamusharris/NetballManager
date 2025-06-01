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
      let clubId = req.params.clubId || req.headers['x-club-id'] || req.query.clubId || req.body.clubId || req.user?.currentClubId;

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