import type { Express, Response } from "express";
import { db } from "./db";
import { sql, eq, and } from "drizzle-orm";
import { teams, teamPlayers } from "@shared/schema";
import { 
  AuthenticatedRequest, 
  requireClubAccess 
} from "./auth-middleware";

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

      res.json(teams.rows);
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

      res.json(mappedAssignments);
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
          INSERT INTO teams (club_id, season_id, name, division)
          VALUES (${clubId}, ${seasonId}, 'Main Team', 'Division 1')
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

      res.json(team.rows[0]);
    } catch (error) {
      console.error("Error getting/creating default team:", error);
      res.status(500).json({ message: "Failed to get default team" });
    }
  });

  // Get all teams for current user's club (matches players endpoint pattern)
  app.get("/api/teams", requireClubAccess(), async (req: AuthenticatedRequest, res) => {
    try {
      const clubId = req.user?.currentClubId;
      console.log(`Teams endpoint called for club ${clubId}`);
      console.log(`User context:`, req.user?.clubs?.map(c => c.clubId));

      if (!clubId) {
        return res.status(400).json({ message: "Club context not available" });
      }

      console.log(`Fetching teams for club ${clubId}`);

      const clubTeams = await db.execute(sql`
        SELECT 
          t.id,
          t.name,
          t.division,
          t.is_active,
          t.created_at,
          t.updated_at,
          s.id as season_id,
          s.name as season_name, 
          s.year as season_year,
          s.start_date as season_start_date,
          s.end_date as season_end_date
        FROM teams t
        LEFT JOIN seasons s ON t.season_id = s.id
        WHERE t.club_id = ${clubId} AND t.is_active = true
        ORDER BY s.start_date DESC, t.name
      `);

      const teams = clubTeams.rows.map(row => ({
        id: row.id,
        name: row.name,
        division: row.division,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        seasonId: row.season_id,
        seasonName: row.season_name,
        seasonYear: row.season_year,
        seasonStartDate: row.season_start_date,
        seasonEndDate: row.season_end_date
      }));

      console.log(`Found ${teams.length} teams for club ${clubId}`);
      res.json(teams);
    } catch (error) {
      console.error("Error fetching teams:", error);
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });

  // Get all teams for a club (keep the original endpoint for compatibility)
  app.get("/api/clubs/:clubId/teams", requireClubAccess(), async (req: AuthenticatedRequest, res) => {
    try {
      const clubId = parseInt(req.params.clubId);
      console.log(`Teams endpoint called for club ${clubId}`);
      console.log(`User context:`, req.user?.clubs?.map(c => c.clubId));

      if (isNaN(clubId) || clubId <= 0) {
        console.log('Invalid club ID provided:', req.params.clubId);
        return res.status(400).json({ error: "Club ID required" });
      }

      console.log(`Fetching teams for club ${clubId}`);

      const clubTeams = await db.execute(sql`
        SELECT 
          t.id,
          t.name,
          t.division,
          t.is_active,
          t.created_at,
          t.updated_at,
          s.id as season_id,
          s.name as season_name, 
          s.year as season_year,
          s.start_date as season_start_date,
          s.end_date as season_end_date
        FROM teams t
        LEFT JOIN seasons s ON t.season_id = s.id
        WHERE t.club_id = ${clubId} AND t.is_active = true
        ORDER BY s.start_date DESC, t.name
      `);

      const teams = clubTeams.rows.map(row => ({
        id: row.id,
        name: row.name,
        division: row.division,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        seasonId: row.season_id,
        seasonName: row.season_name,
        seasonYear: row.season_year,
        seasonStartDate: row.season_start_date,
        seasonEndDate: row.season_end_date
      }));

      console.log(`Found ${teams.length} teams for club ${clubId}`);
      res.json(teams);
    } catch (error) {
      console.error("Error fetching teams:", error);
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });

  // Create a new team
  app.post("/api/teams", async (req, res) => {
    try {
      console.log('Team creation request body:', req.body);
      const { clubId, seasonId, name, division, isActive } = req.body;

      if (!clubId || !seasonId || !name) {
        console.log('Validation failed:', { clubId, seasonId, name });
        return res.status(400).json({ message: "Club ID, season ID, and name are required" });
      }

      const result = await db.execute(sql`
        INSERT INTO teams (club_id, season_id, name, division, is_active)
        VALUES (${clubId}, ${seasonId}, ${name}, ${division || 'Division 1'}, ${isActive !== false})
        RETURNING *
      `);

      res.status(201).json(result.rows[0]);
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
      const { name, division, isActive } = req.body;

      // Build update object only with provided fields
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (division !== undefined) updateData.division = division;
      if (isActive !== undefined) updateData.isActive = isActive;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }

      // Always update the timestamp
      updateData.updatedAt = new Date();

      // Use proper Drizzle ORM update method
      const result = await db.update(teams)
        .set(updateData)
        .where(eq(teams.id, teamId))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ message: "Team not found" });
      }

      res.json(result[0]);
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
        console.log(`Team ${teamId} has ${gameCount} games - updating game references before deletion`);

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

        console.log(`Updated ${gameCount} games to remove references to team ${teamId}`);
      }

      // Delete the team
      const result = await db.execute(sql`
        DELETE FROM teams WHERE id = ${teamId} RETURNING id
      `);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Team not found" });
      }

      // Return success with information about games that were updated
      res.json({ 
        success: true, 
        message: gameCount > 0 
          ? `Team deleted successfully. ${gameCount} games updated to remove team references.`
          : "Team deleted successfully.",
        gamesUpdated: gameCount
      });
    } catch (error) {
      console.error("Error deleting team:", error);
      res.status(500).json({ message: "Failed to delete team" });
    }
  });

  // Get all teams across all clubs (for away team selection)
  app.get("/api/teams/all", async (req, res) => {
    try {
      const teams = await db.execute(sql`
        SELECT 
          t.id,
          t.name,
          t.division,
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
          s.end_date as season_end_date
        FROM teams t
        LEFT JOIN clubs c ON t.club_id = c.id
        LEFT JOIN seasons s ON t.season_id = s.id
        WHERE t.is_active = true AND c.is_active = true
        ORDER BY c.name, t.name
      `);

      const mappedTeams = teams.rows.map(row => ({
        id: row.id,
        name: row.name,
        division: row.division,
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
        seasonEndDate: row.season_end_date
      }));

      res.json(mappedTeams);
    } catch (error) {
      console.error("Error fetching all teams:", error);
      res.status(500).json({ message: "Failed to fetch all teams" });
    }
  });

  // Get clubs
  app.get("/api/clubs", async (req, res) => {
    try {
      const clubs = await db.execute(sql`
        SELECT * FROM clubs WHERE is_active = true ORDER BY name
      `);

      res.json(clubs.rows);
    } catch (error) {
      console.error("Error fetching clubs:", error);
      res.status(500).json({ message: "Failed to fetch clubs" });
    }
  });

  // Get team by ID
  app.get('/api/teams/:id', requireClubAccess(), async (req: AuthenticatedRequest, res) => {
    try {
      const teamId = parseInt(req.params.id);
      const userClubs = req.user?.clubs?.map(c => c.clubId) || [];

      // Get team details and check if user has access to the team's club
      const team = await db.execute(sql`
        SELECT * FROM teams WHERE id = ${teamId}
      `);

      if (team.rows.length === 0) {
        return res.status(404).json({ error: 'Team not found' });
      }

      const teamData = team.rows[0];

      // Check if user has access to this team's club
      if (!userClubs.includes(teamData.club_id)) {
        return res.status(403).json({ error: 'Access denied to this team' });
      }

      res.json(teamData);
    } catch (error) {
      console.error("Error fetching team:", error);
      res.status(500).json({ message: "Failed to fetch team" });
    }
  });


  // Add player to team
  app.post("/api/teams/:teamId/players", async (req, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      const { playerId, isRegular } = req.body;

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
          eq(teamPlayers.teamId, teamId),
          eq(teamPlayers.playerId, playerId)
        ))
        .limit(1);

      if (existingAssignment.length > 0) {
        return res.status(400).json({ message: "Player is already on this team" });
      }

      const result = await db.insert(teamPlayers)
        .values({
          teamId,
          playerId,
          isRegular: isRegular || true
        })
        .returning();

      console.log(`Auto-assigned player ${playerId} to season ${seasonId} when adding to team ${teamId}`);
      res.status(201).json(result[0]);
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
        return res.status(404).json({ message: "Player not found on this team" });
      }

      res.status(204).end();
    } catch (error) {
      console.error("Error removing player from team:", error);
      res.status(500).json({ message: "Failed to remove player from team" });
    }
  });

  // Update team player settings
  app.patch("/api/teams/:teamId/players/:playerId", async (req, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      const playerId = parseInt(req.params.playerId);
      const { isRegular, positionPreferences } = req.body;

      const updates = [];
      const values = [];
      let paramCount = 1;

      if (isRegular !== undefined) {
        updates.push(`is_regular = $${paramCount++}`);
        values.push(isRegular);
      }
      if (positionPreferences !== undefined) {
        updates.push(`position_preferences = $${paramCount++}`);
        values.push(JSON.stringify(positionPreferences));
      }

      if (updates.length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }

      values.push(teamId, playerId);

      const result = await db.execute(sql.raw(`
        UPDATE team_players 
        SET ${updates.join(', ')}
        WHERE team_id = $${paramCount++} AND player_id = $${paramCount}
        RETURNING *
      `, values));

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Team player not found" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error updating team player:", error);
      res.status(500).json({ message: "Failed to update team player" });
    }
  });

  // Get players for a specific team
  app.get("/api/teams/:teamId/players", requireClubAccess(), async (req: AuthenticatedRequest, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      const seasonId = await db.execute(sql`SELECT season_id FROM teams WHERE id = ${teamId}`);
      const parsedSeasonId = seasonId.rows[0]?.season_id;
      const userClubs = req.user?.clubs?.map(c => c.clubId) || [];

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

      // Return just the team players array (not wrapped in an object)
      res.json(players);
    } catch (error) {
      console.error("Error fetching team players:", error);
      res.status(500).json({ message: "Failed to fetch team players" });
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

      res.json(stats.rows[0] || {});
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

      res.json(mappedRoster);
    } catch (error) {
      console.error('Error fetching team roster:', error);
      res.status(500).json({ error: 'Failed to fetch team roster' });
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

      res.json(mappedAvailability);
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

      console.log(`Available players query for team ${teamId}, season ${seasonId}, club ${teamClubId}`);

      // First, let's check what players exist in the club
      const clubPlayers = await db.execute(sql`
        SELECT p.id, p.display_name, cp.is_active as club_active
        FROM players p
        JOIN club_players cp ON p.id = cp.player_id
        WHERE cp.club_id = ${teamClubId}
        ORDER BY p.display_name
      `);
      console.log(`Club ${teamClubId} has ${clubPlayers.rows.length} players:`, clubPlayers.rows.map(r => `${r.display_name} (active: ${r.club_active})`));

      // Check player seasons
      const playerSeasons = await db.execute(sql`
        SELECT ps.player_id, ps.season_id, p.display_name
        FROM player_seasons ps
        JOIN players p ON ps.player_id = p.id
        JOIN club_players cp ON p.id = cp.player_id
        WHERE cp.club_id = ${teamClubId} AND ps.season_id = ${seasonId}
        ORDER BY p.display_name
      `);
      console.log(`Players in season ${seasonId}:`, playerSeasons.rows.map(r => `${r.display_name} (player_id: ${r.player_id})`));

      // Check team assignments
      const teamAssignments = await db.execute(sql`
        SELECT tp.player_id, tp.team_id, p.display_name, t.name as team_name
        FROM team_players tp
        JOIN players p ON tp.player_id = p.id
        JOIN teams t ON tp.team_id = t.id
        WHERE t.season_id = ${seasonId}
        ORDER BY p.display_name
      `);
      console.log(`Team assignments for season ${seasonId}:`, teamAssignments.rows.map(r => `${r.display_name} -> ${r.team_name} (team_id: ${r.team_id})`));

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

      console.log(`Available players query returned ${availablePlayers.rows.length} players:`, availablePlayers.rows.map(r => r.display_name));

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

      console.log(`Returning ${mappedAvailablePlayers.length} available players`);
      res.json(mappedAvailablePlayers);
    } catch (error) {
      console.error("Error fetching available players:", error);
      res.status(500).json({ message: "Failed to fetch available players" });
    }
  });
}