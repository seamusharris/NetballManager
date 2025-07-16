/**
 * Standardized API Routes
 * 
 * New standardized endpoints that follow consistent patterns.
 * These are ADDITIVE - they don't replace existing working endpoints.
 */

import type { Express } from "express";
import { 
  AuthenticatedRequest, 
  standardAuth
} from "./auth-middleware";
import { db } from "./db";
import { sql } from "drizzle-orm";
import { transformToApiFormat } from './api-utils';

export function registerStandardizedRoutes(app: Express) {
  
  // ============================================================================
  // TEAM-CENTRIC STANDARDIZED ROUTES (New Pattern)
  // ============================================================================
  
  /**
   * Get team's view of a specific game
   * NEW: /api/teams/:teamId/games/:gameId
   * Replaces: /api/game/:gameId/team/:teamId
   */
  app.get('/api/teams/:teamId/games/:gameId', standardAuth({ requireClub: true }), async (req: AuthenticatedRequest, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      const gameId = parseInt(req.params.gameId);
      
      console.log(`🆕 NEW STANDARDIZED: Team ${teamId} view of game ${gameId}`);
      
      // Use same logic as existing working endpoint but with team perspective
      const result = await db.execute(sql`
        SELECT 
          g.*,
          gs.name as status, 
          gs.display_name as status_display_name, 
          gs.is_completed, 
          gs.allows_statistics,
          ht.name as home_team_name,
          at.name as away_team_name
        FROM games g
        LEFT JOIN game_statuses gs ON g.status_id = gs.id
        JOIN teams ht ON g.home_team_id = ht.id
        JOIN teams at ON g.away_team_id = at.id
        WHERE g.id = ${gameId} 
        AND (g.home_team_id = ${teamId} OR g.away_team_id = ${teamId})
      `);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Game not found or team not involved' });
      }
      
      const game = result.rows[0];
      
      // Game data stays in Home vs Away format (always consistent)
      // Team perspective is only added for result calculation, not display
      const gameData = {
        ...game,
        // Add minimal team context for result calculation (if needed by frontend)
        requestingTeamId: teamId,
        requestingTeamIsHome: game.home_team_id === teamId
      };
      
      res.json(transformToApiFormat(gameData));
    } catch (error) {
      console.error('Error in standardized team game endpoint:', error);
      res.status(500).json({ error: 'Failed to fetch team game' });
    }
  });
  
  /**
   * Get team's stats for a specific game  
   * NEW: /api/teams/:teamId/games/:gameId/stats
   * Replaces: /api/game/:gameId/team/:teamId/stats
   */
  app.get('/api/teams/:teamId/games/:gameId/stats', standardAuth({ requireClub: true }), async (req: AuthenticatedRequest, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      const gameId = parseInt(req.params.gameId);
      
      console.log(`🆕 NEW STANDARDIZED: Team ${teamId} stats for game ${gameId}`);
      
      // Delegate to existing working stats endpoint but filter by team
      const { registerGameStatsRoutes } = await import('./game-stats-routes');
      
      // Use existing stats logic but with team filter
      const result = await db.execute(sql`
        SELECT gs.* 
        FROM game_stats gs
        JOIN rosters r ON gs.game_id = r.game_id AND gs.quarter = r.quarter AND gs.position = r.position
        WHERE gs.game_id = ${gameId} AND r.team_id = ${teamId}
        ORDER BY gs.quarter, gs.position
      `);
      
      res.json(transformToApiFormat(result.rows));
    } catch (error) {
      console.error('Error in standardized team stats endpoint:', error);
      res.status(500).json({ error: 'Failed to fetch team stats' });
    }
  });
  
  // ============================================================================
  // VALIDATION ENDPOINTS (For Testing)
  // ============================================================================
  
  /**
   * Health check for standardized routes
   */
  app.get('/api/standardized/health', (req, res) => {
    res.json({
      status: 'ok',
      message: 'Standardized routes are active',
      timestamp: new Date().toISOString(),
      endpoints: [
        'GET /api/teams/:teamId/games/:gameId',
        'GET /api/teams/:teamId/games/:gameId/stats'
      ]
    });
  });
}