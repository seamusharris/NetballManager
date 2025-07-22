import { Express, Response } from 'express';
import { AuthenticatedRequest, standardAuth } from './auth-middleware';
import { db, pool } from './db';
import { sql } from 'drizzle-orm';
import { gameStats, games, teams } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { transformToApiFormat } from './api-utils';
import camelcaseKeys from 'camelcase-keys';
import { inArray } from 'drizzle-orm';

/**
 * Game-centric stats routes following the new REST pattern
 * /api/game/{gameId}/team/{teamId}/stats
 */
export function registerGameStatsRoutes(app: Express) {
  console.log('Registering game-centric stats routes...');

  // Update individual stat for a specific game and team
  app.patch('/api/game/:gameId/team/:teamId/stats/:statId', standardAuth({ requireClub: true }), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const gameId = parseInt(req.params.gameId);
      const teamId = parseInt(req.params.teamId);
      const statId = parseInt(req.params.statId);

      if (isNaN(gameId) || isNaN(teamId) || isNaN(statId)) {
        return res.status(400).json({ error: 'Invalid game ID, team ID, or stat ID' });
      }

      // Verify team participates in game
      const gameCheck = await db.execute(sql`
        SELECT id FROM games 
        WHERE id = ${gameId} 
        AND (home_team_id = ${teamId} OR away_team_id = ${teamId})
      `);

      if (gameCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Game not found or team not participating' });
      }

      // Update the stat
      const [updated] = await db.update(gameStats)
        .set({
          ...req.body,
          game_id: gameId,
          team_id: teamId
        })
        .where(and(
          eq(gameStats.id, statId),
          eq(gameStats.game_id, gameId),
          eq(gameStats.team_id, teamId)
        ))
        .returning();

      if (!updated) {
        return res.status(404).json({ error: 'Stat not found' });
      }

      res.json(transformToApiFormat(updated));
    } catch (error) {
      console.error('Error updating game stat:', error);
      res.status(500).json({ error: 'Failed to update game stat' });
    }
  });

  // Create/update stats for a specific game and team
  app.post('/api/game/:gameId/team/:teamId/stats', standardAuth({ requireClub: true }), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const gameId = parseInt(req.params.gameId);
      const teamId = parseInt(req.params.teamId);
      const { stats } = req.body;

      if (isNaN(gameId) || isNaN(teamId)) {
        return res.status(400).json({ error: 'Invalid game ID or team ID' });
      }

      if (!Array.isArray(stats)) {
        return res.status(400).json({ error: 'Stats must be an array' });
      }

      // Verify team participates in game
      const gameCheck = await db.execute(sql`
        SELECT id FROM games 
        WHERE id = ${gameId} 
        AND (home_team_id = ${teamId} OR away_team_id = ${teamId})
      `);

      if (gameCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Game not found or team not participating' });
      }

      // Process each stat entry
      const results = [];
      for (const stat of stats) {
        const statData = {
          ...stat,
          game_id: gameId,
          team_id: teamId
        };

        const statColumns = [
          'goals_for', 'goals_against', 'missed_goals', 'rebounds', 'intercepts',
          'deflections', 'turnovers', 'gains', 'receives', 'penalties', 'rating'
        ];

        if (stat.id) {
          // Update existing stat
          const [updated] = await db.update(gameStats)
            .set(statData)
            .where(eq(gameStats.id, stat.id))
            .returning();
          results.push(updated);
        } else {
          // Create new stat
          const [created] = await db.insert(gameStats)
            .values(statData)
            .returning();
          results.push(created);
        }
      }

      res.json(transformToApiFormat(results));
    } catch (error) {
      console.error('Error saving game stats:', error);
      res.status(500).json({ error: 'Failed to save game stats' });
    }
  });

  // Team-based stats endpoint (called by new StatsRecorder)
  app.get('/api/teams/:teamId/games/:gameId/stats', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const gameId = parseInt(req.params.gameId);
      const teamId = parseInt(req.params.teamId);

      console.log(`Team-based stats API: Fetching stats for team ${teamId}, game ${gameId}`);

      if (isNaN(gameId) || isNaN(teamId)) {
        console.log(`Team-based stats API: Invalid parameters - gameId: ${req.params.gameId}, teamId: ${req.params.teamId}`);
        return res.status(400).json({ error: 'Invalid game ID or team ID' });
      }

      // Verify team participates in game
      const gameCheck = await db.execute(sql`
        SELECT id FROM games 
        WHERE id = ${gameId} 
        AND (home_team_id = ${teamId} OR away_team_id = ${teamId})
      `);

      if (gameCheck.rows.length === 0) {
        console.log(`Team-based stats API: Team ${teamId} does not participate in game ${gameId}`);
        return res.status(404).json({ error: 'Game not found or team not participating' });
      }

      console.log(`Team-based stats API: Team ${teamId} verified for game ${gameId}`);

      // First, let's see what stats exist for this game regardless of team
      const allGameStats = await db.select()
        .from(gameStats)
        .where(eq(gameStats.game_id, gameId));

      console.log(`Team-based stats API: Found ${allGameStats.length} total stats for game ${gameId}`);
      allGameStats.forEach(stat => {
        console.log(`  - Stat ID ${stat.id}: team=${stat.team_id}, position=${stat.position}, quarter=${stat.quarter}`);
      });

      // Now get stats for the specific team
      const stats = await db.select()
        .from(gameStats)
        .where(and(
          eq(gameStats.game_id, gameId),
          eq(gameStats.team_id, teamId)
        ));

      console.log(`Team-based stats API: Found ${stats.length} stats for game ${gameId}, team ${teamId}`);
      
      if (stats.length === 0) {
        const availableTeams = Array.from(new Set(allGameStats.map(s => s.team_id)));
        console.log(`Team-based stats API: No stats found for team ${teamId}. Available teams in this game:`, availableTeams);
      }
      
      res.json(transformToApiFormat(stats));
    } catch (error) {
      console.error('Error fetching team-based game stats:', error);
      res.status(500).json({ error: 'Failed to fetch team-based game stats' });
    }
  });

  // Club-scoped batch endpoint for stats (restored to original logic)
  app.post('/api/clubs/:clubId/games/stats/batch', standardAuth({ requireClub: true }), async (req: AuthenticatedRequest, res) => {
    try {
      // Accept both snake_case and camelCase keys
      const { gameIds } = camelcaseKeys(req.body, { deep: true });
      if (!Array.isArray(gameIds) || gameIds.length === 0) {
        return res.status(400).json({ error: 'gameIds array is required' });
      }
      const validGameIds = gameIds
        .map(id => typeof id === 'number' ? id : parseInt(id, 10))
        .filter(id => !isNaN(id) && id > 0);
      if (validGameIds.length === 0) {
        return res.status(400).json({ error: 'No valid gameIds provided' });
      }
      // Fetch all stats for the requested games
      const stats = await db.select()
        .from(gameStats)
        .where(inArray(gameStats.game_id, validGameIds));
      // Group stats by game ID
      const statsMap = {};
      validGameIds.forEach(gameId => {
        statsMap[gameId] = [];
      });
      stats.forEach((stat) => {
        const gameId = stat.game_id;
        if (statsMap[gameId]) {
          statsMap[gameId].push(stat);
        } else {
          statsMap[gameId] = [stat];
        }
      });
      res.json(transformToApiFormat(statsMap));
    } catch (error) {
      console.error('Batch stats fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch batch stats' });
    }
  });
}