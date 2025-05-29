
import type { Express } from "express";
import { db } from "./db";
import { teams, teamPlayers, players, seasons } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import { insertTeamSchema, insertTeamPlayerSchema } from "@shared/schema";

export function registerTeamRoutes(app: Express) {
  // Get all teams for a club
  app.get("/api/clubs/:clubId/teams", async (req, res) => {
    try {
      const clubId = parseInt(req.params.clubId);
      
      const clubTeams = await db.select({
        id: teams.id,
        name: teams.name,
        division: teams.division,
        isActive: teams.isActive,
        seasonId: teams.seasonId,
        seasonName: seasons.name,
        seasonYear: seasons.year
      })
      .from(teams)
      .leftJoin(seasons, eq(teams.seasonId, seasons.id))
      .where(eq(teams.clubId, clubId))
      .orderBy(seasons.startDate, teams.name);

      res.json(clubTeams);
    } catch (error) {
      console.error("Error fetching teams:", error);
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });

  // Get teams for a specific season
  app.get("/api/seasons/:seasonId/teams", async (req, res) => {
    try {
      const seasonId = parseInt(req.params.seasonId);
      
      const seasonTeams = await db.select()
        .from(teams)
        .where(eq(teams.seasonId, seasonId))
        .orderBy(teams.name);

      res.json(seasonTeams);
    } catch (error) {
      console.error("Error fetching season teams:", error);
      res.status(500).json({ message: "Failed to fetch season teams" });
    }
  });

  // Create a new team
  app.post("/api/teams", async (req, res) => {
    try {
      const teamData = insertTeamSchema.parse(req.body);
      
      const [newTeam] = await db.insert(teams)
        .values(teamData)
        .returning();

      res.status(201).json(newTeam);
    } catch (error) {
      console.error("Error creating team:", error);
      res.status(500).json({ message: "Failed to create team" });
    }
  });

  // Update a team
  app.patch("/api/teams/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const [updatedTeam] = await db.update(teams)
        .set(req.body)
        .where(eq(teams.id, id))
        .returning();

      if (!updatedTeam) {
        return res.status(404).json({ message: "Team not found" });
      }

      res.json(updatedTeam);
    } catch (error) {
      console.error("Error updating team:", error);
      res.status(500).json({ message: "Failed to update team" });
    }
  });

  // Delete a team
  app.delete("/api/teams/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if team has any games
      const teamGames = await db.execute(sql`
        SELECT COUNT(*) as count FROM games 
        WHERE home_team_id = ${id} OR away_team_id = ${id}
      `);

      if (teamGames.rows[0].count > 0) {
        return res.status(400).json({ 
          message: "Cannot delete team with existing games" 
        });
      }

      await db.delete(teams).where(eq(teams.id, id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting team:", error);
      res.status(500).json({ message: "Failed to delete team" });
    }
  });

  // Get players for a team
  app.get("/api/teams/:teamId/players", async (req, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      
      const teamPlayersList = await db.select({
        id: teamPlayers.id,
        playerId: players.id,
        displayName: players.displayName,
        firstName: players.firstName,
        lastName: players.lastName,
        positionPreferences: players.positionPreferences,
        avatarColor: players.avatarColor,
        isRegular: teamPlayers.isRegular,
        jerseyNumber: teamPlayers.jerseyNumber,
        teamPositionPreferences: teamPlayers.positionPreferences
      })
      .from(teamPlayers)
      .innerJoin(players, eq(teamPlayers.playerId, players.id))
      .where(eq(teamPlayers.teamId, teamId))
      .orderBy(players.displayName);

      res.json(teamPlayersList);
    } catch (error) {
      console.error("Error fetching team players:", error);
      res.status(500).json({ message: "Failed to fetch team players" });
    }
  });

  // Add player to team
  app.post("/api/teams/:teamId/players", async (req, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      const playerData = insertTeamPlayerSchema.parse({
        ...req.body,
        teamId
      });
      
      const [newTeamPlayer] = await db.insert(teamPlayers)
        .values(playerData)
        .returning();

      res.status(201).json(newTeamPlayer);
    } catch (error) {
      console.error("Error adding player to team:", error);
      res.status(500).json({ message: "Failed to add player to team" });
    }
  });

  // Remove player from team
  app.delete("/api/teams/:teamId/players/:playerId", async (req, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      const playerId = parseInt(req.params.playerId);
      
      await db.delete(teamPlayers)
        .where(and(
          eq(teamPlayers.teamId, teamId),
          eq(teamPlayers.playerId, playerId)
        ));

      res.status(204).send();
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
      
      const [updatedTeamPlayer] = await db.update(teamPlayers)
        .set(req.body)
        .where(and(
          eq(teamPlayers.teamId, teamId),
          eq(teamPlayers.playerId, playerId)
        ))
        .returning();

      if (!updatedTeamPlayer) {
        return res.status(404).json({ message: "Team player not found" });
      }

      res.json(updatedTeamPlayer);
    } catch (error) {
      console.error("Error updating team player:", error);
      res.status(500).json({ message: "Failed to update team player" });
    }
  });
}
import type { Express } from "express";
import { db } from "./db";
import { sql } from "drizzle-orm";

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

  // Create a new team
  app.post("/api/teams", async (req, res) => {
    try {
      const { clubId, seasonId, name, division } = req.body;
      
      if (!clubId || !seasonId || !name) {
        return res.status(400).json({ message: "Club ID, season ID, and name are required" });
      }
      
      const result = await db.execute(sql`
        INSERT INTO teams (club_id, season_id, name, division)
        VALUES (${clubId}, ${seasonId}, ${name}, ${division || 'Division 1'})
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
}
