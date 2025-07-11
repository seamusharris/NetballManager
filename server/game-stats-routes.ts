import { Express, Response } from 'express';
import { AuthenticatedRequest, standardAuth } from './auth-middleware';
import { db } from './db';
import { sql } from 'drizzle-orm';
import { gameStats, games, teams } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Game-centric stats routes following the new REST pattern
 * /api/game/{gameId}/team/{teamId}/stats
 */
export function registerGameStatsRoutes(app: Express) {
  console.log('Registering game-centric stats routes...');

  // Get game data with team context
  app.get('/api/game/:gameId/team/:teamId', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const gameId = parseInt(req.params.gameId);
      const teamId = parseInt(req.params.teamId);

      if (isNaN(gameId) || isNaN(teamId)) {
        return res.status(400).json({ error: 'Invalid game ID or team ID' });
      }

      console.log(`Game-centric API: Fetching game ${gameId} for team ${teamId}`);

      const result = await db.execute(sql`
        SELECT g.*, 
               ht.name as home_team_name, ht.club_id as home_club_id,
               at.name as away_team_name, at.club_id as away_club_id,
               s.name as season_name, s.start_date as season_start_date, s.end_date as season_end_date,
               gs.name as status_name, gs.display_name as status_display_name,
               gs.is_completed as status_is_completed, gs.allows_statistics as status_allows_statistics
        FROM games g
        LEFT JOIN teams ht ON g.home_team_id = ht.id  
        LEFT JOIN teams at ON g.away_team_id = at.id
        LEFT JOIN seasons s ON g.season_id = s.id
        LEFT JOIN game_statuses gs ON g.status_id = gs.id
        WHERE g.id = ${gameId} 
        AND (g.home_team_id = ${teamId} OR g.away_team_id = ${teamId})
      `);

      console.log(`Game-centric API: Found ${result.rows.length} results for game ${gameId}, team ${teamId}`);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Game not found or team not participating' });
      }

      const game = result.rows[0];
      res.json(game);
    } catch (error) {
      console.error('Error fetching game with team context:', error);
      res.status(500).json({ error: 'Failed to fetch game data' });
    }
  });

  // Get stats for a specific game and team
  app.get('/api/game/:gameId/team/:teamId/stats', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const gameId = parseInt(req.params.gameId);
      const teamId = parseInt(req.params.teamId);

      console.log(`Game-centric stats API: Fetching stats for game ${gameId}, team ${teamId}`);

      if (isNaN(gameId) || isNaN(teamId)) {
        console.log(`Game-centric stats API: Invalid parameters - gameId: ${req.params.gameId}, teamId: ${req.params.teamId}`);
        return res.status(400).json({ error: 'Invalid game ID or team ID' });
      }

      // Verify team participates in game
      const gameCheck = await db.execute(sql`
        SELECT id FROM games 
        WHERE id = ${gameId} 
        AND (home_team_id = ${teamId} OR away_team_id = ${teamId})
      `);

      if (gameCheck.rows.length === 0) {
        console.log(`Game-centric stats API: Team ${teamId} does not participate in game ${gameId}`);
        return res.status(404).json({ error: 'Game not found or team not participating' });
      }

      console.log(`Game-centric stats API: Team ${teamId} verified for game ${gameId}`);

      const stats = await db.select()
        .from(gameStats)
        .where(and(
          eq(gameStats.gameId, gameId),
          eq(gameStats.teamId, teamId)
        ));

      console.log(`Game-centric stats API: Found ${stats.length} stats for game ${gameId}, team ${teamId}`);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching game stats:', error);
      res.status(500).json({ error: 'Failed to fetch game stats' });
    }
  });

  // Create/update stats for a specific game and team
  app.post('/api/game/:gameId/team/:teamId/stats', standardAuth({ requireClubAccess: true }), async (req: AuthenticatedRequest, res: Response) => {
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
          gameId,
          teamId
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

      res.json(results);
    } catch (error) {
      console.error('Error saving game stats:', error);
      res.status(500).json({ error: 'Failed to save game stats' });
    }
  });

  // Get rosters for a specific game and team
  app.get('/api/game/:gameId/team/:teamId/rosters', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const gameId = parseInt(req.params.gameId);
      const teamId = parseInt(req.params.teamId);

      if (isNaN(gameId) || isNaN(teamId)) {
        return res.status(400).json({ error: 'Invalid game ID or team ID' });
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

      const result = await db.execute(sql`
        SELECT r.*, p.first_name, p.last_name, p.display_name
        FROM rosters r
        LEFT JOIN players p ON r.player_id = p.id
        WHERE r.game_id = ${gameId} AND r.team_id = ${teamId}
        ORDER BY r.position
      `);

      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching game rosters:', error);
      res.status(500).json({ error: 'Failed to fetch game rosters' });
    }
  });

  // Update roster for a specific game and team
  app.post('/api/game/:gameId/team/:teamId/rosters', standardAuth({ requireClubAccess: true }), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const gameId = parseInt(req.params.gameId);
      const teamId = parseInt(req.params.teamId);
      const { rosters } = req.body;

      if (isNaN(gameId) || isNaN(teamId)) {
        return res.status(400).json({ error: 'Invalid game ID or team ID' });
      }

      if (!Array.isArray(rosters)) {
        return res.status(400).json({ error: 'Rosters must be an array' });
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

      // Clear existing rosters for this game/team
      await db.execute(sql`
        DELETE FROM rosters 
        WHERE game_id = ${gameId} AND team_id = ${teamId}
      `);

      // Insert new rosters
      if (rosters.length > 0) {
        const values = rosters.map(roster => ({
          ...roster,
          gameId,
          teamId
        }));

        const result = await db.execute(sql`
          INSERT INTO rosters (game_id, team_id, player_id, position, quarter)
          VALUES ${sql.join(
            values.map(v => sql`(${v.gameId}, ${v.teamId}, ${v.playerId}, ${v.position}, ${v.quarter})`),
            sql`, `
          )}
          RETURNING *
        `);

        res.json(result.rows);
      } else {
        res.json([]);
      }
    } catch (error) {
      console.error('Error saving game rosters:', error);
      res.status(500).json({ error: 'Failed to save game rosters' });
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

      const stats = await db.select()
        .from(gameStats)
        .where(and(
          eq(gameStats.gameId, gameId),
          eq(gameStats.teamId, teamId)
        ));

      console.log(`Team-based stats API: Found ${stats.length} stats for game ${gameId}, team ${teamId}`);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching team-based game stats:', error);
      res.status(500).json({ error: 'Failed to fetch team-based game stats' });
    }
  });

  // Club-scoped batch endpoint for stats
  app.post('/api/clubs/:clubId/games/stats/batch', async (req, res) => {
    try {
      const clubId = parseInt(req.params.clubId);
      const { gameIds, teamId } = req.body;

      if (!Array.isArray(gameIds) || gameIds.length === 0) {
        return res.status(400).json({ error: 'gameIds array is required' });
      }

      console.log(`Club-scoped POST Batch stats endpoint for club ${clubId}, gameIds:`, gameIds, 'teamId:', teamId);

      let query = `
        SELECT gs.*
        FROM game_stats gs
        JOIN games g ON gs.gameId = g.id
        WHERE g.clubId = ? AND gs.gameId IN (${gameIds.map(() => '?').join(',')})
      `;

      let queryParams = [clubId, ...gameIds];

      // If teamId is provided, filter stats to only that team
      if (teamId) {
        query += ` AND gs.teamId = ?`;
        queryParams.push(teamId);
      }

      query += ` ORDER BY gs.gameId, gs.quarter, gs.position`;

      const allStats = await db.query(query, queryParams);

      // Group by game ID
      const statsByGame: Record<string, any[]> = {};

      // Initialize empty arrays for all requested games
      gameIds.forEach(gameId => {
        statsByGame[gameId.toString()] = [];
      });

      // Populate with actual stats
      allStats.forEach(stat => {
        const gameId = stat.gameId.toString();
        if (!statsByGame[gameId]) {
          statsByGame[gameId] = [];
        }
        statsByGame[gameId].push(stat);
      });

      console.log(`Club-scoped batch stats response: found stats for ${Object.keys(statsByGame).filter(k => statsByGame[k].length > 0).length} games${teamId ? ` (filtered by team ${teamId})` : ''}`);

      res.json(statsByGame);
    } catch (error) {
      console.error('Club-scoped batch stats error:', error);
      res.status(500).json({ error: 'Failed to fetch batch stats' });
    }
  });
}