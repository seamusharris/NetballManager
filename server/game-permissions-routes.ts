
import { Express, Request, Response } from 'express';
import { db } from './db';
import { sql } from 'drizzle-orm';
import { AuthenticatedRequest, requireClubAccess, requireGameAccess } from './auth-middleware';
import { z } from 'zod';

const gamePermissionSchema = z.object({
  clubId: z.number(),
  canEditStats: z.boolean(),
  canViewDetailedStats: z.boolean(),
});

const bulkGamePermissionSchema = z.object({
  gameIds: z.array(z.number()),
  clubId: z.number(),
  canEditStats: z.boolean(),
  canViewDetailedStats: z.boolean(),
});

export function registerGamePermissionsRoutes(app: Express) {
  // Get game permissions for a specific game
  app.get('/api/games/:gameId/permissions', requireGameAccess(), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const gameId = parseInt(req.params.gameId);
      
      const result = await db.execute(sql`
        SELECT 
          gp.*,
          c.name as club_name,
          c.code as club_code
        FROM game_permissions gp
        JOIN clubs c ON gp.club_id = c.id
        WHERE gp.game_id = ${gameId}
        ORDER BY c.name
      `);

      const permissions = result.rows.map(row => ({
        id: row.id,
        gameId: row.game_id,
        clubId: row.club_id,
        clubName: row.club_name,
        clubCode: row.club_code,
        canEditStats: row.can_edit_stats,
        canViewDetailedStats: row.can_view_detailed_stats
      }));

      res.json(permissions);
    } catch (error) {
      console.error('Error fetching game permissions:', error);
      res.status(500).json({ error: 'Failed to fetch game permissions' });
    }
  });

  // Grant permission to a club for a specific game
  app.post('/api/games/:gameId/permissions', requireGameAccess(true), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const gameId = parseInt(req.params.gameId);
      const validatedData = gamePermissionSchema.parse(req.body);
      
      // Check if permission already exists
      const existingResult = await db.execute(sql`
        SELECT id FROM game_permissions 
        WHERE game_id = ${gameId} AND club_id = ${validatedData.clubId}
      `);

      if (existingResult.rows.length > 0) {
        // Update existing permission
        await db.execute(sql`
          UPDATE game_permissions SET
            can_edit_stats = ${validatedData.canEditStats},
            can_view_detailed_stats = ${validatedData.canViewDetailedStats}
          WHERE game_id = ${gameId} AND club_id = ${validatedData.clubId}
        `);
      } else {
        // Create new permission
        await db.execute(sql`
          INSERT INTO game_permissions (game_id, club_id, can_edit_stats, can_view_detailed_stats)
          VALUES (${gameId}, ${validatedData.clubId}, ${validatedData.canEditStats}, ${validatedData.canViewDetailedStats})
        `);
      }

      res.json({ message: 'Game permission granted successfully' });
    } catch (error) {
      console.error('Error granting game permission:', error);
      res.status(500).json({ error: 'Failed to grant game permission' });
    }
  });

  // Bulk grant permissions for multiple games
  app.post('/api/games/permissions/bulk', requireClubAccess('canManageGames'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const validatedData = bulkGamePermissionSchema.parse(req.body);
      
      // Verify user has access to all specified games
      for (const gameId of validatedData.gameIds) {
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
          return res.status(404).json({ error: `Game ${gameId} not found` });
        }

        const game = gameResult.rows[0];
        const userClubId = req.user?.currentClubId;
        
        // Check if user's club is involved in the game
        if (game.home_club_id !== userClubId && game.away_club_id !== userClubId) {
          return res.status(403).json({ error: `Not authorized to manage permissions for game ${gameId}` });
        }
      }

      // Grant permissions for all games
      for (const gameId of validatedData.gameIds) {
        await db.execute(sql`
          INSERT INTO game_permissions (game_id, club_id, can_edit_stats, can_view_detailed_stats)
          VALUES (${gameId}, ${validatedData.clubId}, ${validatedData.canEditStats}, ${validatedData.canViewDetailedStats})
          ON CONFLICT (game_id, club_id) DO UPDATE SET
            can_edit_stats = EXCLUDED.can_edit_stats,
            can_view_detailed_stats = EXCLUDED.can_view_detailed_stats
        `);
      }

      res.json({ message: 'Bulk game permissions granted successfully' });
    } catch (error) {
      console.error('Error granting bulk game permissions:', error);
      res.status(500).json({ error: 'Failed to grant bulk game permissions' });
    }
  });

  // Remove permission for a club from a specific game
  app.delete('/api/games/:gameId/permissions/:clubId', requireGameAccess(true), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const gameId = parseInt(req.params.gameId);
      const clubId = parseInt(req.params.clubId);
      
      await db.execute(sql`
        DELETE FROM game_permissions 
        WHERE game_id = ${gameId} AND club_id = ${clubId}
      `);

      res.json({ message: 'Game permission removed successfully' });
    } catch (error) {
      console.error('Error removing game permission:', error);
      res.status(500).json({ error: 'Failed to remove game permission' });
    }
  });

  // Get all clubs that can be granted permissions
  app.get('/api/clubs/available-for-permissions', requireClubAccess(), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const currentClubId = req.user?.currentClubId;
      
      const result = await db.execute(sql`
        SELECT id, name, code
        FROM clubs 
        WHERE id != ${currentClubId} AND is_active = true
        ORDER BY name
      `);

      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching available clubs:', error);
      res.status(500).json({ error: 'Failed to fetch available clubs' });
    }
  });
}
