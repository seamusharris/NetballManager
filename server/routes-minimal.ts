import type { Express } from "express";
import { createServer, type Server } from "http";
import { sql } from "drizzle-orm";
import { db } from "./db";

export async function registerRoutes(app: Express): Promise<Server> {
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
  app.get('/api/user/clubs', async (req, res) => {
    try {
      // For development, return a sample club to allow initialization
      res.json([{
        id: 1,
        name: 'Sample Netball Club',
        location: 'Sample Location',
        role: 'admin',
        permissions: {
          canManagePlayers: true,
          canManageGames: true,
          canManageStats: true,
          canViewOtherTeams: true
        }
      }]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user clubs' });
    }
  });

  const server = createServer(app);
  return server;
}