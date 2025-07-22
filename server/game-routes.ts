import type { Express, Request, Response } from "express";
import { db, pool } from "./db";
import { sql } from "drizzle-orm";
import { standardAuth, requireTeamGameAccess, AuthenticatedRequest } from "./auth-middleware";
import { transformToApiFormat } from "./api-utils";
import { storage } from "./storage";

function transformGameRow(row: any) {
  return {
    id: row.id,
    date: row.date,
    time: row.time,
    homeTeamId: row.home_team_id,
    awayTeamId: row.away_team_id,
    venue: row.venue,
    isInterClub: row.is_inter_club,
    statusId: row.status_id,
    round: row.round,
    seasonId: row.season_id,
    notes: row.notes,
    awardWinnerId: row.award_winner_id,
    statusName: row.status,
    statusDisplayName: row.status_display_name,
    statusIsCompleted: row.is_completed,
    statusAllowsStatistics: row.allows_statistics,
    statusTeamGoals: row.home_team_goals,
    statusOpponentGoals: row.away_team_goals,
    seasonName: row.season_name,
    seasonStartDate: row.season_start,
    seasonEndDate: row.season_end,
    seasonIsActive: row.season_active,
    homeTeamName: row.home_team_name,
    homeTeamDivision: row.home_team_division,
    homeClubId: row.home_club_id,
    homeClubName: row.home_club_name,
    homeClubCode: row.home_club_code,
    awayTeamName: row.away_team_name,
    awayTeamDivision: row.away_team_division,
    awayClubId: row.away_club_id,
    awayClubName: row.away_club_name,
    awayClubCode: row.away_club_code,
    isBye: row.away_team_name === 'Bye'
  };
}

export function registerGameRoutes(app: Express) {
  // REST endpoint for club games
  app.get("/api/clubs/:clubId/games", standardAuth({ requireClub: true }), async (req: AuthenticatedRequest, res) => {
    try {
      const clubId = parseInt(req.params.clubId);
      const { seasonId } = req.query;
      const result = await db.execute(sql`
        SELECT 
          g.*,
          gs.name as status, 
          gs.display_name as status_display_name, 
          gs.is_completed, 
          gs.allows_statistics, 
          gs.home_team_goals, 
          gs.away_team_goals,
          s.name as season_name, 
          s.start_date as season_start, 
          s.end_date as season_end, 
          s.is_active as season_active,
          ht.name as home_team_name, 
          ht.division_id as home_team_division, 
          ht.club_id as home_club_id,
          at.name as away_team_name, 
          at.division_id as away_team_division, 
          at.club_id as away_club_id,
          hc.name as home_club_name, 
          hc.code as home_club_code,
          ac.name as away_club_name, 
          ac.code as away_club_code
        FROM games g
        LEFT JOIN game_statuses gs ON g.status_id = gs.id
        LEFT JOIN seasons s ON g.season_id = s.id
        JOIN teams ht ON g.home_team_id = ht.id
        JOIN teams at ON g.away_team_id = at.id
        LEFT JOIN clubs hc ON ht.club_id = hc.id
        LEFT JOIN clubs ac ON at.club_id = ac.id
        WHERE ht.club_id = ${clubId} OR at.club_id = ${clubId}
        ORDER BY g.date DESC, g.time DESC
      `);
      const transformedGames = result.rows.map(transformGameRow);
      const { createSuccessResponse } = await import('./api-response-standards');
      res.json(createSuccessResponse(transformToApiFormat(transformedGames)));
    } catch (error) {
      console.error('Error fetching club games via REST:', error);
      res.status(500).json({ error: 'Failed to fetch club games' });
    }
  });

  // Simplified games endpoint for display-only use cases
  app.get("/api/clubs/:clubId/games/simplified", standardAuth({ requireClub: true }), async (req: AuthenticatedRequest, res) => {
    try {
      const clubId = parseInt(req.params.clubId);
      const result = await db.execute(sql`
        SELECT 
          g.id,
          g.date,
          g.round,
          g.home_team_id,
          g.away_team_id,
          gs.name as status_name,
          gs.is_completed as status_is_completed,
          ht.name as home_team_name,
          at.name as away_team_name,
          (SELECT COUNT(*) FROM game_stats WHERE game_id = g.id) as stats_count
        FROM games g
        LEFT JOIN game_statuses gs ON g.status_id = gs.id
        JOIN teams ht ON g.home_team_id = ht.id
        LEFT JOIN teams at ON g.away_team_id = at.id
        WHERE ht.club_id = ${clubId} OR (at.id IS NOT NULL AND at.club_id = ${clubId})
        ORDER BY g.date DESC, g.time DESC
      `);
      // Use utility function to get quarter scores efficiently
      const gameIds = result.rows.map(row => Number(row.id));
      const { getBatchGameScores } = await import('./game-scores-utils');
      const scoresMap = await getBatchGameScores(gameIds);
      const transformedResults = result.rows.map(game => ({
        ...game,
        quarter_scores: scoresMap[Number(game.id)]?.quarterScores || []
      }));
      console.log(`Simplified endpoint found ${transformedResults.length} games for club ${clubId}`);
      const { createSuccessResponse } = await import('./api-response-standards');
      res.json(createSuccessResponse(transformToApiFormat(transformedResults)));
    } catch (error) {
      console.error('Error fetching simplified club games:', error);
      res.status(500).json({ error: 'Failed to fetch simplified club games' });
    }
  });

  // Team-specific simplified games endpoint
  app.get("/api/teams/:teamId/games/simplified", standardAuth({ requireClub: true }), async (req: AuthenticatedRequest, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      if (isNaN(teamId)) {
        return res.status(400).json({ error: 'Invalid team ID' });
      }
      const result = await db.execute(sql`
        SELECT 
          g.id,
          g.date,
          g.round,
          g.home_team_id,
          g.away_team_id,
          gs.name as status_name,
          gs.is_completed as status_is_completed,
          ht.name as home_team_name,
          at.name as away_team_name,
          (SELECT COUNT(*) FROM game_stats WHERE game_id = g.id) as stats_count,
          COALESCE(
            (SELECT JSON_AGG(
              JSON_BUILD_OBJECT(
                'homeScore', COALESCE((SELECT score FROM game_scores WHERE game_id = g.id AND team_id = g.home_team_id AND quarter = q.quarter), 0),
                'awayScore', COALESCE((SELECT score FROM game_scores WHERE game_id = g.id AND team_id = g.away_team_id AND quarter = q.quarter), 0)
              ) ORDER BY q.quarter
            ) FROM (SELECT 1 as quarter UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) q),
            '[]'::json
          ) as quarter_scores
        FROM games g
        LEFT JOIN game_statuses gs ON g.status_id = gs.id
        JOIN teams ht ON g.home_team_id = ht.id
        LEFT JOIN teams at ON g.away_team_id = at.id
        WHERE g.home_team_id = ${teamId} OR g.away_team_id = ${teamId}
        ORDER BY g.date DESC, g.time DESC
      `);
      const transformedResults = result.rows.map(game => ({
        ...game,
        quarter_scores: Array.isArray(game.quarter_scores) ? game.quarter_scores : []
      }));
      const { createSuccessResponse } = await import('./api-response-standards');
      res.json(createSuccessResponse(transformToApiFormat(transformedResults)));
    } catch (error) {
      console.error('=== ERROR IN TEAM SIMPLIFIED ENDPOINT ===');
      console.error('Error details:', error);
      console.error('Stack trace:', error.stack);
      res.status(500).json({ error: 'Failed to fetch simplified team games', details: error.message });
    }
  });

  app.get("/api/games", standardAuth({ requireClub: true }), async (req: AuthenticatedRequest, res) => {
    try {
      res.set('Cache-Control', 'public, max-age=300, s-maxage=300');
      res.set('ETag', `games-${req.user?.currentClubId}-${Date.now()}`);
      res.set('Vary', 'x-current-club-id, x-current-team-id');
      const isClubWide = req.headers['x-club-wide'] === 'true';
      const teamId = req.query.teamId ? parseInt(req.query.teamId as string, 10) : 
                     (req.headers['x-current-team-id'] ? parseInt(req.headers['x-current-team-id'] as string, 10) : null);
      const clubId = req.user?.currentClubId;
      console.log(`Games endpoint: clubId=${clubId}, teamId=${teamId}, isClubWide=${isClubWide}, headers:`, {
        'x-current-team-id': req.headers['x-current-team-id'],
        'x-club-wide': req.headers['x-club-wide']
      });
      if (!clubId) {
        return res.status(400).json({ error: 'Club context required - please refresh the page' });
      }
      let result;
      if (teamId && !isClubWide) {
        console.log(`Filtering games for specific team: ${teamId}`);
        result = await db.execute(sql`
          SELECT 
            g.*,
            gs.name as status, 
            gs.display_name as status_display_name, 
            gs.is_completed, 
            gs.allows_statistics, 
            gs.home_team_goals, 
            gs.away_team_goals,
            s.name as season_name, 
            s.start_date as season_start, 
            s.end_date as season_end, 
            s.is_active as season_active,
            ht.name as home_team_name, 
            ht.division_id as home_team_division, 
            ht.club_id as home_club_id,
            at.name as away_team_name, 
            at.division_id as away_team_division, 
            at.club_id as away_club_id,
            hc.name as home_club_name, 
            hc.code as home_club_code,
            ac.name as away_club_name, 
            ac.code as away_club_code
          FROM games g
          LEFT JOIN game_statuses gs ON g.status_id = gs.id
          LEFT JOIN seasons s ON g.season_id = s.id
          LEFT JOIN teams ht ON g.home_team_id = ht.id
          LEFT JOIN teams at ON g.away_team_id = at.id
          LEFT JOIN clubs hc ON ht.club_id = hc.id
          LEFT JOIN clubs ac ON at.club_id = ac.id
          WHERE (g.home_team_id = ${teamId} OR g.away_team_id = ${teamId})
          ORDER BY g.date DESC, g.time DESC
        `);
      } else {
        console.log(`Showing club-wide games for club: ${clubId}`);
        result = await db.execute(sql`
          SELECT 
            g.*,
            gs.name as status, 
            gs.display_name as status_display_name, 
            gs.is_completed, 
            gs.allows_statistics, 
            gs.home_team_goals, 
            gs.away_team_goals,
            s.name as season_name, 
            s.start_date as season_start, 
            s.end_date as season_end, 
            s.is_active as season_active,
            ht.name as home_team_name, 
            ht.division_id as home_team_division, 
            ht.club_id as home_club_id,
            at.name as away_team_name, 
            at.division_id as away_team_division, 
            at.club_id as away_club_id,
            hc.name as home_club_name, 
            hc.code as home_club_code,
            ac.name as away_club_name, 
            ac.code as away_club_code
          FROM games g
          LEFT JOIN game_statuses gs ON g.status_id = gs.id
          LEFT JOIN seasons s ON g.season_id = s.id
          LEFT JOIN teams ht ON g.home_team_id = ht.id
          LEFT JOIN teams at ON g.away_team_id = at.id
          LEFT JOIN clubs hc ON ht.club_id = hc.id
          LEFT JOIN clubs ac ON at.club_id = ac.id
          WHERE (ht.club_id = ${clubId} OR at.club_id = ${clubId} OR EXISTS (
            SELECT 1 FROM game_permissions gp 
            WHERE gp.game_id = g.id AND gp.club_id = ${clubId}
          ))
          ORDER BY g.date DESC, g.time DESC
        `);
      }
      const games = result.rows.map(transformGameRow);
      const { createSuccessResponse } = await import('./api-response-standards');
      res.json(createSuccessResponse(transformToApiFormat(games)));
    } catch (error) {
      console.error('Error fetching games:', error);
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });

  // Team-specific games endpoint (STANDARDIZED)
  app.get("/api/teams/:teamId/games", standardAuth({ requireClub: true }), async (req: AuthenticatedRequest, res) => {
    try {
      const teamId = parseInt(req.params.teamId, 10);
      const clubId = req.user?.currentClubId;
      if (isNaN(teamId)) {
        const { createErrorResponse, ErrorCodes } = await import('./api-response-standards');
        return res.status(400).json(createErrorResponse(
          ErrorCodes.INVALID_PARAMETER,
          'Invalid team ID format'
        ));
      }
      if (!clubId) {
        const { createErrorResponse, ErrorCodes } = await import('./api-response-standards');
        return res.status(400).json(createErrorResponse(
          ErrorCodes.UNAUTHORIZED,
          'Club context required'
        ));
      }
      res.set('Cache-Control', 'public, max-age=300, s-maxage=300');
      res.set('ETag', `team-${teamId}-games-${Date.now()}`);
      res.set('Vary', 'x-current-club-id, x-current-team-id');
      const result = await db.execute(sql`
        SELECT 
          g.*,
          gs.name as status, 
          gs.display_name as status_display_name, 
          gs.is_completed, 
          gs.allows_statistics, 
          gs.home_team_goals, 
          gs.away_team_goals,
          s.name as season_name, 
          s.start_date as season_start, 
          s.end_date as season_end, 
          s.is_active as season_active,
          ht.name as home_team_name, 
          ht.division_id as home_team_division, 
          ht.club_id as home_club_id,
          at.name as away_team_name, 
          at.division_id as away_team_division, 
          at.club_id as away_club_id,
          hc.name as home_club_name, 
          hc.code as home_club_code,
          ac.name as away_club_name, 
          ac.code as away_club_code
        FROM games g
        LEFT JOIN game_statuses gs ON g.status_id = gs.id
        LEFT JOIN seasons s ON g.season_id = s.id
        LEFT JOIN teams ht ON g.home_team_id = ht.id
        LEFT JOIN teams at ON g.away_team_id = at.id
        LEFT JOIN clubs hc ON ht.club_id = hc.id
        LEFT JOIN clubs ac ON at.club_id = ac.id
        WHERE (g.home_team_id = ${teamId} OR g.away_team_id = ${teamId})
        ORDER BY g.date DESC, g.time DESC
      `);
      const games = result.rows.map(transformGameRow);
      const { createSuccessResponse } = await import('./api-response-standards');
      res.json(createSuccessResponse(transformToApiFormat(games)));
    } catch (error) {
      console.error('Error fetching team games:', error);
      const { createErrorResponse, ErrorCodes } = await import('./api-response-standards');
      res.status(500).json(createErrorResponse(
        ErrorCodes.INTERNAL_ERROR,
        'Failed to fetch team games'
      ));
    }
  });

  app.get("/api/games/:id", standardAuth({ requireGameAccess: true }), async (req: AuthenticatedRequest, res) => {
    try {
      const gameId = Number(req.params.id);
      const result = await db.execute(sql`
        SELECT 
          g.*,
          gs.name as status, gs.display_name as status_display_name, gs.is_completed, gs.allows_statistics, gs.home_team_goals, gs.away_team_goals,
          s.name as season_name, s.start_date as season_start, s.end_date as season_end, s.is_active as season_active,
          ht.name as home_team_name, ht.division_id as home_team_division, ht.club_id as home_club_id,
          at.name as away_team_name, at.division_id as away_team_division, at.club_id as away_club_id,
          hc.name as home_club_name, hc.code as home_club_code,
          ac.name as away_club_name, ac.code as away_club_code
        FROM games g
        LEFT JOIN game_statuses gs ON g.status_id = gs.id
        LEFT JOIN seasons s ON g.season_id = s.id
        LEFT JOIN teams ht ON g.home_team_id = ht.id
        LEFT JOIN teams at ON g.away_team_id = at.id
        LEFT JOIN clubs hc ON ht.club_id = hc.id
        LEFT JOIN clubs ac ON at.club_id = ac.id
        WHERE g.id = ${gameId}
      `);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Game not found" });
      }
      const row = result.rows[0];
      const game = {
        id: row.id,
        date: row.date,
        time: row.time,
        homeTeamId: row.home_team_id,
        awayTeamId: row.away_team_id,
        venue: row.venue,
        isInterClub: row.is_inter_club,
        statusId: row.status_id,
        round: row.round,
        seasonId: row.season_id,
        notes: row.notes,
        awardWinnerId: row.award_winner_id,
        statusName: row.status,
        statusDisplayName: row.status_display_name,
        statusIsCompleted: row.is_completed,
        statusAllowsStatistics: row.allows_statistics,
        statusTeamGoals: row.home_team_goals,
        statusOpponentGoals: row.away_team_goals,
        seasonName: row.season_name,
        seasonStartDate: row.season_start,
        seasonEndDate: row.season_end,
        seasonIsActive: row.season_active,
        homeTeamName: row.home_team_name,
        homeTeamDivision: row.home_team_division,
        homeClubId: row.home_club_id,
        homeClubName: row.home_club_name,
        homeClubCode: row.home_club_code,
        awayTeamName: row.away_team_name,
        awayTeamDivision: row.away_team_division,
        awayClubId: row.away_club_id,
        awayClubName: row.away_club_name,
        awayClubCode: row.away_club_code,
        isBye: row.away_team_name === 'Bye',
        home_team_name: row.home_team_name,
        away_team_name: row.away_team_name
      };
      const { createSuccessResponse } = await import('./api-response-standards');
      res.json(createSuccessResponse(transformToApiFormat(game)));
    } catch (error) {
      console.error('Error fetching game:', error);
      res.status(500).json({ message: "Failed to fetch game" });
    }
  });

  app.post("/api/games", async (req, res) => {
    try {
      if (req.body.isBye === true || req.body.status_id === 6) {
        if (!req.body.home_team_id) {
          return res.status(400).json({ 
            message: "Home team is required for BYE games" 
          });
        }
        const homeTeam = await db.execute(sql`
          SELECT season_id, club_id FROM teams WHERE id = ${req.body.home_team_id}
        `);
        if (homeTeam.rows.length === 0) {
          return res.status(400).json({ 
            message: "Home team not found" 
          });
        }
        const season_id = homeTeam.rows[0].season_id;
        const gameData = {
          date: req.body.date,
          time: req.body.time,
          homeTeamId: req.body.home_team_id,
          awayTeamId: null,
          statusId: 6,
          seasonId: season_id,
          round: req.body.round || null,
          venue: req.body.venue || null,
          isInterClub: false,
          notes: req.body.notes || 'BYE round'
        };
        const game = await storage.createGame(gameData);
        console.log("Created BYE game:", game);
        return res.status(201).json(transformToApiFormat(game));
      } else {
        if (!req.body.home_team_id || !req.body.away_team_id) {
          return res.status(400).json({ 
            message: "Invalid game data", 
            errors: [{ message: "Both home and away teams are required for regular games" }] 
          });
        }
        const gameData = {
          date: req.body.date,
          time: req.body.time,
          homeTeamId: typeof req.body.home_team_id === 'string' 
            ? parseInt(req.body.home_team_id, 10) 
            : req.body.home_team_id,
          awayTeamId: typeof req.body.away_team_id === 'string' 
            ? parseInt(req.body.away_team_id, 10) 
            : req.body.away_team_id,
          statusId: req.body.status_id || 1,
          seasonId: req.body.season_id,
          round: req.body.round || null,
          venue: req.body.venue || null,
          isInterClub: req.body.is_inter_club || false,
          notes: req.body.notes || null
        };
        console.log("Creating regular game:", gameData);
        const game = await storage.createGame(gameData);
        console.log("Created regular game:", game);
        return res.status(201).json(transformToApiFormat(game));
      }
    } catch (error) {
      const err = error as Error;
      console.error("Game creation error:", err);
      res.status(500).json({ 
        message: "Failed to create game", 
        error: err.message || "Unknown error"
      });
    }
  });

  app.patch("/api/games/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (req.body.statusId === 6) {
        req.body.awayTeamId = null;
      } else if (req.body.statusId && req.body.statusId !== 6) {
        if (!req.body.homeTeamId || !req.body.awayTeamId) {
          return res.status(400).json({ message: "Both home and away teams are required for regular games" });
        }
      }
      if (req.body.statusId !== undefined) {
        const statusId = parseInt(req.body.statusId);
        if (isNaN(statusId)) {
          return res.status(400).json({ message: "Invalid statusId - must be a number" });
        }
        req.body.statusId = statusId;
        console.log(`Updating game status to statusId: ${statusId}`);
      }
      if (req.body.status) {
        // Legacy status handling - just log for debugging
      }
      const updatedGame = await storage.updateGame(id, req.body);
      if (!updatedGame) {
        return res.status(404).json({ message: "Game not found" });
      }
      const { createSuccessResponse } = await import('./api-response-standards');
      res.json(createSuccessResponse(transformToApiFormat(updatedGame)));
    } catch (error) {
      console.error("Game update error:", error);
      res.status(500).json({ message: "Failed to update game" });
    }
  });

  app.delete("/api/games/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteRostersByGame(id);
      await storage.deleteGameStatsByGame(id);
      const success = await storage.deleteGame(id);
      if (!success) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete game" });
    }
  });
} 