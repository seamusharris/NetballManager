import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { sql, eq, and } from "drizzle-orm";
import { db } from "./db";
import * as schema from "@shared/schema";
import { 
  insertPlayerSchema, 
  insertGameSchema, 
  insertRosterSchema, 
  insertGameStatSchema, 
  insertSeasonSchema,
  players, games, rosters, gameStats, seasons,
  POSITIONS
} from "@shared/schema";

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
  // Basic middleware for development
  app.use(async (req: any, res, next) => {
    if (!req.user) {
      req.user = {
        id: 1,
        username: 'dev_user',
        clubs: [{
          clubId: 1,
          role: 'admin',
          permissions: {
            canManagePlayers: true,
            canManageGames: true,
            canManageStats: true,
            canViewOtherTeams: true
          }
        }],
        currentClubId: 1
      };
    }
    next();
  });

  // Health check endpoint
  app.get('/api/health', async (req, res) => {
    const isHealthy = await checkPoolHealth();
    res.status(isHealthy ? 200 : 503).json({ 
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString()
    });
  });

  // Basic players endpoint
  app.get('/api/players', async (req, res) => {
    try {
      const allPlayers = await db.select().from(players).limit(100);
      res.json(allPlayers);
    } catch (error) {
      console.error('Error fetching players:', error);
      res.status(500).json({ error: 'Failed to fetch players' });
    }
  });

  // Basic games endpoint
  app.get('/api/games', async (req, res) => {
    try {
      const allGames = await db.select().from(games).limit(100);
      res.json(allGames);
    } catch (error) {
      console.error('Error fetching games:', error);
      res.status(500).json({ error: 'Failed to fetch games' });
    }
  });

  // Basic seasons endpoint
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