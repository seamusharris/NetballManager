import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { sql, eq, and } from "drizzle-orm";
import { db, pool } from "./db";
import * as schema from "@shared/schema";
import { 
  insertPlayerSchema, importPlayerSchema,
  insertGameSchema, importGameSchema,
  insertRosterSchema, importRosterSchema,
  insertGameStatSchema, importGameStatSchema,
  insertSeasonSchema,
  players, games, rosters, gameStats, seasons,
  POSITIONS
} from "@shared/schema";

import { updatePlayerSeasonRelationships, getPlayerSeasons } from "./player-season-routes";
import gameStatusRoutes from "./game-status-routes";
import { registerTeamRoutes } from './team-routes';
import { registerUserManagementRoutes } from "./user-management-routes";
import { registerPlayerBorrowingRoutes } from "./player-borrowing-routes";
import { registerGamePermissionsRoutes } from "./game-permissions-routes";
import { 
  AuthenticatedRequest, 
  requireClubAccess, 
  requireTeamAccess, 
  requireGameAccess,
  loadUserPermissions,
  requireAuth,
  standardAuth
} from "./auth-middleware";

// Database health check function
async function checkPoolHealth(): Promise<boolean> {
  try {
    await db.execute(sql`SELECT 1`);
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Basic authentication middleware for development
  app.use(async (req: any, res, next) => {
    if (!req.user) {
      req.user = {
        id: 1,
        username: 'dev-user',
        clubs: [
          {
            clubId: 1,
            role: 'admin',
            permissions: {
              canManagePlayers: true,
              canManageGames: true,
              canManageStats: true,
              canViewOtherTeams: true,
            }
          }
        ],
        currentClubId: 1
      };
    }
    next();
  });

  // Basic routes
  app.get('/api/health', async (req, res) => {
    try {
      const isHealthy = await checkPoolHealth();
      res.json({ status: isHealthy ? 'healthy' : 'unhealthy' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Health check failed' });
    }
  });

  // Players route
  app.get("/api/players", async (req, res) => {
    try {
      const allPlayers = await db.select().from(players);
      res.json(allPlayers);
    } catch (error) {
      console.error('Error fetching players:', error);
      res.status(500).json({ error: 'Failed to fetch players' });
    }
  });

  // Games route
  app.get("/api/games", async (req, res) => {
    try {
      const allGames = await db.select().from(games);
      res.json(allGames);
    } catch (error) {
      console.error('Error fetching games:', error);
      res.status(500).json({ error: 'Failed to fetch games' });
    }
  });

  // Seasons route
  app.get('/api/seasons', async (req, res) => {
    try {
      const allSeasons = await db.select().from(seasons);
      res.json(allSeasons);
    } catch (error) {
      console.error('Error fetching seasons:', error);
      res.status(500).json({ error: 'Failed to fetch seasons' });
    }
  });

  const server = createServer(app);
  return server;
}