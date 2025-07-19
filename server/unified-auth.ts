import { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { sql } from 'drizzle-orm';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
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
    currentClubId?: number;
  };
  context?: {
    clubId?: number;
    teamId?: number;
    gameId?: number;
  };
}

interface AuthOptions {
  // Basic requirements
  requireAuth?: boolean;
  requireClub?: boolean;
  
  // Resource access
  requireTeam?: boolean;
  requireGame?: boolean;
  
  // Permission levels
  requireEdit?: boolean;
  permission?: 'canManagePlayers' | 'canManageGames' | 'canManageStats' | 'canViewOtherTeams';
  
  // Validation options
  allowMissingClubContext?: boolean; // For transition period
  logMissingContext?: boolean;
}

/**
 * Unified authentication and authorization middleware
 * 
 * Handles the transition from no-user system to full user authentication
 * while providing consistent access control patterns.
 */
export function unifiedAuth(options: AuthOptions = {}) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Step 1: Ensure user authentication
      if (options.requireAuth !== false) {
        if (!req.user) {
          return res.status(401).json({ 
            error: 'Authentication required',
            code: 'AUTH_REQUIRED'
          });
        }
      }

      // Step 2: Extract and validate club context
      if (options.requireClub) {
        const result = await validateClubContext(req, options);
        if (result.error) {
          return res.status(result.status).json(result.error);
        }
      }

      // Step 3: Validate team access if required
      if (options.requireTeam) {
        const result = await validateTeamAccess(req, options);
        if (result.error) {
          return res.status(result.status).json(result.error);
        }
      }

      // Step 4: Validate game access if required
      if (options.requireGame) {
        const result = await validateGameAccess(req, options);
        if (result.error) {
          return res.status(result.status).json(result.error);
        }
      }

      // Step 5: Check specific permissions
      if (options.permission) {
        const result = await validatePermission(req, options.permission, options);
        if (result.error) {
          return res.status(result.status).json(result.error);
        }
      }

      next();
    } catch (error) {
      console.error('Unified auth error:', error);
      res.status(500).json({ 
        error: 'Authentication system error',
        code: 'AUTH_SYSTEM_ERROR'
      });
    }
  };
}

/**
 * Validate club context from headers and user permissions
 */
async function validateClubContext(req: AuthenticatedRequest, options: AuthOptions) {
  const headerClubId = req.headers['x-current-club-id'];
  const clubId = headerClubId ? parseInt(headerClubId as string) : null;

  // Initialize context
  if (!req.context) req.context = {};

  if (!clubId) {
    if (options.allowMissingClubContext) {
      // Use first available club as fallback
      if (req.user?.clubs && req.user.clubs.length > 0) {
        req.context.clubId = req.user.clubs[0].clubId;
        req.user.currentClubId = req.user.clubs[0].clubId;
        
        if (options.logMissingContext) {
          console.warn(`Missing club context for ${req.path}, using fallback club ${req.context.clubId}`);
        }
        return { success: true };
      }
    }
    
    return {
      error: { 
        error: 'Club context required', 
        code: 'CLUB_CONTEXT_REQUIRED',
        hint: 'Include x-current-club-id header'
      },
      status: 400
    };
  }

  // Verify user has access to this club
  const hasClubAccess = req.user?.clubs?.some(club => club.clubId === clubId);
  if (!hasClubAccess) {
    return {
      error: { 
        error: 'Access denied to club', 
        code: 'CLUB_ACCESS_DENIED',
        clubId 
      },
      status: 403
    };
  }

  // Set context
  req.context.clubId = clubId;
  req.user!.currentClubId = clubId;
  
  return { success: true };
}

/**
 * Validate team access - team must belong to user's current club
 */
async function validateTeamAccess(req: AuthenticatedRequest, options: AuthOptions) {
  const teamId = parseInt(req.params.teamId || req.query.teamId as string || req.body.teamId);
  
  if (!teamId || isNaN(teamId)) {
    return {
      error: { 
        error: 'Team ID required', 
        code: 'TEAM_ID_REQUIRED' 
      },
      status: 400
    };
  }

  if (!req.context?.clubId) {
    return {
      error: { 
        error: 'Club context required for team access', 
        code: 'CLUB_CONTEXT_REQUIRED' 
      },
      status: 400
    };
  }

  // Verify team belongs to user's current club
  const result = await db.execute(sql`
    SELECT id, club_id, name FROM teams 
    WHERE id = ${teamId} AND club_id = ${req.context.clubId}
  `);

  if (result.rows.length === 0) {
    return {
      error: { 
        error: 'Team not found or access denied', 
        code: 'TEAM_ACCESS_DENIED',
        teamId,
        clubId: req.context.clubId
      },
      status: 404
    };
  }

  // Set context
  req.context.teamId = teamId;
  
  return { success: true };
}

/**
 * Validate game access - user's club must be involved in the game
 */
async function validateGameAccess(req: AuthenticatedRequest, options: AuthOptions) {
  const gameId = parseInt(req.params.gameId || req.params.id || req.query.gameId as string || req.body.gameId);
  
  if (!gameId || isNaN(gameId)) {
    return {
      error: { 
        error: 'Game ID required', 
        code: 'GAME_ID_REQUIRED' 
      },
      status: 400
    };
  }

  if (!req.context?.clubId) {
    return {
      error: { 
        error: 'Club context required for game access', 
        code: 'CLUB_CONTEXT_REQUIRED' 
      },
      status: 400
    };
  }

  // Check if user's club has access to this game
  const result = await db.execute(sql`
    SELECT 
      g.id,
      g.home_team_id,
      g.away_team_id,
      ht.club_id as home_club_id,
      at.club_id as away_club_id,
      COALESCE(gp.can_edit_stats, false) as can_edit_stats,
      COALESCE(gp.can_view_detailed_stats, false) as can_view_detailed_stats
    FROM games g
    LEFT JOIN teams ht ON g.home_team_id = ht.id
    LEFT JOIN teams at ON g.away_team_id = at.id
    LEFT JOIN game_permissions gp ON g.id = gp.game_id AND gp.club_id = ${req.context.clubId}
    WHERE g.id = ${gameId}
  `);

  if (result.rows.length === 0) {
    return {
      error: { 
        error: 'Game not found', 
        code: 'GAME_NOT_FOUND',
        gameId 
      },
      status: 404
    };
  }

  const game = result.rows[0];
  const userClubId = req.context.clubId;

  // Check access: direct involvement or explicit permissions
  const hasDirectAccess = game.home_club_id === userClubId || game.away_club_id === userClubId;
  const hasPermissionAccess = game.can_view_detailed_stats || game.can_edit_stats;

  if (!hasDirectAccess && !hasPermissionAccess) {
    return {
      error: { 
        error: 'Access denied to game', 
        code: 'GAME_ACCESS_DENIED',
        gameId,
        clubId: userClubId
      },
      status: 403
    };
  }

  // Check edit access if required
  if (options.requireEdit) {
    const canEdit = hasDirectAccess || game.can_edit_stats;
    if (!canEdit) {
      return {
        error: { 
          error: 'Edit access denied for game', 
          code: 'GAME_EDIT_ACCESS_DENIED',
          gameId,
          clubId: userClubId
        },
        status: 403
      };
    }
  }

  // Set context
  req.context.gameId = gameId;
  
  return { success: true };
}

/**
 * Validate specific permission
 */
async function validatePermission(req: AuthenticatedRequest, permission: string, options: AuthOptions) {
  if (!req.user?.currentClubId) {
    return {
      error: { 
        error: 'Club context required for permission check', 
        code: 'CLUB_CONTEXT_REQUIRED' 
      },
      status: 400
    };
  }

  const userClub = req.user.clubs.find(club => club.clubId === req.user!.currentClubId);
  
  if (!userClub) {
    return {
      error: { 
        error: 'User club access not found', 
        code: 'USER_CLUB_ACCESS_NOT_FOUND' 
      },
      status: 403
    };
  }

  // Check permission (currently all users have all permissions)
  const hasPermission = userClub.permissions[permission as keyof typeof userClub.permissions];
  
  if (!hasPermission) {
    return {
      error: { 
        error: `Permission denied: ${permission}`, 
        code: 'PERMISSION_DENIED',
        permission,
        userRole: userClub.role
      },
      status: 403
    };
  }

  return { success: true };
}

/**
 * Convenience functions for common auth patterns
 */

// Basic auth - just ensure user exists
export const requireAuth = () => unifiedAuth({ requireAuth: true });

// Club context required
export const requireClub = (allowMissing = true) => unifiedAuth({ 
  requireAuth: true, 
  requireClub: true, 
  allowMissingClubContext: allowMissing,
  logMissingContext: true 
});

// Team access required
export const requireTeam = () => unifiedAuth({ 
  requireAuth: true, 
  requireClub: true, 
  requireTeam: true 
});

// Game access required
export const requireGame = (requireEdit = false) => unifiedAuth({ 
  requireAuth: true, 
  requireClub: true, 
  requireGame: true, 
  requireEdit 
});

// Team + Game access (for team-scoped game endpoints)
export const requireTeamGame = (requireEdit = false) => unifiedAuth({ 
  requireAuth: true, 
  requireClub: true, 
  requireTeam: true, 
  requireGame: true, 
  requireEdit 
});

// Permission-based access
export const requirePermission = (permission: AuthOptions['permission']) => unifiedAuth({ 
  requireAuth: true, 
  requireClub: true, 
  permission 
});

/**
 * Load user permissions and set up default user context
 * This replaces the loadUserPermissions function from auth-middleware.ts
 */
export async function loadUserContext(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // Skip static assets and Vite HMR/internal requests
  const staticAssetRegex = /\.(js|css|png|jpg|jpeg|svg|ico|woff2?|ttf|map)$/i;
  const viteInternal = req.path.startsWith('/@vite') || req.path.startsWith('/@fs') || req.path.startsWith('/__vite_ping') || req.path.startsWith('/@react-refresh');
  
  if (staticAssetRegex.test(req.path) || viteInternal) {
    return next();
  }

  try {
    // For transition period: create default admin user with access to all clubs
    if (!req.user) {
      let clubs = [];
      
      try {
        // Get all active clubs with error handling
        const result = await db.execute(sql`
          SELECT id, name, code FROM clubs WHERE is_active = true ORDER BY name
        `);

        clubs = result.rows.map(club => ({
          clubId: Number(club.id),
          clubName: String(club.name),
          clubCode: String(club.code),
          role: "admin", // Default role during transition
          permissions: {
            canManagePlayers: true,
            canManageGames: true,
            canManageStats: true,
            canViewOtherTeams: true,
          }
      }));
      } catch (dbError) {
        console.error('Database error in loadUserContext:', dbError);
        // Fallback to empty clubs array if database is unavailable
        clubs = [];
      }

      // Set current club from header or default to first
      const headerClubIdRaw = req.headers['x-current-club-id'];
      const headerClubId = typeof headerClubIdRaw === 'string' ? parseInt(headerClubIdRaw) : null;
      
      let currentClubId = clubs[0]?.clubId || null;
      if (headerClubId && clubs.some(c => c.clubId === headerClubId)) {
        currentClubId = headerClubId;
      }

      req.user = {
        id: 1,
        username: 'admin', // Temporary during transition
        clubs,
        currentClubId
      };
    }

    next();
  } catch (error) {
    console.error('Error loading user context:', error);
    // Don't crash - provide fallback user context
    req.user = {
      id: 1,
      username: 'admin',
      clubs: [],
      currentClubId: null
    };
    next(); // Continue processing instead of returning error
  }
}