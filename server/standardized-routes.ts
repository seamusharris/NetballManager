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
      
      // Use Drizzle ORM for consistent querying
      const { games, gameStatuses, teams } = await import('@shared/schema');
      const { eq, and, or } = await import('drizzle-orm');
      
      const result = await db.select({
        id: games.id,
        date: games.date,
        time: games.time,
        venue: games.venue,
        round: games.round,
        homeTeamId: games.home_team_id,
        awayTeamId: games.away_team_id,
        statusId: games.status_id,
        seasonId: games.season_id,
        createdAt: games.created_at,
        updatedAt: games.updated_at,
        status: gameStatuses.name,
        statusDisplayName: gameStatuses.display_name,
        isCompleted: gameStatuses.is_completed,
        allowsStatistics: gameStatuses.allows_statistics,
        homeTeamName: teams.name,
        awayTeamName: teams.name
      })
      .from(games)
      .leftJoin(gameStatuses, eq(games.status_id, gameStatuses.id))
      .innerJoin(teams, eq(games.home_team_id, teams.id))
      .innerJoin(teams, eq(games.away_team_id, teams.id))
      .where(and(
        eq(games.id, gameId),
        or(
          eq(games.home_team_id, teamId),
          eq(games.away_team_id, teamId)
        )
      ));
      
      if (result.length === 0) {
        return res.status(404).json({ error: 'Game not found or team not involved' });
      }
      
      const game = result[0];
      
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
  // COMPREHENSIVE BATCH OPERATIONS (New Pattern)
  // ============================================================================
  
  /**
   * Comprehensive team batch API - Get games + associated data in one call
   * NEW: /api/teams/:teamId/games/batch
   */
  app.post('/api/teams/:teamId/games/batch', standardAuth({ requireClub: true }), async (req: AuthenticatedRequest, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      const { 
        includeStats = true, 
        includeScores = true, 
        includeRosters = true,
        filters = {}
      } = req.body;
      
      console.log(`🆕 NEW STANDARDIZED: Team ${teamId} comprehensive batch API`);
      
      // Step 1: Get team's games using simple Drizzle ORM (following existing working patterns)
      const { games } = await import('@shared/schema');
      const { eq, and, or, desc } = await import('drizzle-orm');
      
      const teamGames = await db.select()
        .from(games)
        .where(or(
          eq(games.home_team_id, teamId),
          eq(games.away_team_id, teamId)
        ))
        .orderBy(desc(games.date), desc(games.id));
      
      if (teamGames.length === 0) {
        return res.json({ games: [], stats: {}, scores: {}, rosters: {} });
      }
      
      const gameIds = teamGames.map(game => game.id);
      
      // Initialize response
      const response: any = {
        games: transformToApiFormat(teamGames)
      };
      
      // Step 2: Get associated data using existing proven patterns
      const promises: Promise<any>[] = [];
      
      // Stats - use proven working Drizzle ORM pattern
      if (includeStats && gameIds.length > 0) {
        const { gameStats } = await import('@shared/schema');
        const { inArray, and, eq } = await import('drizzle-orm');
        
        const statsPromise = db.select()
          .from(gameStats)
          .where(and(
            inArray(gameStats.game_id, gameIds),
            eq(gameStats.team_id, teamId)
          ))
          .orderBy(gameStats.game_id, gameStats.quarter, gameStats.position)
          .then(stats => {
            const statsMap: Record<string, any[]> = {};
            gameIds.forEach(gameId => {
              statsMap[gameId.toString()] = [];
            });
            
            stats.forEach((stat) => {
              const gameIdStr = stat.game_id.toString();
              if (statsMap[gameIdStr]) {
                statsMap[gameIdStr].push(transformToApiFormat(stat));
              }
            });
            
            response.stats = statsMap;
          });
        
        promises.push(statsPromise);
      }
      
      // Scores - use same pattern as existing batch endpoints
      if (includeScores && gameIds.length > 0) {
        const { gameScores } = await import('@shared/schema');
        const { inArray } = await import('drizzle-orm');
        
        const scoresPromise = db.select()
          .from(gameScores)
          .where(inArray(gameScores.game_id, gameIds))
          .then(scores => {
            const scoresMap: Record<string, any[]> = {};
            gameIds.forEach(gameId => {
              scoresMap[gameId.toString()] = [];
            });
            
            scores.forEach((score) => {
              const gameIdStr = score.game_id.toString();
              if (scoresMap[gameIdStr]) {
                scoresMap[gameIdStr].push(transformToApiFormat(score));
              }
            });
            
            response.scores = scoresMap;
          });
        
        promises.push(scoresPromise);
      }
      
      // Rosters - use proven working Drizzle ORM pattern with join
      if (includeRosters && gameIds.length > 0) {
        const { rosters, teamPlayers } = await import('@shared/schema');
        const { inArray, and, eq } = await import('drizzle-orm');
        
        const rostersPromise = db.select({
          id: rosters.id,
          game_id: rosters.game_id,
          quarter: rosters.quarter,
          position: rosters.position,
          player_id: rosters.player_id,
          team_id: teamPlayers.team_id
        })
        .from(rosters)
        .innerJoin(teamPlayers, eq(rosters.player_id, teamPlayers.player_id))
        .where(and(
          inArray(rosters.game_id, gameIds),
          eq(teamPlayers.team_id, teamId)
        ))
        .orderBy(rosters.game_id, rosters.quarter, rosters.position)
        .then(result => {
          const rostersMap: Record<string, any[]> = {};
          gameIds.forEach(gameId => {
            rostersMap[gameId.toString()] = [];
          });
          
          result.forEach((roster) => {
            const gameIdStr = roster.game_id.toString();
            if (rostersMap[gameIdStr]) {
              rostersMap[gameIdStr].push(transformToApiFormat(roster));
            }
          });
          
          response.rosters = rostersMap;
        });
        
        promises.push(rostersPromise);
      }
      
      // Wait for all data
      await Promise.all(promises);
      
      res.json(response);
    } catch (error) {
      console.error('Error in team comprehensive batch API:', error);
      res.status(500).json({ error: 'Failed to fetch team batch data' });
    }
  });
  
  /**
   * Comprehensive club batch API - Get games + associated data in one call
   * NEW: /api/clubs/:clubId/games/batch
   */
  app.post('/api/clubs/:clubId/games/batch', standardAuth({ requireClub: true }), async (req: AuthenticatedRequest, res) => {
    try {
      const clubId = parseInt(req.params.clubId);
      const { 
        includeStats = true, 
        includeScores = true, 
        includeRosters = true,
        filters = {}
      } = req.body;
      
      console.log(`🆕 NEW STANDARDIZED: Club ${clubId} comprehensive batch API`);
      
      // Step 1: Get club's games using simple Drizzle ORM approach (following team pattern)
      const { games, gameStatuses, teams, seasons } = await import('@shared/schema');
      const { eq, and, or, desc, inArray } = await import('drizzle-orm');
      
      // Get club's team IDs first
      const clubTeamsResult = await db.select({ id: teams.id })
        .from(teams)
        .where(eq(teams.club_id, clubId));
      
      const clubTeamIds = clubTeamsResult.map(team => team.id);
      
      if (clubTeamIds.length === 0) {
        return res.json({ games: [], stats: {}, scores: {}, rosters: {} });
      }
      
      // Build base query conditions for club games
      let baseConditions = [
        or(
          inArray(games.home_team_id, clubTeamIds),
          inArray(games.away_team_id, clubTeamIds)
        )
      ];
      
      // Apply season filter
      if (filters.season === 'current') {
        const currentSeasonResult = await db.select({ id: seasons.id })
          .from(seasons)
          .where(eq(seasons.is_current, true))
          .limit(1);
        
        if (currentSeasonResult.length > 0) {
          const currentSeasonId = currentSeasonResult[0].id;
          baseConditions.push(eq(games.season_id, currentSeasonId));
        }
      } else if (filters.seasonId) {
        const seasonId = parseInt(filters.seasonId);
        if (!isNaN(seasonId)) {
          baseConditions.push(eq(games.season_id, seasonId));
        }
      }
      
      // Get basic games first using simple query
      const basicGames = await db.select()
        .from(games)
        .where(and(...baseConditions))
        .orderBy(desc(games.date), desc(games.id));
      
      if (basicGames.length === 0) {
        return res.json({ games: [], stats: {}, scores: {}, rosters: {} });
      }
      
      let filteredGames = basicGames;
      
      // Apply status filter if needed
      if (filters.status === 'completed' || filters.status === 'upcoming') {
        const gameStatusesResult = await db.select()
          .from(gameStatuses)
          .where(inArray(gameStatuses.id, basicGames.map(g => g.status_id).filter(Boolean)));
        
        const statusMap = new Map(gameStatusesResult.map(gs => [gs.id, gs]));
        
        filteredGames = basicGames.filter(game => {
          const status = statusMap.get(game.status_id);
          if (!status) return false;
          
          if (filters.status === 'completed') {
            return status.is_completed === true;
          } else if (filters.status === 'upcoming') {
            return status.is_completed === false;
          }
          return true;
        });
      }
      
      const gameIds = filteredGames.map(game => game.id);
      
      // Use the filtered games as the result (same approach as team batch API)
      const gamesResult = filteredGames;
      
      // Initialize response object
      const response: any = {
        games: transformToApiFormat(gamesResult)
      };
      
      // Step 2: Get associated data if requested
      const promises: Promise<any>[] = [];
      
      // Stats (club-filtered) - use proven working Drizzle ORM pattern
      if (includeStats && gameIds.length > 0 && clubTeamIds.length > 0) {
        const { gameStats } = await import('@shared/schema');
        const { inArray, and } = await import('drizzle-orm');
        
        const statsPromise = db.select()
          .from(gameStats)
          .where(and(
            inArray(gameStats.game_id, gameIds),
            inArray(gameStats.team_id, clubTeamIds)
          ))
          .orderBy(gameStats.game_id, gameStats.quarter, gameStats.position)
          .then(stats => {
            const statsMap: Record<string, any[]> = {};
            gameIds.forEach(gameId => {
              statsMap[gameId.toString()] = [];
            });
            
            stats.forEach((stat) => {
              const gameIdStr = stat.game_id.toString();
              if (statsMap[gameIdStr]) {
                statsMap[gameIdStr].push(transformToApiFormat(stat));
              }
            });
            
            response.stats = statsMap;
          });
        
        promises.push(statsPromise);
      }
      
      // Scores (all quarters)
      if (includeScores && gameIds.length > 0) {
        const { gameScores } = await import('@shared/schema');
        const { inArray } = await import('drizzle-orm');
        
        const scoresPromise = db.select()
          .from(gameScores)
          .where(inArray(gameScores.game_id, gameIds))
          .then(scores => {
            // Group scores by game ID
            const scoresMap: Record<number, any[]> = {};
            gameIds.forEach(gameId => {
              scoresMap[gameId] = [];
            });
            
            scores.forEach((score) => {
              const gameId = score.game_id;
              if (scoresMap[gameId]) {
                scoresMap[gameId].push(score);
              }
            });
            
            response.scores = transformToApiFormat(scoresMap);
          });
        
        promises.push(scoresPromise);
      }
      
      // Rosters (club-filtered) - use proven working Drizzle ORM pattern
      if (includeRosters && gameIds.length > 0 && clubTeamIds.length > 0) {
        const { rosters, teamPlayers } = await import('@shared/schema');
        const { inArray, and, eq } = await import('drizzle-orm');
        
        const rostersPromise = db.select({
          id: rosters.id,
          game_id: rosters.game_id,
          quarter: rosters.quarter,
          position: rosters.position,
          player_id: rosters.player_id,
          team_id: teamPlayers.team_id
        })
        .from(rosters)
        .innerJoin(teamPlayers, eq(rosters.player_id, teamPlayers.player_id))
        .where(and(
          inArray(rosters.game_id, gameIds),
          inArray(teamPlayers.team_id, clubTeamIds)
        ))
        .orderBy(rosters.game_id, rosters.quarter, rosters.position)
        .then(result => {
          const rostersMap: Record<string, any[]> = {};
          gameIds.forEach(gameId => {
            rostersMap[gameId.toString()] = [];
          });
          
          result.forEach((roster) => {
            const gameIdStr = roster.game_id.toString();
            if (rostersMap[gameIdStr]) {
              rostersMap[gameIdStr].push(transformToApiFormat(roster));
            }
          });
          
          response.rosters = rostersMap;
        });
        
        promises.push(rostersPromise);
      }
      
      // Wait for all data to be fetched
      await Promise.all(promises);
      
      res.json(response);
    } catch (error) {
      console.error('Error in club comprehensive batch API:', error);
      res.status(500).json({ error: 'Failed to fetch club batch data' });
    }
  });

  // ============================================================================
  // INDIVIDUAL GAME APIS (Team Perspective)
  // ============================================================================
  
  /**
   * Individual team game rosters API
   * NEW: /api/teams/:teamId/games/:gameId/rosters
   */
  app.get('/api/teams/:teamId/games/:gameId/rosters', standardAuth({ requireClub: true }), async (req: AuthenticatedRequest, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      const gameId = parseInt(req.params.gameId);
      
      if (isNaN(teamId) || isNaN(gameId)) {
        return res.status(400).json({ error: 'Invalid team ID or game ID' });
      }
      
      console.log(`🆕 NEW STANDARDIZED: Team ${teamId} rosters for game ${gameId}`);
      
      // Get rosters for the specific team and game using proven pattern
      const { rosters, teamPlayers } = await import('@shared/schema');
      const { eq, and } = await import('drizzle-orm');
      
      const result = await db.select({
        id: rosters.id,
        gameId: rosters.game_id,
        quarter: rosters.quarter,
        position: rosters.position,
        playerId: rosters.player_id,
        teamId: teamPlayers.team_id
      })
      .from(rosters)
      .innerJoin(teamPlayers, eq(rosters.player_id, teamPlayers.player_id))
      .where(and(
        eq(rosters.game_id, gameId),
        eq(teamPlayers.team_id, teamId)
      ))
      .orderBy(rosters.quarter, rosters.position);
      
      res.json(transformToApiFormat(result));
    } catch (error) {
      console.error('Error in team game rosters endpoint:', error);
      res.status(500).json({ error: 'Failed to fetch team game rosters' });
    }
  });

  /**
   * Neutral game rosters API (all teams)
   * NEW: /api/games/:gameId/rosters
   */
  app.get('/api/games/:gameId/rosters', standardAuth({ requireClub: true }), async (req: AuthenticatedRequest, res) => {
    try {
      const gameId = parseInt(req.params.gameId);
      
      if (isNaN(gameId)) {
        return res.status(400).json({ error: 'Invalid game ID' });
      }
      
      console.log(`🆕 NEW STANDARDIZED: All rosters for game ${gameId}`);
      
      // Get all rosters for the game (both teams) using proven pattern
      const { rosters, teamPlayers } = await import('@shared/schema');
      const { eq } = await import('drizzle-orm');
      
      const result = await db.select({
        id: rosters.id,
        gameId: rosters.game_id,
        quarter: rosters.quarter,
        position: rosters.position,
        playerId: rosters.player_id,
        teamId: teamPlayers.team_id
      })
      .from(rosters)
      .innerJoin(teamPlayers, eq(rosters.player_id, teamPlayers.player_id))
      .where(eq(rosters.game_id, gameId))
      .orderBy(teamPlayers.team_id, rosters.quarter, rosters.position);
      
      res.json(transformToApiFormat(result));
    } catch (error) {
      console.error('Error in neutral game rosters endpoint:', error);
      res.status(500).json({ error: 'Failed to fetch game rosters' });
    }
  });

  // ============================================================================
  // TEAM-CENTRIC BATCH OPERATIONS (New Pattern)
  // ============================================================================
  
  /**
   * Batch fetch stats for multiple games from team perspective
   * NEW: /api/teams/:teamId/games/stats/batch
   */
  app.post('/api/teams/:teamId/games/stats/batch', standardAuth({ requireClub: true }), async (req: AuthenticatedRequest, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      const { gameIds } = req.body;
      
      if (!Array.isArray(gameIds) || gameIds.length === 0) {
        return res.status(400).json({ error: 'gameIds array is required' });
      }
      
      console.log(`🆕 NEW STANDARDIZED: Team ${teamId} batch stats for ${gameIds.length} games`);
      
      // Use existing batch logic but filter by team
      const validGameIds = gameIds
        .map(id => typeof id === 'number' ? id : parseInt(id, 10))
        .filter(id => !isNaN(id) && id > 0);
      
      if (validGameIds.length === 0) {
        return res.status(400).json({ error: 'No valid gameIds provided' });
      }
      
      // Fetch stats for the team across multiple games
      const { gameStats, rosters } = await import('@shared/schema');
      const { inArray, and, eq } = await import('drizzle-orm');
      
      const result = await db.select()
        .from(gameStats)
        .innerJoin(rosters, and(
          eq(gameStats.game_id, rosters.game_id),
          eq(gameStats.quarter, rosters.quarter),
          eq(gameStats.position, rosters.position)
        ))
        .where(and(
          inArray(gameStats.game_id, validGameIds),
          eq(rosters.team_id, teamId)
        ))
        .orderBy(gameStats.game_id, gameStats.quarter, gameStats.position);
      
      // Group by game ID
      const statsMap: Record<number, any[]> = {};
      validGameIds.forEach(gameId => {
        statsMap[gameId] = [];
      });
      
      result.forEach((row) => {
        const stat = row.game_stats;
        const gameId = stat.game_id;
        if (statsMap[gameId]) {
          statsMap[gameId].push(stat);
        }
      });
      
      res.json(transformToApiFormat(statsMap));
    } catch (error) {
      console.error('Error in team batch stats endpoint:', error);
      res.status(500).json({ error: 'Failed to fetch team batch stats' });
    }
  });
  
  /**
   * Batch fetch scores for multiple games from team perspective  
   * NEW: /api/teams/:teamId/games/scores/batch
   */
  app.post('/api/teams/:teamId/games/scores/batch', standardAuth({ requireClub: true }), async (req: AuthenticatedRequest, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      const { gameIds } = req.body;
      
      if (!Array.isArray(gameIds) || gameIds.length === 0) {
        return res.status(400).json({ error: 'gameIds array is required' });
      }
      
      console.log(`🆕 NEW STANDARDIZED: Team ${teamId} batch scores for ${gameIds.length} games`);
      
      // Delegate to existing club batch endpoint but add team context
      // For scores, team perspective doesn't change the data (scores are neutral)
      // But we validate that the team participated in these games
      
      const validGameIds = gameIds
        .map(id => typeof id === 'number' ? id : parseInt(id, 10))
        .filter(id => !isNaN(id) && id > 0);
      
      if (validGameIds.length === 0) {
        return res.status(400).json({ error: 'No valid gameIds provided' });
      }
      
      // Verify team participated in these games
      const { games } = await import('@shared/schema');
      const { inArray, and, or, eq } = await import('drizzle-orm');
      
      const gameCheck = await db.select({ id: games.id })
        .from(games)
        .where(and(
          inArray(games.id, validGameIds),
          or(
            eq(games.home_team_id, teamId),
            eq(games.away_team_id, teamId)
          )
        ));
      
      const validTeamGameIds = gameCheck.map(row => row.id);
      
      // Fetch scores for validated games
      const { gameScores } = await import('@shared/schema');
      
      const scores = await db.select()
        .from(gameScores)
        .where(inArray(gameScores.game_id, validTeamGameIds));
      
      // Group scores by game ID
      const scoresMap: Record<number, any[]> = {};
      validTeamGameIds.forEach(gameId => {
        scoresMap[gameId] = [];
      });
      
      scores.forEach((score) => {
        const gameId = score.game_id;
        if (scoresMap[gameId]) {
          scoresMap[gameId].push(score);
        }
      });
      
      res.json(transformToApiFormat(scoresMap));
    } catch (error) {
      console.error('Error in team batch scores endpoint:', error);
      res.status(500).json({ error: 'Failed to fetch team batch scores' });
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
        // Individual endpoints
        'GET /api/teams/:teamId/games/:gameId',
        'GET /api/teams/:teamId/games/:gameId/stats',
        'GET /api/teams/:teamId/games/:gameId/rosters',
        'GET /api/games/:gameId/rosters',
        
        // Comprehensive batch endpoints
        'POST /api/teams/:teamId/games/batch',
        'POST /api/clubs/:clubId/games/batch',
        
        // Specific batch endpoints
        'POST /api/teams/:teamId/games/stats/batch',
        'POST /api/teams/:teamId/games/scores/batch'
      ]
    });
  });
}