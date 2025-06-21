import type { Express } from "express";
import { createServer, type Server } from "http";
import { sql, eq, and } from "drizzle-orm";
import { db } from "./db";
import * as schema from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Basic authentication middleware for development
  app.use(async (req: any, res, next) => {
    if (!req.user) {
      try {
        // Load the first available user from the database like the original
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
                canViewOtherTeams: user.can_view_other_teams
              }
            }],
            currentClubId: user.club_id
          };
        }
      } catch (error) {
        console.error('Error loading user:', error);
      }
    }

    // Handle club ID from headers
    const headerClubId = req.headers['x-current-club-id'];
    if (headerClubId && req.user) {
      const clubId = parseInt(headerClubId as string, 10);
      if (!isNaN(clubId)) {
        req.user.currentClubId = clubId;
      }
    }

    next();
  });
  // Health check endpoint
  app.get('/api/health', async (req, res) => {
    try {
      await db.execute(sql`SELECT 1`);
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Health check failed:', error);
      res.status(503).json({ status: 'unhealthy', error: 'Database connection failed' });
    }
  });

  // Basic endpoints for frontend compatibility
  app.get('/api/players', async (req, res) => {
    try {
      res.json([]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch players' });
    }
  });

  app.get('/api/games', async (req, res) => {
    try {
      res.json([]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch games' });
    }
  });

  app.get('/api/seasons', async (req, res) => {
    try {
      res.json([]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch seasons' });
    }
  });

  app.get('/api/clubs', async (req, res) => {
    try {
      res.json([{ id: 1, name: 'Sample Club' }]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch clubs' });
    }
  });

  app.get('/api/teams', async (req, res) => {
    try {
      res.json([]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch teams' });
    }
  });

  // User clubs endpoint - required for app initialization
  app.get('/api/user/clubs', async (req: any, res) => {
    try {
      if (!req.user?.id) {
        return res.json([]);
      }

      const result = await db.execute(sql`
        SELECT 
          cu.club_id as "clubId",
          c.name as "clubName", 
          c.code as "clubCode",
          cu.role,
          cu.can_manage_players as "canManagePlayers",
          cu.can_manage_games as "canManageGames", 
          cu.can_manage_stats as "canManageStats",
          cu.can_view_other_teams as "canViewOtherTeams"
        FROM club_users cu
        JOIN clubs c ON cu.club_id = c.id
        WHERE cu.user_id = ${req.user.id} AND cu.is_active = true
        ORDER BY c.name
      `);

      const userClubs = result.rows.map(row => ({
        clubId: row.clubId,
        clubName: row.clubName,
        clubCode: row.clubCode,
        role: row.role,
        permissions: {
          canManagePlayers: row.canManagePlayers,
          canManageGames: row.canManageGames,
          canManageStats: row.canManageStats,
          canViewOtherTeams: row.canViewOtherTeams,
        }
      }));

      res.json(userClubs);
    } catch (error) {
      console.error('Error fetching user clubs:', error);
      res.status(500).json({ error: 'Failed to fetch user clubs' });
    }
  });

  const server = createServer(app);
  return server;
}