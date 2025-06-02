import { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { sql } from 'drizzle-orm';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    currentClubId: number | null;
    clubs: Array<{
      clubId: number;
      clubName: string;
      clubCode: string;
      role: string;
      permissions: {
        canManagePlayers: boolean;
        canManageGames: boolean;
        canManageStats: boolean;
        canViewOtherTeams: boolean;
      };
    }>;
  };
}

async function getUserClubs(userId: number) {
  const result = await db.execute(sql`
    SELECT 
      cu.club_id,
      c.name as club_name,
      c.code as club_code,
      cu.role,
      cu.can_manage_players,
      cu.can_manage_games,
      cu.can_manage_stats,
      cu.can_view_other_teams
    FROM club_users cu
    JOIN clubs c ON cu.club_id = c.id
    WHERE cu.user_id = ${userId} AND cu.is_active = true
    ORDER BY c.name
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

export async function loadUserPermissions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      const userResult = await db.execute(sql`
        SELECT u.id, u.username
        FROM users u
        JOIN club_users cu ON u.id = cu.user_id
        WHERE cu.is_active = true
        LIMIT 1
      `);

      if (userResult.rows.length === 0) {
        return res.status(401).json({ error: 'No active users found' });
      }

      const user = userResult.rows[0];
      const clubs = await getUserClubs(user.id);

      req.user = {
        id: user.id,
        username: user.username,
        currentClubId: null,
        clubs,
      };
    }

    // Set club ID from header if present
    const headerClubId = req.headers['x-current-club-id'];
    if (headerClubId) {
      const clubId = parseInt(headerClubId as string, 10);
      if (!isNaN(clubId) && req.user.clubs.some(c => c.clubId === clubId)) {
        req.user.currentClubId = clubId;
      }
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

export function requireAuth() {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Basic auth check - for now just pass through
    // In production, this would validate JWT tokens, etc.
    next();
  };
}

export function requireClubAccess() {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Get club ID from header, params, or query
      let clubId = req.user.currentClubId;

      if (!clubId) {
        const paramClubId = req.params.clubId || req.query.clubId;
        if (paramClubId) {
          clubId = parseInt(paramClubId as string, 10);
        }
      }

      if (!clubId || isNaN(clubId)) {
        return res.status(400).json({ error: 'Club ID required' });
      }

      // Check if user has access to this club
      const userClub = req.user.clubs.find(club => club.clubId === clubId);
      if (!userClub) {
        return res.status(403).json({ error: 'Access denied to this club' });
      }

      // Check specific permission if required
      if (requiredPermission && !userClub.permissions[requiredPermission as keyof typeof userClub.permissions]) {
        return res.status(403).json({ error: `Permission denied: ${requiredPermission}` });
      }

      req.user.currentClubId = clubId;
      next();
    } catch (error) {
      console.error('Club access check error:', error);
      res.status(500).json({ error: 'Authorization check failed' });
    }
  };
}

export function requireTeamAccess(requiredPermission?: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Get team ID from params
      const teamId = parseInt(req.params.teamId);
      if (!teamId || isNaN(teamId)) {
        return res.status(400).json({ error: 'Team ID required' });
      }

      // For now, allow access if user has club access
      // This could be enhanced to check specific team permissions
      const clubId = req.user.currentClubId;
      if (!clubId) {
        return res.status(400).json({ error: 'Club context required' });
      }

      const userClub = req.user.clubs.find(club => club.clubId === clubId);
      if (!userClub) {
        return res.status(403).json({ error: 'Access denied to this club' });
      }

      // Check specific permission if required
      if (requiredPermission && !userClub.permissions[requiredPermission as keyof typeof userClub.permissions]) {
        return res.status(403).json({ error: `Permission denied: ${requiredPermission}` });
      }

      next();
    } catch (error) {
      console.error('Team access check error:', error);
      res.status(500).json({ error: 'Authorization check failed' });
    }
  };
}

export function requireGameAccess(requireEditAccess: boolean = false) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const gameId = parseInt(req.params.gameId);
      if (!gameId || isNaN(gameId)) {
        return res.status(400).json({ error: 'Game ID required' });
      }

      // Get the game details to check club involvement
      const gameResult = await db.execute(sql`
        SELECT 
          g.id,
          ht.club_id as home_club_id,
          at.club_id as away_club_id
        FROM games g
        LEFT JOIN teams ht ON g.home_team_id = ht.id
        LEFT JOIN teams at ON g.away_team_id = at.id
        WHERE g.id = ${gameId}
      `);

      if (gameResult.rows.length === 0) {
        return res.status(404).json({ error: 'Game not found' });
      }

      const game = gameResult.rows[0];
      const userClubId = req.user.currentClubId;

      // Check if user's club is involved in the game
      if (game.home_club_id !== userClubId && game.away_club_id !== userClubId) {
        return res.status(403).json({ error: 'Not authorized to access this game' });
      }

      // If edit access is required, check permissions
      if (requireEditAccess) {
        const userClub = req.user.clubs.find(club => club.clubId === userClubId);
        if (!userClub || !userClub.permissions.canManageGames) {
          return res.status(403).json({ error: 'Permission denied: canManageGames required' });
        }
      }

      next();
    } catch (error) {
      console.error('Game access check error:', error);
      res.status(500).json({ error: 'Authorization check failed' });
    }
  };
}