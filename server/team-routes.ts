import type { Express, Response } from "express";
import { db, pool } from "./db";
import { sql, eq, and } from "drizzle-orm";
import { teams, teamPlayers, rosters } from "@shared/schema";
import { 
  AuthenticatedRequest, 
  requireClubAccess,
  requireTeamGameAccess,
  standardAuth
} from "./auth-middleware";
import { transformToApiFormat } from './api-utils';
import snakecaseKeys from 'snakecase-keys';
import camelcaseKeys from 'camelcase-keys';
import { storage } from './storage';

export function registerTeamRoutes(app: Express) {
  // Get all teams for a season
  app.get("/api/seasons/:seasonId/teams", async (req, res) => {
    try {
      const seasonId = parseInt(req.params.seasonId);

      const teams = await db.execute(sql`
        SELECT t.*, c.name as club_name, c.code as club_code
        FROM teams t
        JOIN clubs c ON t.club_id = c.id
        WHERE t.season_id = ${seasonId} AND t.is_active = true
        ORDER BY t.name
      `);

      const { createSuccessResponse } = await import('./api-response-standards');
      res.json(createSuccessResponse(transformToApiFormat(teams.rows)));
    } catch (error) {
      console.error("Error fetching teams:", error);
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });

  // Get all team-player assignments for a season
  app.get("/api/seasons/:seasonId/team-assignments", async (req, res) => {
    try {
      const seasonId = parseInt(req.params.seasonId);

      const assignments = await db.execute(sql`
        SELECT tp.team_id, tp.player_id, t.name as team_name, p.display_name
        FROM team_players tp
        JOIN teams t ON tp.team_id = t.id
        JOIN players p ON tp.player_id = p.id
        WHERE t.season_id = ${seasonId} AND t.is_active = true AND p.active = true
        ORDER BY t.name, p.display_name
      `);

      const mappedAssignments = assignments.rows.map(row => ({
        teamId: row.team_id,
        playerId: row.player_id,
        teamName: row.team_name,
        playerName: row.display_name
      }));

      const { createSuccessResponse } = await import('./api-response-standards');
      res.json(createSuccessResponse(transformToApiFormat(mappedAssignments)));
    } catch (error) {
      console.error("Error fetching team assignments:", error);
      res.status(500).json({ message: "Failed to fetch team assignments" });
    }
  });

  // Get or create default team for a season
  app.get("/api/seasons/:seasonId/default-team", async (req, res) => {
    try {
      const seasonId = parseInt(req.params.seasonId);

      // Try to find existing default team
      let team = await db.execute(sql`
        SELECT t.*, c.name as club_name, c.code as club_code
        FROM teams t
        JOIN clubs c ON t.club_id = c.id
        WHERE t.season_id = ${seasonId} AND c.code = 'DEFAULT'
        LIMIT 1
      `);

      if (team.rows.length === 0) {
        // Create default team if it doesn't exist
        const defaultClub = await db.execute(sql`
          SELECT id FROM clubs WHERE code = 'DEFAULT' LIMIT 1
        `);

        if (defaultClub.rows.length === 0) {
          return res.status(404).json({ message: "Default club not found" });
        }

        const clubId = defaultClub.rows[0].id;

        // Create the team
        await db.execute(sql`
          INSERT INTO teams (club_id, season_id, name, division_id)
          VALUES (${clubId}, ${seasonId}, 'Main Team', 1)
        `);

        // Fetch the newly created team
        team = await db.execute(sql`
          SELECT t.*, c.name as club_name, c.code as club_code
          FROM teams t
          JOIN clubs c ON t.club_id = c.id
          WHERE t.season_id = ${seasonId} AND c.code = 'DEFAULT'
          LIMIT 1
        `);
      }

      const { createSuccessResponse } = await import('./api-response-standards');
      res.json(createSuccessResponse(transformToApiFormat(team.rows[0])));
    } catch (error) {
      console.error("Error getting/creating default team:", error);
      res.status(500).json({ message: "Failed to get default team" });
    }
  });

  // DEPRECATED: Use /api/clubs/:clubId/teams instead
  // This endpoint is kept for backward compatibility but should not be used
  app.get("/api/teams", requireClubAccess(), async (req: AuthenticatedRequest, res) => {
    try {
      const clubId = req.user?.currentClubId;

      if (!clubId) {
        return res.status(400).json({ message: "Club context not available" });
      }

      const clubTeams = await db.execute(sql`
        SELECT 
          t.id,
          t.name,
          t.division_id,
          t.is_active,
          t.created_at,
          t.updated_at,
          s.id as season_id,
          s.name as season_name, 
          s.year as season_year,
          s.start_date as season_start_date,
          s.end_date as season_end_date,
          d.display_name as division_name
        FROM teams t
        LEFT JOIN seasons s ON t.season_id = s.id
        LEFT JOIN divisions d ON t.division_id = d.id
        WHERE t.club_id = ${clubId} AND t.is_active = true
        ORDER BY s.start_date DESC, t.name
      `);

      const teams = clubTeams.rows.map(row => ({
        id: row.id,
        name: row.name,
        divisionId: row.division_id,
        divisionName: row.division_name,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        seasonId: row.season_id,
        seasonName: row.season_name,
        seasonYear: row.season_year,
        seasonStartDate: row.season_start_date,
        seasonEndDate: row.season_end_date,
      }));

      const { createSuccessResponse } = await import('./api-response-standards');
      res.json(createSuccessResponse(transformToApiFormat(teams)));
    } catch (error) {
      console.error("Error fetching teams:", error);
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });

  // Get all teams for a club (STANDARDIZED)
  app.get("/api/clubs/:clubId/teams", requireClubAccess(), async (req: AuthenticatedRequest, res) => {
    try {
      const clubId = parseInt(req.params.clubId);

      if (isNaN(clubId) || clubId <= 0) {
        const { createErrorResponse, ErrorCodes } = await import('./api-response-standards');
        return res.status(400).json(createErrorResponse(
          ErrorCodes.INVALID_PARAMETER,
          'Invalid club ID format'
        ));
      }

      const clubTeams = await db.execute(sql`
        SELECT 
          t.id,
          t.name,
          t.division_id,
          t.is_active,
          t.created_at,
          t.updated_at,
          s.id as season_id,
          s.name as season_name, 
          s.year as season_year,
          s.start_date as season_start_date,
          s.end_date as season_end_date,
          d.display_name as division_name
        FROM teams t
        LEFT JOIN seasons s ON t.season_id = s.id
        LEFT JOIN divisions d ON t.division_id = d.id
        WHERE t.club_id = ${clubId} AND t.is_active = true
        ORDER BY s.start_date DESC, t.name
      `);

      const teams = clubTeams.rows.map(row => ({
        id: row.id,
        name: row.name,
        divisionId: row.division_id,
        divisionName: row.division_name,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        seasonId: row.season_id,
        seasonName: row.season_name,
        seasonYear: row.season_year,
        seasonStartDate: row.season_start_date,
        seasonEndDate: row.season_end_date,
      }));
      
      const { createSuccessResponse } = await import('./api-response-standards');
      res.json(createSuccessResponse(transformToApiFormat(teams)));
    } catch (error) {
      console.error("Error fetching teams:", error);
      const { createErrorResponse, ErrorCodes } = await import('./api-response-standards');
      res.status(500).json(createErrorResponse(
        ErrorCodes.INTERNAL_ERROR,
        'Failed to fetch teams'
      ));
    }
  });

  // Create a new team
  app.post("/api/teams", async (req, res) => {
    try {
      const { club_id: clubId, season_id: seasonId, name, division_id: divisionId, is_active: isActive } = req.body;

      if (!clubId || !seasonId || !name) {
        return res.status(400).json({ message: "Club ID, season ID, and name are required" });
      }

      const result = await db.execute(sql`
        INSERT INTO teams (club_id, season_id, name, division_id, is_active)
        VALUES (${clubId}, ${seasonId}, ${name}, ${divisionId || 1}, ${isActive !== false})
        RETURNING *
      `);

      const { createSuccessResponse } = await import('./api-response-standards');
      res.status(201).json(createSuccessResponse(transformToApiFormat(result.rows[0], '/api/teams')));
    } catch (error) {
      if (error.message?.includes('duplicate key')) {
        res.status(400).json({ message: "Team with this name already exists for this club and season" });
      } else {
        console.error("Error creating team:", error);
        res.status(500).json({ message: "Failed to create team" });
      }
    }
  });

  // Update team (PATCH method)
  app.patch("/api/teams/:id", async (req, res) => {
    try {
      const teamId = parseInt(req.params.id);
      // Convert incoming data to snake_case for DB
      const updateData = snakecaseKeys(req.body);
      updateData.updated_at = new Date();

      const result = await db.update(teams)
        .set(updateData)
        .where(eq(teams.id, teamId))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ message: "Team not found" });
      }

      // Convert DB result to camelCase for frontend
      const { createSuccessResponse } = await import('./api-response-standards');
      res.json(createSuccessResponse(camelcaseKeys(result[0])));
    } catch (error) {
      console.error("Error updating team:", error);
      res.status(500).json({ message: "Failed to update team" });
    }
  });

  // Delete team
  app.delete("/api/teams/:id", async (req, res) => {
    try {
      const teamId = parseInt(req.params.id);

      // Check if team has any games
      const games = await db.execute(sql`
        SELECT COUNT(*) as count FROM games 
        WHERE home_team_id = ${teamId} OR away_team_id = ${teamId}
      `);

      const gameCount = games.rows[0]?.count || 0;

      // If team has games, update those games to remove team references
      if (gameCount > 0) {
        // Update games to remove team references
        await db.execute(sql`
          UPDATE games 
          SET home_team_id = NULL 
          WHERE home_team_id = ${teamId}
        `);

        await db.execute(sql`
          UPDATE games 
          SET away_team_id = NULL 
          WHERE away_team_id = ${teamId}
        `);
      }

      // Delete the team
      const result = await db.execute(sql`
        DELETE FROM teams WHERE id = ${teamId} RETURNING id
      `);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Team not found" });
      }

      // Return success with information about games that were updated
      const { createSuccessResponse } = await import('./api-response-standards');
      res.json(createSuccessResponse({ 
        message: gameCount > 0 
          ? `Team deleted successfully. ${gameCount} games updated to remove team references.`
          : "Team deleted successfully.",
        gamesUpdated: gameCount
      }));
    } catch (error) {
      console.error("Error deleting team:", error);
      res.status(500).json({ message: "Failed to delete team" });
    }
  });

  // Get all teams across all clubs (STANDARDIZED)
  app.get("/api/teams/all", async (req, res) => {
    try {
      const teams = await db.execute(sql`
        SELECT 
          t.id,
          t.name,
          t.division_id,
          t.club_id,
          t.season_id,
          t.is_active,
          t.created_at,
          t.updated_at,
          c.name as club_name,
          c.code as club_code,
          s.id as season_id,
          s.name as season_name, 
          s.year as season_year,
          s.start_date as season_start_date,
          s.end_date as season_end_date,
          d.display_name as division_name
        FROM teams t
        LEFT JOIN clubs c ON t.club_id = c.id
        LEFT JOIN seasons s ON t.season_id = s.id
        LEFT JOIN divisions d ON t.division_id = d.id
        WHERE t.is_active = true AND c.is_active = true
        ORDER BY c.name, t.name
      `);

      const mappedTeams = teams.rows.map(row => ({
        id: row.id,
        name: row.name,
        divisionId: row.division_id,
        divisionName: row.division_name,
        clubId: row.club_id,
        seasonId: row.season_id,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        clubName: row.club_name,
        clubCode: row.club_code,
        seasonName: row.season_name,
        seasonYear: row.season_year,
        seasonStartDate: row.season_start_date,
        seasonEndDate: row.season_end_date,
      }));

      const { createSuccessResponse } = await import('./api-response-standards');
      res.json(createSuccessResponse(transformToApiFormat(mappedTeams)));
    } catch (error) {
      console.error("Error fetching all teams:", error);
      const { createErrorResponse, ErrorCodes } = await import('./api-response-standards');
      res.status(500).json(createErrorResponse(
        ErrorCodes.INTERNAL_ERROR,
        'Failed to fetch all teams'
      ));
    }
  });

  // Note: /api/clubs endpoint moved to club-routes.ts to avoid conflicts

  // Get team by ID
  app.get('/api/teams/:id', requireClubAccess(), async (req: AuthenticatedRequest, res) => {
    try {
      const teamId = parseInt(req.params.id);
      
      if (isNaN(teamId)) {
        const { createErrorResponse, ErrorCodes } = await import('./api-response-standards');
        return res.status(400).json(createErrorResponse(
          ErrorCodes.INVALID_PARAMETER,
          'Invalid team ID format'
        ));
      }
      
      const userClubs = req.user?.clubs?.map(c => c.clubId) || [];

      // Get team details and check if user has access to the team's club
      const team = await db.execute(sql`
        SELECT * FROM teams WHERE id = ${teamId}
      `);

      if (team.rows.length === 0) {
        const { createErrorResponse, ErrorCodes } = await import('./api-response-standards');
        return res.status(404).json(createErrorResponse(
          ErrorCodes.RESOURCE_NOT_FOUND,
          'Team not found'
        ));
      }

      const teamData = team.rows[0];

      // Check if user has access to this team's club
      if (!userClubs.includes(teamData.club_id)) {
        const { createErrorResponse, ErrorCodes } = await import('./api-response-standards');
        return res.status(403).json(createErrorResponse(
          ErrorCodes.FORBIDDEN,
          'Access denied to this team'
        ));
      }

      const { createSuccessResponse } = await import('./api-response-standards');
      res.json(createSuccessResponse(transformToApiFormat(teamData)));
    } catch (error) {
      console.error("Error fetching team:", error);
      const { createErrorResponse, ErrorCodes } = await import('./api-response-standards');
      res.status(500).json(createErrorResponse(
        ErrorCodes.INTERNAL_ERROR,
        'Failed to fetch team'
      ));
    }
  });


  // Add player to team
  app.post("/api/teams/:teamId/players", async (req, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      
      const { player_id: playerId, is_regular: isRegular = true } = req.body;
      
      if (!playerId) {
        return res.status(400).json({ message: "Player ID is required" });
      }

      // Get the team's season
      const teamSeason = await db.execute(sql`
        SELECT season_id FROM teams WHERE id = ${teamId}
      `);

      if (teamSeason.rows.length === 0) {
        return res.status(404).json({ message: "Team not found" });
      }

      const seasonId = teamSeason.rows[0].season_id;

      // Check if player is already on this team
      const existingAssignment = await db.select()
        .from(teamPlayers)
        .where(and(
          eq(teamPlayers.team_id, teamId),
          eq(teamPlayers.player_id, playerId)
        ))
        .limit(1);

      if (existingAssignment.length > 0) {
        return res.status(400).json({ message: "Player is already on this team" });
      }

      const result = await db.insert(teamPlayers)
        .values({
          team_id: teamId,
          player_id: playerId,
          is_regular: isRegular !== false
        })
        .returning();

      const { createSuccessResponse } = await import('./api-response-standards');
      res.status(201).json(createSuccessResponse(transformToApiFormat(result[0], '/api/teams')));
    } catch (error) {
      if (error.message?.includes('duplicate key')) {
        res.status(400).json({ message: "Player is already on this team" });
      } else {
        console.error("Error adding player to team:", error);
        res.status(500).json({ message: "Failed to add player to team" });
      }
    }
  });

  // Remove player from team
  app.delete("/api/teams/:teamId/players/:playerId", async (req, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      const playerId = parseInt(req.params.playerId);

      const result = await db.execute(sql`
        DELETE FROM team_players 
        WHERE team_id = ${teamId} AND player_id = ${playerId}
        RETURNING id
      `);

      if (result.rows.length === 0) {
        const { createErrorResponse } = await import('./api-response-standards');
        return res.status(404).json(createErrorResponse('NOT_FOUND', "Player not found on this team"));
      }

      // Return a success response instead of 204 No Content
      const { createSuccessResponse } = await import('./api-response-standards');
      res.json(createSuccessResponse({ message: "Player removed from team successfully" }));
    } catch (error) {
      console.error("Error removing player from team:", error);
      const { createErrorResponse, ErrorCodes } = await import('./api-response-standards');
      res.status(500).json(createErrorResponse(ErrorCodes.INTERNAL_ERROR, "Failed to remove player from team"));
    }
  });

  // Update team player settings
  app.patch("/api/teams/:teamId/players/:playerId", async (req, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      const playerId = parseInt(req.params.playerId);

      const { is_regular: isRegular, position_preferences: positionPreferences } = req.body;

      // Build update object dynamically
      const updateData: any = {};

      if (isRegular !== undefined) {
        updateData.is_regular = isRegular;
      }
      if (positionPreferences !== undefined) {
        updateData.position_preferences = positionPreferences;
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }

      // Use proper Drizzle ORM update
      const result = await db
        .update(teamPlayers)
        .set(updateData)
        .where(and(eq(teamPlayers.team_id, teamId), eq(teamPlayers.player_id, playerId)))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ message: "Team player not found" });
      }

      const { createSuccessResponse } = await import('./api-response-standards');
      res.json(createSuccessResponse(transformToApiFormat(result[0])));
    } catch (error) {
      console.error("Error updating team player:", error);
      res.status(500).json({ message: "Failed to update team player" });
    }
  });

  // Get players for a specific team (STANDARDIZED)
  app.get("/api/teams/:teamId/players", async (req, res) => {
    try {
      const teamId = parseInt(req.params.teamId);

      if (isNaN(teamId)) {
        const { createErrorResponse, ErrorCodes } = await import('./api-response-standards');
        return res.status(400).json(createErrorResponse(
          ErrorCodes.INVALID_PARAMETER,
          'Invalid team ID format'
        ));
      }

      // Verify team exists
      const team = await db.execute(sql`
        SELECT id FROM teams WHERE id = ${teamId}
      `);

      if (team.rows.length === 0) {
        const { createErrorResponse, ErrorCodes } = await import('./api-response-standards');
        return res.status(404).json(createErrorResponse(
          ErrorCodes.RESOURCE_NOT_FOUND,
          'Team not found'
        ));
      }

      const result = await db.execute(sql`
        SELECT 
          p.id,
          p.display_name,
          p.first_name,
          p.last_name,
          p.date_of_birth,
          p.position_preferences,
          p.active,
          p.avatar_color,
          tp.is_regular,
          tp.position_preferences as team_position_preferences
        FROM players p
        JOIN team_players tp ON p.id = tp.player_id
        WHERE tp.team_id = ${teamId}
        ORDER BY p.display_name, p.first_name, p.last_name
      `);

      // Transform the data to match the expected camelCase format consistently with storage layer
      const players = result.rows.map(row => ({
        id: row.id,
        displayName: row.display_name,
        firstName: row.first_name,
        lastName: row.last_name,
        dateOfBirth: row.date_of_birth,
        positionPreferences: typeof row.position_preferences === 'string' 
          ? JSON.parse(row.position_preferences) 
          : row.position_preferences || [],
        active: row.active,
        avatarColor: row.avatar_color,
        isRegular: row.is_regular,
        teamPositionPreferences: row.team_position_preferences ? JSON.parse(row.team_position_preferences) : []
      }));
      
      const { createSuccessResponse } = await import('./api-response-standards');
      res.json(createSuccessResponse(transformToApiFormat(players)));
    } catch (error) {
      console.error("Error fetching team players:", error);
      const { createErrorResponse, ErrorCodes } = await import('./api-response-standards');
      res.status(500).json(createErrorResponse(
        ErrorCodes.INTERNAL_ERROR,
        'Failed to fetch team players'
      ));
    }
  });



  // Get team statistics (aggregated across all games)
  app.get('/api/teams/:teamId/stats', requireClubAccess(), async (req: AuthenticatedRequest, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      const userClubs = req.user?.clubs?.map(c => c.clubId) || [];

      if (isNaN(teamId)) {
        return res.status(400).json({ error: 'Invalid team ID' });
      }

      // Get team details to check club access
      const team = await db.execute(sql`
        SELECT club_id FROM teams WHERE id = ${teamId}
      `);

      if (team.rows.length === 0) {
        return res.status(404).json({ error: 'Team not found' });
      }

      const teamClubId = team.rows[0].club_id;
      if (!userClubs.includes(teamClubId)) {
        return res.status(403).json({ error: 'Access denied to this team' });
      }

      // Get aggregated team statistics
      const stats = await db.execute(sql`
        SELECT 
          COUNT(DISTINCT g.id) as total_games,
          COUNT(DISTINCT CASE WHEN g.status_id = 3 THEN g.id END) as completed_games,
          SUM(CASE WHEN gs.team_id = ${teamId} THEN gs.goals_for ELSE 0 END) as total_goals_for,
          SUM(CASE WHEN gs.team_id = ${teamId} THEN gs.goals_against ELSE 0 END) as total_goals_against,
          AVG(CASE WHEN gs.team_id = ${teamId} THEN gs.goals_for END) as avg_goals_for,
          AVG(CASE WHEN gs.team_id = ${teamId} THEN gs.goals_against END) as avg_goals_against
        FROM games g
        LEFT JOIN game_stats gs ON g.id = gs.game_id
        WHERE (g.home_team_id = ${teamId} OR g.away_team_id = ${teamId})
      `);

      const { createSuccessResponse } = await import('./api-response-standards');
      res.json(createSuccessResponse(transformToApiFormat(stats.rows[0] || {})));
    } catch (error) {
      console.error('Error fetching team stats:', error);
      res.status(500).json({ error: 'Failed to fetch team stats' });
    }
  });

  // Get team roster for a specific game
  app.get('/api/teams/:teamId/roster/:gameId', requireClubAccess(), async (req: AuthenticatedRequest, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      const gameId = parseInt(req.params.gameId);
      const userClubs = req.user?.clubs?.map(c => c.clubId) || [];

      if (isNaN(teamId) || isNaN(gameId)) {
        return res.status(400).json({ error: 'Invalid team ID or game ID' });
      }

      // Get team details to check club access
      const team = await db.execute(sql`
        SELECT club_id FROM teams WHERE id = ${teamId}
      `);

      if (team.rows.length === 0) {
        return res.status(404).json({ error: 'Team not found' });
      }

      const teamClubId = team.rows[0].club_id;
      if (!userClubs.includes(teamClubId)) {
        return res.status(403).json({ error: 'Access denied to this team' });
      }

      // Verify the team is actually playing in this game
      const gameCheck = await db.execute(sql`
        SELECT id FROM games 
        WHERE id = ${gameId} AND (home_team_id = ${teamId} OR away_team_id = ${teamId})
      `);

      if (gameCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Team is not playing in this game' });
      }

      // Get roster entries for this team's game
      const roster = await db.execute(sql`
        SELECT 
          r.id,
          r.game_id,
          r.quarter,
          r.position,
          r.player_id,
          p.display_name,
          p.first_name,
          p.last_name,
          p.avatar_color
        FROM rosters r
        JOIN players p ON r.player_id = p.id
        WHERE r.game_id = ${gameId}
        ORDER BY r.quarter, r.position
      `);

      const mappedRoster = roster.rows.map(row => ({
        id: row.id,
        gameId: row.game_id,
        quarter: row.quarter,
        position: row.position,
        playerId: row.player_id,
        playerName: row.display_name,
        firstName: row.first_name,
        lastName: row.last_name,
        avatarColor: row.avatar_color
      }));

      const { createSuccessResponse } = await import('./api-response-standards');
      res.json(createSuccessResponse(transformToApiFormat(mappedRoster)));
    } catch (error) {
      console.error('Error fetching team roster:', error);
      res.status(500).json({ error: 'Failed to fetch team roster' });
    }
  });

  // Get game from team perspective - provides context for win/loss calculation
  app.get('/api/teams/:teamId/games/:gameId', requireClubAccess(), async (req: AuthenticatedRequest, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      const gameId = parseInt(req.params.gameId);
      const userClubs = req.user?.clubs?.map(c => c.clubId) || [];

      if (isNaN(teamId) || isNaN(gameId)) {
        return res.status(400).json({ error: 'Invalid team ID or game ID' });
      }

      // Get team details to check club access
      const team = await db.execute(sql`
        SELECT club_id FROM teams WHERE id = ${teamId}
      `);

      if (team.rows.length === 0) {
        return res.status(404).json({ error: 'Team not found' });
      }

      const teamClubId = team.rows[0].club_id;
      if (!userClubs.includes(teamClubId)) {
        return res.status(403).json({ error: 'Access denied to this team' });
      }

      // Get game details with team perspective
      const result = await db.execute(sql`
        SELECT 
          g.*,
          gs.name AS status,
          gs.display_name AS status_display_name,
          gs.is_completed,
          gs.allows_statistics,
          gs.home_team_goals,
          gs.away_team_goals,
          s.name AS season_name,
          s.start_date AS season_start,
          s.end_date AS season_end,
          s.is_active AS season_active,
          ht.name AS home_team_name,
          ht.division_id AS home_team_division,
          ht.club_id AS home_club_id,
          at.name AS away_team_name,
          at.division_id AS away_team_division,
          at.club_id AS away_club_id,
          hc.name AS home_club_name,
          hc.code AS home_club_code,
          ac.name AS away_club_name,
          ac.code AS away_club_code,
          CASE 
            WHEN g.home_team_id = ${teamId} THEN 'home'
            WHEN g.away_team_id = ${teamId} THEN 'away'
            ELSE NULL
          END AS team_role
        FROM games g
        LEFT JOIN game_statuses gs ON g.status_id = gs.id
        LEFT JOIN seasons s ON g.season_id = s.id
        LEFT JOIN teams ht ON g.home_team_id = ht.id
        LEFT JOIN teams at ON g.away_team_id = at.id
        LEFT JOIN clubs hc ON ht.club_id = hc.id
        LEFT JOIN clubs ac ON at.club_id = ac.id
        WHERE g.id = ${gameId}
          AND (g.home_team_id = ${teamId} OR g.away_team_id = ${teamId})
      `);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Game not found for this team' });
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

        // Game Status fields
        statusName: row.status,
        statusDisplayName: row.status_display_name,
        statusIsCompleted: row.is_completed,
        statusAllowsStatistics: row.allows_statistics,
        statusTeamGoals: row.home_team_goals,
        statusOpponentGoals: row.away_team_goals,

        // Season fields
        seasonName: row.season_name,
        seasonStartDate: row.season_start,
        seasonEndDate: row.season_end,
        seasonIsActive: row.season_active,

        // Team fields
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

        // Team perspective context
        teamPerspective: row.team_role, // 'home' or 'away'
        ourTeamId: teamId,
        opponentTeamId: row.home_team_id === teamId ? row.away_team_id : row.home_team_id,

        // Legacy fields
        isBye: row.away_team_name === 'Bye'
      };

      const { createSuccessResponse } = await import('./api-response-standards');
      res.json(createSuccessResponse(transformToApiFormat(game)));
    } catch (error) {
      console.error('Error fetching team-perspective game:', error);
      res.status(500).json({ error: 'Failed to fetch game' });
    }
  });

  // Get team player availability for a specific game
  app.get('/api/teams/:teamId/availability/:gameId', requireClubAccess(), async (req: AuthenticatedRequest, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      const gameId = parseInt(req.params.gameId);
      const userClubs = req.user?.clubs?.map(c => c.clubId) || [];

      if (isNaN(teamId) || isNaN(gameId)) {
        return res.status(400).json({ error: 'Invalid team ID or game ID' });
      }

      // Get team details to check club access
      const team = await db.execute(sql`
        SELECT club_id FROM teams WHERE id = ${teamId}
      `);

      if (team.rows.length === 0) {
        return res.status(404).json({ error: 'Team not found' });
      }

      const teamClubId = team.rows[0].club_id;
      if (!userClubs.includes(teamClubId)) {
        return res.status(403).json({ error: 'Access denied to this team' });
      }

      // Get availability data for team players for this specific game
      const availability = await db.execute(sql`
        SELECT 
          p.id as player_id,
          p.display_name,
          COALESCE(pa.is_available, true) as is_available
        FROM players p
        JOIN team_players tp ON p.id = tp.player_id
        LEFT JOIN player_availability pa ON p.id = pa.player_id AND pa.game_id = ${gameId}
        WHERE tp.team_id = ${teamId} AND p.active = true
        ORDER BY p.display_name
      `);

      const mappedAvailability = availability.rows.map(row => ({
        playerId: row.player_id,
        playerName: row.display_name,
        isAvailable: row.is_available
      }));

      const { createSuccessResponse } = await import('./api-response-standards');
      res.json(createSuccessResponse(transformToApiFormat(mappedAvailability)));
    } catch (error) {
      console.error('Error fetching team availability:', error);
      res.status(500).json({ error: 'Failed to fetch team availability' });
    }
  });

  // Get available players for a team (not assigned to any team in the season)
  app.get('/api/teams/:teamId/available-players', requireClubAccess(), async (req: AuthenticatedRequest, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      const seasonId = parseInt(req.query.seasonId as string);
      const userClubs = req.user?.clubs?.map(c => c.clubId) || [];

      if (!seasonId) {
        return res.status(400).json({ error: 'Season ID is required' });
      }

      // Get team details to check club access
      const team = await db.execute(sql`
        SELECT club_id FROM teams WHERE id = ${teamId}
      `);

      if (team.rows.length === 0) {
        return res.status(404).json({ error: 'Team not found' });
      }

      const teamClubId = team.rows[0].club_id;

      // Check if user has access to this team's club
      if (!userClubs.includes(teamClubId)) {
        return res.status(403).json({ error: 'Access denied to this team' });
      }

      // First, let's check what players exist in the club
      const clubPlayers = await db.execute(sql`
        SELECT p.id, p.display_name, cp.is_active as club_active
        FROM players p
        JOIN club_players cp ON p.id = cp.player_id
        WHERE cp.club_id = ${teamClubId}
        ORDER BY p.display_name
      `);

      // Check player seasons
      const playerSeasons = await db.execute(sql`
        SELECT ps.player_id, ps.season_id, p.display_name
        FROM player_seasons ps
        JOIN players p ON ps.player_id = p.id
        JOIN club_players cp ON p.id = cp.player_id
        WHERE cp.club_id = ${teamClubId} AND ps.season_id = ${seasonId}
        ORDER BY p.display_name
      `);

      // Check team assignments
      const teamAssignments = await db.execute(sql`
        SELECT tp.player_id, tp.team_id, p.display_name, t.name as team_name
        FROM team_players tp
        JOIN players p ON tp.player_id = p.id
        JOIN teams t ON tp.team_id = t.id
        WHERE t.season_id = ${seasonId}
        ORDER BY p.display_name
      `);

      // Get all active players from the team's club who are not assigned to any team in this season
      // This is more inclusive - players will be auto-assigned to seasons when added to teams
      const availablePlayers = await db.execute(sql`
        SELECT p.id, p.display_name, p.first_name, p.last_name, p.date_of_birth, 
               p.position_preferences, p.active, p.avatar_color
        FROM players p
        JOIN club_players cp ON p.id = cp.player_id
        WHERE cp.club_id = ${teamClubId} 
          AND cp.is_active = true
          AND p.active = true
          AND NOT EXISTS (
            SELECT 1
            FROM team_players tp
            JOIN teams t ON tp.team_id = t.id
            WHERE tp.player_id = p.id
              AND t.season_id = ${seasonId}
          )
        ORDER BY p.display_name
      `);

      const mappedAvailablePlayers = availablePlayers.rows.map(row => ({
        id: row.id,
        displayName: row.display_name,
        firstName: row.first_name,
        lastName: row.last_name,
        dateOfBirth: row.date_of_birth,
        positionPreferences: typeof row.position_preferences === 'string'
          ? JSON.parse(row.position_preferences)
          : row.position_preferences || [],
        active: row.active,
        avatarColor: row.avatar_color
      }));

      const { createSuccessResponse } = await import('./api-response-standards');
      res.json(createSuccessResponse(transformToApiFormat(mappedAvailablePlayers)));
    } catch (error) {
      console.error("Error fetching available players:", error);
      res.status(500).json({ message: "Failed to fetch available players" });
    }
  });

  // Team-specific simplified games endpoint
  app.get("/api/teams/:teamId/games/simplified", standardAuth({ requireClub: true }), async (req: AuthenticatedRequest, res) => {
    try {
      const teamId = parseInt(req.params.teamId);

      if (isNaN(teamId)) {
        return res.status(400).json({ error: 'Invalid team ID' });
      }
      
      // Single optimized query for team-specific games with scores included
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

      // Transform results and return
      const transformedResults = result.rows.map(game => ({
        ...game,
        quarter_scores: Array.isArray(game.quarter_scores) ? game.quarter_scores : []
      }));

      const { createSuccessResponse } = await import('./api-response-standards');
      res.json(createSuccessResponse(transformToApiFormat(transformedResults)));
    } catch (error) {
      console.error('Error fetching simplified team games:', error);
      res.status(500).json({ error: 'Failed to fetch simplified team games' });
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

      // Set cache headers for team-specific data
      res.set('Cache-Control', 'public, max-age=300, s-maxage=300');
      res.set('ETag', `team-${teamId}-games-${Date.now()}`);
      res.set('Vary', 'x-current-club-id, x-current-team-id');

      // Query for team-specific games only
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

      // Use same transformation as main games endpoint
      const transformGameRow = (row: any) => ({
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
      });

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

  // Team-based get roster entries
  app.get('/api/teams/:teamId/games/:gameId/rosters', async (req: AuthenticatedRequest, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      const gameId = parseInt(req.params.gameId);
      const userClubs = req.user?.clubs?.map(c => c.clubId) || [];

      console.log(`Team-based roster fetch: teamId=${teamId}, gameId=${gameId}`);

      if (isNaN(teamId) || isNaN(gameId)) {
        return res.status(400).json({ error: 'Invalid team ID or game ID' });
      }

      // Get team details to check club access
      const team = await db.execute(sql`
        SELECT club_id FROM teams WHERE id = ${teamId}
      `);

      if (team.rows.length === 0) {
        return res.status(404).json({ error: 'Team not found' });
      }

      const teamClubId = team.rows[0].club_id;
      if (!userClubs.includes(teamClubId)) {
        return res.status(403).json({ error: 'Access denied to this team' });
      }

      // Verify the team is actually playing in this game
      const gameCheck = await db.execute(sql`
        SELECT id FROM games 
        WHERE id = ${gameId} AND (home_team_id = ${teamId} OR away_team_id = ${teamId})
      `);

      if (gameCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Team is not playing in this game' });
      }

      // Get roster entries for this team's game
      const roster = await db.execute(sql`
        SELECT 
          r.id,
          r.game_id,
          r.quarter,
          r.position,
          r.player_id,
          p.display_name,
          p.first_name,
          p.last_name,
          p.avatar_color
        FROM rosters r
        JOIN players p ON r.player_id = p.id
        WHERE r.game_id = ${gameId}
        ORDER BY r.quarter, r.position
      `);

      console.log(`Team-based roster fetch: Found ${roster.rows.length} roster entries for game ${gameId}`);

      const mappedRoster = roster.rows.map(row => ({
        id: row.id,
        gameId: row.game_id,
        quarter: row.quarter,
        position: row.position,
        playerId: row.player_id,
        playerName: row.display_name,
        firstName: row.first_name,
        lastName: row.last_name,
        avatarColor: row.avatar_color
      }));

      const { createSuccessResponse } = await import('./api-response-standards');
      res.json(createSuccessResponse(transformToApiFormat(mappedRoster)));
    } catch (error) {
      console.error('Error fetching team roster entries:', error);
      res.status(500).json({ error: 'Failed to fetch roster entries' });
    }
  });

  // Team-based delete roster entries
  app.delete('/api/teams/:teamId/games/:gameId/rosters', requireTeamGameAccess(true), async (req: AuthenticatedRequest, res) => {
    try {
      const { gameId } = req.params;
      await storage.deleteRostersByGame(parseInt(gameId));
      const { createSuccessResponse } = await import('./api-response-standards');
      res.json(createSuccessResponse({ message: `All roster entries for game ${gameId} deleted` }));
    } catch (error) {
      console.error('Error deleting team roster entries:', error);
      res.status(500).json({ error: 'Failed to delete roster entries' });
    }
  });

  // Team-based batch save roster entries
  app.post('/api/teams/:teamId/games/:gameId/rosters/batch', requireTeamGameAccess(true), async (req: AuthenticatedRequest, res) => {
    try {
      const { gameId } = req.params;
      const { rosters: rosterData } = req.body;

      if (!Array.isArray(rosterData)) {
        return res.status(400).json({ error: 'Rosters data must be an array' });
      }

      const gameIdNum = parseInt(gameId);
      console.log(`Team-based batch saving ${rosterData.length} roster entries for game ${gameIdNum}`);

      // Use a single transaction for the entire operation
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');

        // Delete all existing roster entries for this game in one operation
        const deleteResult = await client.query(
          'DELETE FROM rosters WHERE game_id = $1',
          [gameIdNum]
        );
        console.log(`Deleted ${deleteResult.rowCount} existing roster entries`);

        // Insert new roster entries
        if (rosterData.length > 0) {
          const insertQuery = `
            INSERT INTO rosters (game_id, player_id, position, quarter)
            VALUES ${rosterData.map((_, index) => 
              `($${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}, $${index * 4 + 4})`
            ).join(', ')};
          `;

          const insertValues = rosterData.flatMap(roster => [
            gameIdNum,
            roster.playerId,
            roster.position,
            roster.quarter
          ]);

          const insertResult = await client.query(insertQuery, insertValues);
          console.log(`Inserted ${insertResult.rowCount} new roster entries`);
        }

        await client.query('COMMIT');
        const { createSuccessResponse } = await import('./api-response-standards');
        res.json(createSuccessResponse({ 
          message: `Successfully saved ${rosterData.length} roster entries for game ${gameIdNum}` 
        }));

      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error in team-based batch roster save:', error);
      res.status(500).json({ error: 'Failed to save roster entries' });
    }
  });
}