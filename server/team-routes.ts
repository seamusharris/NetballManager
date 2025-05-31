import type { Express } from "express";
import { db } from "./db";
import { sql } from "drizzle-orm";
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
        season: row.season_id ? {
          id: row.season_id,
          name: row.season_name,
          year: row.season_year,
          startDate: row.season_start_date,
          endDate: row.season_end_date
        } : null
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
        season: row.season_id ? {
          id: row.season_id,
          name: row.season_name,
          year: row.season_year,
          startDate: row.season_start_date,
          endDate: row.season_end_date
        } : null
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

  // Update team
  app.patch("/api/teams/:id", async (req, res) => {
    try {
      const teamId = parseInt(req.params.id);
      const { name, division, isActive } = req.body;

      const updates = [];
      const values = [];
      let paramCount = 1;

      if (name !== undefined) {
        updates.push(`name = $${paramCount++}`);
        values.push(name);
      }
      if (division !== undefined) {
        updates.push(`division = $${paramCount++}`);
        values.push(division);
      }
      if (isActive !== undefined) {
        updates.push(`is_active = $${paramCount++}`);
        values.push(isActive);
      }

      if (updates.length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }

      values.push(teamId);

      const result = await db.execute(sql.raw(`
        UPDATE teams 
        SET ${updates.join(', ')}, updated_at = NOW()
        WHERE id = $${paramCount}
        RETURNING *
      `, values));

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Team not found" });
      }

      res.json(result.rows[0]);
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

      if (games.rows[0]?.count > 0) {
        return res.status(400).json({ 
          message: "Cannot delete team with existing games. Set as inactive instead." 
        });
      }

      const result = await db.execute(sql`
        DELETE FROM teams WHERE id = ${teamId} RETURNING id
      `);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Team not found" });
      }

      res.status(204).end();
    } catch (error) {
      console.error("Error deleting team:", error);
      res.status(500).json({ message: "Failed to delete team" });
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

  // Get team players (for multi-club support)
  app.get("/api/teams/:teamId/players", async (req, res) => {
    try {
      const teamId = parseInt(req.params.teamId);

      const teamPlayersList = await db.execute(sql`
        SELECT 
          tp.id,
          p.id as player_id,
          p.display_name,
          p.first_name,
          p.last_name,
          p.position_preferences,
          p.avatar_color,
          tp.is_regular,
          tp.jersey_number,
          tp.position_preferences as team_position_preferences
        FROM team_players tp
        INNER JOIN players p ON tp.player_id = p.id
        WHERE tp.team_id = ${teamId}
        ORDER BY p.display_name
      `);

      res.json(teamPlayersList.rows);
    } catch (error) {
      console.error("Error fetching team players:", error);
      res.status(500).json({ message: "Failed to fetch team players" });
    }
  });

  // Add player to team
  app.post("/api/teams/:teamId/players", async (req, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      const { playerId, isRegular, jerseyNumber, positionPreferences } = req.body;

      const result = await db.execute(sql`
        INSERT INTO team_players (team_id, player_id, is_regular, jersey_number, position_preferences)
        VALUES (${teamId}, ${playerId}, ${isRegular || true}, ${jerseyNumber}, ${JSON.stringify(positionPreferences)})
        RETURNING *
      `);

      res.status(201).json(result.rows[0]);
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
  app.get('/api/teams/:teamId/players', requireClubAccess(), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const teamId = parseInt(req.params.teamId);
      
      const result = await db.execute(sql`
        SELECT 
          p.*,
          tp.is_regular,
          tp.position_preferences
        FROM players p
        JOIN team_players tp ON p.id = tp.player_id
        WHERE tp.team_id = ${teamId}
        ORDER BY p.display_name, p.first_name, p.last_name
      `);

      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching team players:", error);
      res.status(500).json({ message: "Failed to fetch team players" });
    }
  });
}