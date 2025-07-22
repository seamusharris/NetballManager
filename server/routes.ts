import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { sql, inArray, eq, and } from "drizzle-orm";
import { db, pool } from "./db";
import { 
  insertPlayerSchema, importPlayerSchema,
  insertGameSchema, importGameSchema,
  insertRosterSchema, importRosterSchema,
  insertGameStatSchema, importGameStatSchema,
  insertSeasonSchema,
  players, games, rosters, gameStats, seasons,
  POSITIONS,
  gameScores
} from "@shared/schema";

import { updatePlayerSeasonRelationships, getPlayerSeasons } from "./player-season-routes";
import gameStatusRoutes from "./game-status-routes";
import { registerTeamRoutes } from './team-routes';
import { validateSchema } from './validation-middleware';
import { registerUserManagementRoutes } from "./user-management-routes";
import { registerPlayerBorrowingRoutes } from "./player-borrowing-routes";
import { registerGamePermissionsRoutes } from "./game-permissions-routes";
import { 
  AuthenticatedRequest, 
  requireClubAccess, 
  requireTeamAccess, 
  requireGameAccess,
  requireTeamGameAccess,
  loadUserPermissions,
  requireAuth,
  standardAuth
} from "./auth-middleware";
import { transformToApiFormat, createSuccessResponse, createErrorResponse, createArrayResponse } from './api-utils';
import camelcaseKeys from 'camelcase-keys';
import { getBatchGameScores } from './game-scores-utils';
import { registerClubRoutes } from './club-routes';
import { registerPlayerRoutes } from './player-routes';
import { registerGameRoutes } from './game-routes';
import { registerSeasonRoutes } from './season-routes';

// Database health check function
async function checkPoolHealth(): Promise<boolean> {
  try {
    await db.execute(sql`SELECT 1`);
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware to simulate authentication and set club context from request
  // [REMOVE] app.use('/api', async (req, res, next) => { ... })

  // put application routes here
  // prefix all routes with /api





  // ----- DIAGNOSTIC APIs -----

  // Debug stats relationships
  app.get('/api/debug/stats-relationships', async (req, res) => {
    try {
      const { debugStatsRelationships } = await import('./debug-stats-relationships');
      await debugStatsRelationships();
      res.json({ message: "Debug output sent to console" });
    } catch (error) {
      console.error("Error in stats relationships debug:", error);
      res.status(500).json({
        success: false,
        message: "Debug failed",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Direct player update endpoint
  app.patch('/api/direct/players/:id', async (req, res) => {
    try {
      const { directUpdatePlayer } = await import('./direct-player-update');
      await directUpdatePlayer(req, res);
    } catch (error) {
      console.error("Error in direct player update:", error);
      res.status(500).json({
        success: false,
        message: "Direct update failed",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Diagnostic endpoint for player-season relationship debugging
  app.get('/api/diagnostic/player-seasons', async (req, res) => {
    try {
      const { diagnosePlayerSeasons } = await import('./diagnose-player-seasons');
      await diagnosePlayerSeasons(req, res);
    } catch (error) {
      console.error("Error in player-seasons diagnostic endpoint:", error);
      res.status(500).json({
        success: false,
        message: "Diagnostic failed",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // ----- DATA MANAGEMENT APIs -----

  // Populate club-player relationships
  app.post("/api/populate-club-players", async (req, res) => {
    try {
      const { populateClubPlayerRelationships } = await import('./db');
      const success = await populateClubPlayerRelationships();

      if (success) {
        res.json({ message: "Club-player relationships populated successfully" });
      } else {
        res.status(500).json({ message: "Failed to populate club-player relationships" });
      }
    } catch (error) {
      console.error('Error in populate-club-players endpoint:', error);
      res.status(500).json({ message: "Failed to populate club-player relationships" });
    }
  });

  // Clear all data for fresh import
  app.post("/api/clear-data", async (req, res) => {
    try {
      // Delete all data in reverse order of dependencies
      await db.execute(sql`DELETE FROM game_stats`);
      await db.execute(sql`DELETE FROM rosters`);
      await db.execute(sql`DELETE FROM games`);
      await db.execute(sql`DELETE FROM players`);

      // Reset all sequences
      await db.execute(sql`ALTER SEQUENCE game_stats_id_seq RESTART WITH 1`);
      await db.execute(sql`ALTER SEQUENCE rosters_id_seq RESTART WITH 1`);
      await db.execute(sql`ALTER SEQUENCE games_id_seq RESTART WITH 1`);
      await db.execute(sql`ALTER SEQUENCE players_id_seq RESTART WITH 1`);

      res.status(200).json({ message: "All data cleared successfully" });
    } catch (error) {
      console.error('Failed to clear data:', error);
      res.status(500).json({ message: "Failed to clear data" });
    }
  });





  // Bulk import - imports all data in a single transaction
  app.post("/api/bulk-import", async (req, res) => {
    try {
      // Always convert to object format consistently
      let data;
      if (typeof req.body === 'string') {
        try {
          data = JSON.parse(req.body);
        } catch (e) {
          console.error("Failed to parse JSON string:", e);
          return res.status(400).json({ message: "Invalid JSON format" });
        }
      } else {
        data = req.body;
      }

      // Validate the data structure
      const hasPlayers = Array.isArray(data.players);
      const hasOpponents = Array.isArray(data.opponents);
      const hasGames = Array.isArray(data.games);
      const hasRosters = Array.isArray(data.rosters);
      const hasGameStats = Array.isArray(data.gameStats);

      // Require players section at minimum
      if (!hasPlayers) {
        return res.status(400).json({ message: "Invalid data format - missing player data" });
      }

      // Import counts
      let playersImported = 0;
      let opponentsImported = 0;
      let gamesImported = 0;
      let rostersImported = 0;
      let statsImported = 0;

      let clubsImported = 0;
      let seasonsImported = 0;
      let gameStatusesImported = 0;
      let teamsImported = 0;

      // DIRECT INSERT CLUBS (highest priority)
      for (const club of (data.clubs || [])) {
        try {
          await db.execute(sql`
            INSERT INTO clubs (
              id, name, code, description, address, contact_email, contact_phone,
              primary_color, secondary_color, is_active
            ) VALUES (
              ${club.id}, 
              ${club.name || "Unknown Club"}, 
              ${club.code || "UNK"}, 
              ${club.description || null}, 
              ${club.address || null}, 
              ${club.contactEmail || null}, 
              ${club.contactPhone || null}, 
              ${club.primaryColor || "#1f2937"}, 
              ${club.secondaryColor || "#ffffff"}, 
              ${club.isActive !== false}
            )
          `);
          clubsImported++;
        } catch (error) {
          console.error(`Failed to import club ${club.id}:`, error);
        }
      }

      // DIRECT INSERT SEASONS
      for (const season of (data.seasons || [])) {
        try {
          await db.execute(sql`
            INSERT INTO seasons (
              id, name, start_date, end_date, is_active, type, year, display_order
            ) VALUES (
              ${season.id}, 
              ${season.name || "Unknown Season"}, 
              ${season.startDate || null}, 
              ${season.endDate || null}, 
              ${season.isActive !== false}, 
              ${season.type || null}, 
              ${season.year || new Date().getFullYear()}, 
              ${season.displayOrder || 0}
            )
          `);
          seasonsImported++;
        } catch (error) {
          console.error(`Failed to import season ${season.id}:`, error);
        }
      }

      // DIRECT INSERT GAME STATUSES
      for (const status of (data.gameStatuses || [])) {
        try {
          await db.execute(sql`
            INSERT INTO game_statuses (
              id, name, display_name, points, opponent_points, home_team_goals, away_team_goals,
              is_completed, allows_statistics, requires_opponent, color_class, sort_order, is_active
            ) VALUES (
              ${status.id}, 
              ${status.name || "unknown"}, 
              ${status.displayName || "Unknown"}, 
              ${status.points || 0}, 
              ${status.opponentPoints || 0}, 
              ${status.homeTeamGoals || null}, 
              ${status.awayTeamGoals || null}, 
              ${status.isCompleted !== false}, 
              ${status.allowsStatistics !== false}, 
              ${status.requires_opponent !== false}, 
              ${status.colorClass || null}, 
              ${status.sortOrder || 0}, 
              ${status.isActive !== false}
            )
          `);
          gameStatusesImported++;
        } catch (error) {
          console.error(`Failed to import game status ${status.id}:`, error);
        }
      }

      // DIRECT INSERT TEAMS
      for (const team of (data.teams || [])) {
        try {
          await db.execute(sql`
            INSERT INTO teams (
              id, club_id, season_id, name, division_id, is_active
            ) VALUES (
              ${team.id}, 
              ${team.clubId}, 
              ${team.seasonId}, 
              ${team.name || "Unknown Team"}, 
              ${team.divisionId || null}, 
              ${team.isActive !== false}
            )
          `);
          teamsImported++;
        } catch (error) {
          console.error(`Failed to import team ${team.id}:`, error);
        }
      }

      // DIRECT INSERT PLAYERS
      // This uses raw SQL to ensure IDs are preserved exactly
      for (const player of data.players) {
        try {
          await db.execute(sql`
            INSERT INTO players (
              id, display_name, first_name, last_name, 
              date_of_birth, position_preferences, active, avatar_color
            ) VALUES (
              ${player.id}, 
              ${player.displayName || ""}, 
              ${player.firstName || ""}, 
              ${player.lastName || ""}, 
              ${player.dateOfBirth || null}, 
              ${JSON.stringify(player.positionPreferences || [])}, 
              ${player.active !== false}, 
              ${player.avatarColor || null}
            )
          `);
          playersImported++;
        } catch (error) {
          console.error(`Failed to import player ${player.id}:`, error);
        }
      }

      // Opponents system has been removed - skip opponents import

      // DIRECT INSERT GAMES
      for (const game of data.games) {
        try {
          await db.execute(sql`
            INSERT INTO games (
              id, date, time, opponent_id, completed, is_bye, round
            ) VALUES (
              ${game.id}, 
              ${game.date || null}, 
              ${game.time || null}, 
              ${game.opponentId || null}, 
              ${game.completed === true}, 
              ${game.isBye === true}, 
              ${game.round || null}
            )
          `);
          gamesImported++;
        } catch (error) {
          console.error(`Failed to import game ${game.id}:`, error);
        }
      }

      // DIRECT INSERT ROSTERS - with improved validation
      const rostersData = Array.isArray(data.rosters) ? data.rosters : [];

      // Extract valid game and player IDs for reference
      const validGameIds: number[] = [];
      for (const game of games) {
        if (game && typeof game.id === 'number') {
          validGameIds.push(game.id);
        }
      }

      const validPlayerIds: number[] = [];
      for (const player of players) {
        if (player && typeof player.id === 'number') {
          validPlayerIds.push(player.id);
        }
      }

      for (const roster of rostersData) {
        try {
          // Skip invalid relationships
          if (!validGameIds.includes(roster.gameId)) {
            console.warn(`Skipping roster ${roster.id}: game ID ${roster.gameId} not found`);
            continue;
          }

          if (!validPlayerIds.includes(roster.playerId)) {
            console.warn(`Skipping roster ${roster.id}: player ID ${roster.playerId} not found`);
            continue;
          }

          // Clean and normalize data
          const position = POSITIONS.includes(roster.position) ? roster.position : "GS";
          const quarter = roster.quarter >= 1 && roster.quarter <= 4 ? roster.quarter : 1;

          await db.execute(sql`
            INSERT INTO rosters (
              id, game_id, quarter, position, player_id
            ) VALUES (
              ${roster.id}, 
              ${roster.game_id}, 
              ${quarter}, 
              ${position}, 
              ${roster.player_id}
            )
          `);
          rostersImported++;
        } catch (error) {
          console.error(`Failed to import roster ${roster.id}:`, error);
        }
      }

      // DIRECT INSERT GAME STATS - with improved validation
      const statsData = Array.isArray(data.gameStats) ? data.gameStats : [];

      // Get valid game and player IDs for reference (reusing from rosters)
      for (const stat of statsData) {
        try {
          // Skip invalid relationships
          if (!validGameIds.includes(stat.gameId)) {
            console.warn(`Skipping stat ${stat.id}: game ID ${stat.gameId} not found`);
            continue;
          }

          if (!validPlayerIds.includes(stat.playerId)) {
            console.warn(`Skipping stat ${stat.id}: player ID ${stat.playerId} not found`);
            continue;
          }

          // Clean and normalize all fields
          const cleanStat = {
            id: stat.id,
            game_id: stat.game_id,
            player_id: stat.player_id,
            quarter: stat.quarter >= 1 && stat.quarter <= 4 ? stat.quarter : 1,
            goals_for: Math.max(0, parseInt(stat.goals_for || 0)),
            goals_against: Math.max(0, parseInt(stat.goals_against || 0)),
            missed_goals: Math.max(0, parseInt(stat.missed_goals || 0)),
            rebounds: Math.max(0, parseInt(stat.rebounds || 0)),
            intercepts: Math.max(0, parseInt(stat.intercepts || 0)),
            bad_pass: Math.max(0, parseInt(stat.bad_pass || 0)),
            handling_error: Math.max(0, parseInt(stat.handling_error || 0)),
            pick_up: Math.max(0, parseInt(stat.pick_up || 0)),
            infringement: Math.max(0, parseInt(stat.infringement || 0)),
            rating: Math.min(10, Math.max(1, parseInt(stat.rating || 5)))
          };

          await db.execute(sql`
            INSERT INTO game_stats (
              id, game_id, player_id, quarter, goals_for, goals_against, 
              missed_goals, rebounds, intercepts, bad_pass, handling_error, 
              pick_up, infringement, rating
            ) VALUES (
              ${cleanStat.id}, 
              ${cleanStat.game_id}, 
              ${cleanStat.player_id}, 
              ${cleanStat.quarter}, 
              ${cleanStat.goals_for}, 
              ${cleanStat.goals_against}, 
              ${cleanStat.missed_goals}, 
              ${cleanStat.rebounds}, 
              ${cleanStat.intercepts}, 
              ${cleanStat.bad_pass}, 
              ${cleanStat.handling_error}, 
              ${cleanStat.pick_up}, 
              ${cleanStat.infringement}, 
              ${cleanStat.rating}
            )
          `);
          statsImported++;
        } catch (error) {
          console.error(`Failed to import game stat ${stat.id}:`, error);
        }
      }

      // Update sequences to prevent conflicts with future inserts
      await db.execute(sql`SELECT setval('players_id_seq', (SELECT COALESCE(MAX(id), 0) FROM players), true)`);
      await db.execute(sql`SELECT setval('opponents_id_seq', (SELECT COALESCE(MAX(id), 0) FROM opponents), true)`);
      await db.execute(sql`SELECT setval('games_id_seq', (SELECT COALESCE(MAX(id), 0) FROM games), true)`);
      await db.execute(sql`SELECT setval('rosters_id_seq', (SELECT COALESCE(MAX(id), 0) FROM rosters), true)`);
      await db.execute(sql`SELECT setval('game_stats_id_seq', (SELECT COALESCE(MAX(id), 0) FROM game_stats), true)`);

      // Return the import results
      res.status(200).json({
        clubsImported,
        seasonsImported,
        gameStatusesImported,
        teamsImported,
        playersImported,
        opponentsImported,
        gamesImported,
        rostersImported,
        statsImported,
        message: "Data imported successfully"
      });
    } catch (error) {
      console.error('Bulk import failed:', error);
      res.status(500).json({ message: "Failed to import data" });
    }
  });

  // ----- BACKUP API -----
  app.post("/api/backup", async (req, res) => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `backup-${timestamp}.json`;

      // Get all data from storage
      const players = await storage.getPlayers();
      const opponents = await storage.getOpponents();
      const games = await storage.getGames();

      // Get all rosters and game stats for each game
      const rosters = [];
      const gameStats = [];

      for (const game of games) {
        const gameRosters = await storage.getRostersByGame(game.id);
        const gameStatsData = await storage.getGameStatsByGame(game.id);

        rosters.push(...gameRosters);
        gameStats.push(...gameStatsData);
      }

      // Create the backup object
      const backupData = {
        players,
        opponents,
        games,
        rosters,
        gameStats
      };

      // Send the data as response
      res.json(backupData);
    } catch (error) {
      console.error('Backup creation failed:', error);
      res.status(500).json({ message: "Failed to create backup" });
    }
  });

  // ----- PLAYERS API -----
  // REST endpoint for club players (STANDARDIZED)
  // [PLAYER ENDPOINTS REMOVED] - now in server/player-routes.ts

  // Club CRUD routes - removed duplicate endpoint (enhanced version below includes statistics)

  // LEGACY: Singular endpoint (deprecated)
  app.post("/api/club", async (req, res) => {
    try {
      const { 
        name, 
        code, 
        description,
        address, 
        contactEmail,
        contactPhone, 
        primaryColor = '#1f2937', 
        secondaryColor = '#ffffff' 
      } = req.body;

      if (!name || !code) {
        return res.status(400).json({ message: "Name and code are required" });
      }

      // Check if club code already exists
      const codeCheck = await pool.query(
        'SELECT id FROM clubs WHERE UPPER(code) = UPPER($1)',
        [code]
      );

      if (codeCheck.rowCount > 0) {
        return res.status(409).json({ message: "Club code already exists" });
      }

      const result = await pool.query(`
        INSERT INTO clubs (name, code, description, address, contact_email, contact_phone, primary_color, secondary_color)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, name, code, description, address, contact_email, contact_phone, primary_color, secondary_color, is_active, created_at, updated_at
      `, [name, code.toUpperCase(), description, address, contactEmail, contactPhone, primaryColor, secondaryColor]);

      const club = result.rows[0];
      res.status(201).json(transformToApiFormat(club, '/api/clubs'));
    } catch (error) {
      console.error("Error creating club:", error);
      res.status(500).json({ message: "Failed to create club" });
    }
  });

  // STANDARD: Plural endpoint (preferred)
  app.post("/api/clubs", async (req, res) => {
    try {
      const { 
        name, 
        code, 
        description,
        address, 
        contactEmail,
        contactPhone, 
        primaryColor = '#1f2937', 
        secondaryColor = '#ffffff' 
      } = req.body;

      if (!name || !code) {
        return res.status(400).json({ message: "Name and code are required" });
      }

      // Check if club code already exists
      const codeCheck = await pool.query(
        'SELECT id FROM clubs WHERE UPPER(code) = UPPER($1)',
        [code]
      );

      if (codeCheck.rowCount > 0) {
        return res.status(409).json({ message: "Club code already exists" });
      }

      const result = await pool.query(`
        INSERT INTO clubs (name, code, description, address, contact_email, contact_phone, primary_color, secondary_color)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, name, code, description, address, contact_email, contact_phone, primary_color, secondary_color, is_active, created_at, updated_at
      `, [name, code.toUpperCase(), description, address, contactEmail, contactPhone, primaryColor, secondaryColor]);

      const club = result.rows[0];
      res.status(201).json(transformToApiFormat(club, '/api/clubs'));
    } catch (error) {
      console.error("Error creating club:", error);
      res.status(500).json({ message: "Failed to create club" });
    }
  });

  app.patch("/api/clubs/:id", async (req, res) => {
    try {
      const clubId = parseInt(req.params.id, 10);
      const { 
        name, 
        code, 
        description, 
        address, 
        contactEmail, 
        contactPhone, 
        primaryColor, 
        secondaryColor 
      } = req.body;

      if (isNaN(clubId)) {
        return res.status(400).json({ message: "Invalid club ID" });
      }

      if (!name || !code) {
        return res.status(400).json({ message: "Name and code are required" });
      }

      // Check if club exists
      const clubCheck = await pool.query('SELECT id FROM clubs WHERE id = $1', [clubId]);
      if (clubCheck.rowCount === 0) {
        return res.status(404).json({ message: "Club not found" });
      }

      // Check if code is taken by another club
      const codeCheck = await pool.query(
        'SELECT id FROM clubs WHERE UPPER(code) = UPPER($1) AND id != $2',
        [code, clubId]
      );

      if (codeCheck.rowCount > 0) {
        return res.status(400).json({ message: "Club code already exists" });
      }

      const result = await pool.query(`
        UPDATE clubs 
        SET name = $1, code = $2, description = $3, address = $4, 
            contact_email = $5, contact_phone = $6, primary_color = $7, secondary_color = $8
        WHERE id = $9
        RETURNING id, name, code, description, address, contact_email, contact_phone, primary_color, secondary_color
      `, [name, code.toUpperCase(), description, address, contactEmail, contactPhone, primaryColor, secondaryColor, clubId]);

      const club = result.rows[0];
      res.json(transformToApiFormat({
        id: club.id,
        name: club.name,
        code: club.code,
        description: club.description,
        address: club.address,
        contactEmail: club.contact_email,
        contactPhone: club.contact_phone,
        primaryColor: club.primary_color,
        secondaryColor: club.secondary_color
      }));
    } catch (error) {
      console.error("Error updating club:", error);
      res.status(500).json({ message: "Failed to update club" });
    }
  });

  app.delete("/api/clubs/:id", async (req, res) => {
    try {
      const clubId = parseInt(req.params.id, 10);

      if (isNaN(clubId)) {
        return res.status(400).json({ message: "Invalid club ID" });
      }

      // Check if club has any players
      const playersCheck = await pool.query(
        'SELECT COUNT(*) as count FROM club_players WHERE club_id = $1 AND is_active = true',
        [clubId]
      );

      if (parseInt(playersCheck.rows[0].count) > 0) {
        return res.status(400).json({ 
          message: "Cannot delete club with active players. Please remove all players first." 
        });
      }

      const result = await pool.query('DELETE FROM clubs WHERE id = $1', [clubId]);

      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Club not found" });
      }

      res.json({ success: true, message: "Club deleted successfully" });
    } catch (error) {
      console.error("Error deleting club:", error);
      res.status(500).json({ message: "Failed to delete club" });
    }
  });

  app.get("/api/players/:id", async (req, res) => {
    try {
      const player = await storage.getPlayer(Number(req.params.id));
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }
      res.json(player);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch player" });
    }
  });

  // Get seasons for a specific player
  app.get("/api/players/:id/seasons", async (req, res) => {
    try {
      // Import the player-season route handler function
      const { getPlayerSeasons } = await import('./player-season-routes');

            // Use our function to get player seasons
      getPlayerSeasons(req, res);
    } catch (error) {
      console.error(`Error fetching seasons for player ${req.params.id}:`, error);
      res.status(500).json({ 
        message: "Failed to fetch player seasons",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // DEPRECATED - Test endpoint for direct SQL player seasons
  app.get("/api/players/:id/seasons/debug", async (req, res) => {
    try {
      const playerId = Number(req.params.id);

      // Fetch the player's seasons from the junction table
      const result = await db.execute(sql`
        SELECT s.* FROM seasons s
        JOIN player_seasons ps ON ps.season_id = s.id
        WHERE ps.player_id = ${playerId}
        ORDER BY s.name
      `);

      console.log(`Found ${result.rows.length} seasons for player ${playerId}`);

      // Debugging output
      if (result.rows.length > 0) {
        console.log(`Season IDs for player ${playerId}: ${result.rows.map(s => s.id).join(', ')}`);
      }

      res.json(result.rows);
    } catch (error) {
      console.error(`Error fetching player seasons: ${error}`);
      res.status(500).json({ message: "Failed to fetch player seasons" });
    }
  });

  app.post("/api/players", async (req, res) => {
    try {
      console.log('🔍 Player endpoint - received body:', JSON.stringify(req.body, null, 2));
      
      // Extract club and team context
      const clubId = req.body.clubId || req.headers['x-current-club-id'];
      const teamId = req.body.teamId || req.headers['x-current-team-id'];

      // Validate club context is available
      if (!clubId) {
        return res.status(400).json({ 
          message: "Club context required", 
          debug: {
            headerClubId: req.headers['x-current-club-id'],
            bodyClubId: req.body.clubId
          }
        });
      }

      // Convert to number for consistency
      const numericClubId = typeof clubId === 'string' ? parseInt(clubId, 10) : clubId;
      const numericTeamId = teamId ? (typeof teamId === 'string' ? parseInt(teamId, 10) : teamId) : null;

      if (isNaN(numericClubId)) {
        return res.status(400).json({ message: "Invalid club ID format" });
      }

      // Check if we're doing an import operation (with ID) or regular create
      const hasId = req.body.id !== undefined;
      const schema = hasId ? importPlayerSchema : insertPlayerSchema;
      
      // Remove context fields for validation
      const { clubId: _, teamId: __, ...playerDataForValidation } = req.body;
      
      console.log('🔍 Data for validation:', JSON.stringify(playerDataForValidation, null, 2));

      const parsedData = schema.safeParse(playerDataForValidation);

      if (!parsedData.success) {
        console.log('🔍 Validation failed:', JSON.stringify(parsedData.error.errors, null, 2));
        return res.status(400).json({ 
          message: "Invalid player data", 
          errors: parsedData.error.errors 
        });
      }

      console.log('🔍 Validation successful!');

      // Create the player using storage layer
      const player = await storage.createPlayer(parsedData.data);
      console.log('Player created with ID:', player.id);

      // Auto-associate with club (simplified approach)
      if (player.id && numericClubId) {
        try {
          await storage.addPlayerToClub(player.id, numericClubId);
          console.log(`Auto-associated player ${player.id} with club ${numericClubId}`);
        } catch (clubError) {
          console.error(`Club association failed (non-critical):`, clubError);
          // Don't fail the player creation if club association fails
        }
      }

      console.log('=== PLAYER CREATION REQUEST COMPLETE ===\n');
      const responseData = transformToApiFormat(player, '/api/players');

      res.status(201).json(responseData);
    } catch (error) {
      console.error("=== PLAYER CREATION ERROR ===");
      console.error("Error details:", error);
      console.error("Error message:", error instanceof Error ? error.message : String(error));
      console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      console.error("=== END PLAYER CREATION ERROR ===\n");

      res.status(500).json({ 
        message: "Failed to create player",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.patch("/api/players/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);

      // Simplify - always use the direct format
      const updateData = {...req.body};

      // Season management is now handled separately on the player details page
      // We don't expect seasonIds in the request anymore
      let processedSeasonIds = [];

      // Remove season IDs from player update data if it exists
      delete updateData.seasonIds;

      // If avatar color is set to auto or empty, handle it properly
      if (updateData.avatarColor === 'auto' || updateData.avatarColor === '') {
        // Get the existing player first
        const existingPlayer = await storage.getPlayer(id);

        // If player already has a color, keep it
        if (existingPlayer && existingPlayer.avatarColor) {
          updateData.avatarColor = existingPlayer.avatarColor;
        } else {
          // Otherwise generate a unique color similar to the create route
          const existingPlayers = await storage.getPlayers();
          const usedColors = existingPlayers.map(p => p.avatarColor).filter(Boolean);

          const availableColors = [
            'bg-blue-600', 'bg-purple-600', 'bg-green-600', 'bg-red-600', 
            'bg-orange-600', 'bg-yellow-600', 'bg-pink-600', 'bg-teal-600',
            'bg-indigo-600', 'bg-cyan-600', 'bg-amber-600', 'bg-lime-600',
            'bg-emerald-600', 'bg-sky-600', 'bg-violet-600', 'bg-fuchsia-600',
            'bg-rose-600', 'bg-blue-700', 'bg-purple-700', 'bg-green-700',
            'bg-red-700', 'bg-orange-700', 'bg-yellow-700', 'bg-pink-700'
          ];

          const unusedColors = availableColors.filter(color => !usedColors.includes(color));

          if (unusedColors.length > 0) {
            updateData.avatarColor = unusedColors[Math.floor(Math.random() * unusedColors.length)];
          } else {
            updateData.avatarColor = availableColors[Math.floor(Math.random() * availableColors.length)];
          }
        }
      }

      // Create a sanitized version of the update data (only include valid fields)
      const validPlayerData = {
        displayName: updateData.display_name,
        firstName: updateData.first_name,
        lastName: updateData.last_name,
        dateOfBirth: updateData.date_of_birth,
        positionPreferences: updateData.position_preferences,
        active: updateData.active,
        avatarColor: updateData.avatar_color
      };

      // Update the player first
      const updatedPlayer = await storage.updatePlayer(id, validPlayerData);
      if (!updatedPlayer) {
        return res.status(404).json({ message: "Player not found" });
      }

      // Season management is now handled separately on the player details page
      // We don't need to update player-season relationships here anymore

      // Fetch the updated player with season info before returning
      try {
        // Get the player's seasons to include in the response
        const { getPlayerSeasons } = await import('./db');
        const playerSeasons = await getPlayerSeasons(id);

        // Create a more complete response that includes the seasons
        const enhancedResponse = {
          ...updatedPlayer,
          seasons: transformToApiFormat(playerSeasons || [])
        };

        // Return the enhanced player object with seasons
        return res.json(enhancedResponse);
      } catch (error) {
        console.error("Error getting player seasons for response:", error);
        // Still return the player data even if we couldn't get the seasons
        return res.json(updatedPlayer);
      }
    } catch (error) {
      console.error("Error updating player:", error);
      res.status(500).json({ 
        message: "Failed to update player", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  app.delete("/api/players/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.deletePlayer(id);
      if (!success) {
        return res.status(404).json({ message: "Player not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete player" });
    }
  });



  // ----- GAMES API -----

  // Unified games transformation function - ensures consistent camelCase response format
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

      // Game Status fields (consistent camelCase)
      statusName: row.status,
      statusDisplayName: row.status_display_name,
      statusIsCompleted: row.is_completed,
      statusAllowsStatistics: row.allows_statistics,
      statusTeamGoals: row.home_team_goals,
      statusOpponentGoals: row.away_team_goals,

      // Season fields (consistent camelCase)
      seasonName: row.season_name,
      seasonStartDate: row.season_start,
      seasonEndDate: row.season_end,
      seasonIsActive: row.season_active,

      // Home Team fields (consistent camelCase)
      homeTeamName: row.home_team_name,
      homeTeamDivision: row.home_team_division,
      homeClubId: row.home_club_id,
      homeClubName: row.home_club_name,
      homeClubCode: row.home_club_code,

      // Away Team fields (consistent camelCase, null for Bye games)
      awayTeamName: row.away_team_name,
      awayTeamDivision: row.away_team_division,
      awayClubId: row.away_club_id,
      awayClubName: row.away_club_name,
      awayClubCode: row.away_club_code,

      // Legacy fields for backward compatibility
      isBye: row.away_team_name === 'Bye'
    };
  }

 // [GAME ENDPOINTS REMOVED] - now in server/game-routes.ts 

  // [LEGACY ROSTER ENDPOINT REMOVED] - GET /api/games/:gameId/rosters

  // [LEGACY ROSTER ENDPOINT REMOVED] - DELETE /api/games/:gameId/rosters

  // Create fallback roster for a game
  app.post("/api/games/:gameId/create-fallback-roster", async (req, res) => {
    try {
      const gameId = Number(req.params.params.gameId);
      const { createFallbackRoster } = await import('./roster-fallback');

      await createFallbackRoster(gameId);

      res.json({ 
        success: true, 
        message: "Fallback roster created successfully" 
      });
    } catch (error) {
      console.error('Failed to create fallback roster:', error);
      res.status(500).json({ message: "Failed to create fallback roster" });
    }
  });

  // [LEGACY ROSTER ENDPOINT REMOVED] - POST /api/rosters

  // [LEGACY ROSTER ENDPOINTS REMOVED] - PATCH /api/rosters/:id, DELETE /api/rosters/:id

  // [LEGACY ROSTER ENDPOINT REMOVED] - POST /api/games/:gameId/rosters

  // ----- PLAYER AVAILABILITY API -----

  // Team-based availability endpoint (NEW - Stage 5)
  app.get("/api/teams/:teamId/games/:gameId/availability", requireTeamGameAccess(), async (req: AuthenticatedRequest, res) => {
    try {
      const gameId = Number(req.params.gameId);
      const teamId = Number(req.params.teamId);
      const { playerAvailabilityStorage } = await import('./player-availability-storage');
      const availablePlayerIds = await playerAvailabilityStorage.getPlayerAvailabilityForGame(gameId, teamId);
      res.json({ availablePlayerIds });
    } catch (error) {
      console.error('Error fetching team player availability:', error);
      res.status(500).json({ message: "Failed to fetch player availability" });
    }
  });

  // Get player availability for a specific game (LEGACY - will be deprecated)
  app.get("/api/games/:gameId/availability", standardAuth({ requireGameAccess: true }), async (req: AuthenticatedRequest, res) => {
    try {
      const gameId = Number(req.params.gameId);
      const teamId = req.headers['x-current-team-id'] ? Number(req.headers['x-current-team-id']) : undefined;

      const { playerAvailabilityStorage } = await import('./player-availability-storage');
      const availablePlayerIds = await playerAvailabilityStorage.getPlayerAvailabilityForGame(gameId, teamId);
      res.json({ availablePlayerIds });
    } catch (error) {
      console.error('Error fetching player availability:', error);
      res.status(500).json({ message: "Failed to fetch player availability" });
    }
  });

  // Team-based set availability endpoint (NEW - Stage 5)
  app.post("/api/teams/:teamId/games/:gameId/availability", requireTeamGameAccess(true), async (req: AuthenticatedRequest, res) => {
    try {
      const gameId = Number(req.params.gameId);
      const teamId = Number(req.params.teamId);
      
      // Handle both camelCase and snake_case field names
      const availablePlayerIds = req.body.availablePlayerIds || req.body.available_player_ids;
      const explicitlyEmpty = req.body.explicitlyEmpty || req.body.explicitly_empty;

      if (!Array.isArray(availablePlayerIds)) {
        return res.status(400).json({ message: "availablePlayerIds must be an array" });
      }

      const { playerAvailabilityStorage } = await import('./player-availability-storage');
      
      // Handle explicitly empty case (Select None button)
      if (explicitlyEmpty && availablePlayerIds.length === 0) {
        const success = await playerAvailabilityStorage.setExplicitlyEmptyAvailability(gameId);
        if (success) {
          res.json({ message: "Player availability cleared successfully" });
        } else {
          res.status(500).json({ message: "Failed to clear player availability" });
        }
      } else {
        const success = await playerAvailabilityStorage.setPlayerAvailabilityForGame(gameId, availablePlayerIds);
        if (success) {
          res.json({ message: "Player availability updated successfully" });
        } else {
          res.status(500).json({ message: "Failed to update player availability" });
        }
      }
    } catch (error) {
      console.error('Error setting team player availability:', error);
      res.status(500).json({ message: "Failed to set player availability" });
    }
  });

  // Set player availability for a specific game (LEGACY - will be deprecated)
  app.post("/api/games/:gameId/availability", standardAuth({ requireGameAccess: true }), async (req: AuthenticatedRequest, res) => {
    try {
      const gameId = Number(req.params.gameId);
      const { available_player_ids, explicitly_empty } = req.body; // Expect snake_case after middleware conversion

      if (!Array.isArray(available_player_ids)) {
        return res.status(400).json({ message: "availablePlayerIds must be an array" });
      }

      const { playerAvailabilityStorage } = await import('./player-availability-storage');
      
      // Handle explicitly empty case (Select None button)
      if (explicitly_empty === true && available_player_ids.length === 0) {
        console.log(`API: Handling explicitly empty availability for game ${gameId}`);
        const success = await playerAvailabilityStorage.setExplicitlyEmptyAvailability(gameId);
        if (success) {
          res.json({ message: "Player availability cleared successfully" });
        } else {
          res.status(500).json({ message: "Failed to clear player availability" });
        }
      } else {
        console.log(`API: Setting normal availability for game ${gameId}: ${available_player_ids.length} players`);
        const success = await playerAvailabilityStorage.setPlayerAvailabilityForGame(gameId, available_player_ids);
        if (success) {
          res.json({ message: "Player availability updated successfully" });
        } else {
          res.status(500).json({ message: "Failed to update player availability" });
        }
      }
    } catch (error) {
      console.error('Error setting player availability:', error);
      res.status(500).json({ message: "Failed to set player availability" });
    }
  });

  // Team-based individual player availability update (NEW - Stage 5)
  app.patch("/api/teams/:teamId/games/:gameId/availability/:playerId", requireTeamGameAccess(true), async (req: AuthenticatedRequest, res) => {
    try {
      const gameId = Number(req.params.gameId);
      const playerId = Number(req.params.playerId);
      const { isAvailable } = req.body;

      if (typeof isAvailable !== 'boolean') {
        return res.status(400).json({ message: "isAvailable must be a boolean" });
      }

      const { playerAvailabilityStorage } = await import('./player-availability-storage');
      const success = await playerAvailabilityStorage.updatePlayerAvailability(gameId, playerId, isAvailable);

      if (success) {
        res.json({ message: "Player availability updated successfully" });
      } else {
        res.status(500).json({ message: "Failed to update player availability" });
      }
    } catch (error) {
      console.error('Error updating team player availability:', error);
      res.status(500).json({ message: "Failed to update player availability" });
    }
  });

  // Update individual player availability (LEGACY - will be deprecated)
  app.patch("/api/games/:gameId/availability/:playerId", standardAuth({ requireGameAccess: true }), async (req: AuthenticatedRequest, res) => {
    try {
      const gameId = Number(req.params.gameId);
      const playerId = Number(req.params.playerId);
      const { isAvailable } = req.body;

      if (typeof isAvailable !== 'boolean') {
        return res.status(400).json({ message: "isAvailable must be a boolean" });
      }

      const { playerAvailabilityStorage } = await import('./player-availability-storage');
      const success = await playerAvailabilityStorage.updatePlayerAvailability(gameId, playerId, isAvailable);

      if (success) {
        res.json({ message: "Player availability updated successfully" });
      } else {
        res.status(500).json({ message: "Failed to update player availability" });
      }
    } catch (error) {
      console.error('Error updating individual player availability:', error);
      res.status(500).json({ message: "Failed to update player availability" });
    }
  });

  // ----- GAME STATS API -----
  // Batch endpoint to get rosters for multiple games at once
  // Club-scoped batch rosters endpoint
  app.post("/api/clubs/:clubId/games/rosters/batch", standardAuth({ requireClub: true }), async (req: AuthenticatedRequest, res) => {
    console.log('ENTER batch rosters endpoint');
    try {
      const { gameIds } = camelcaseKeys(req.body, { deep: false });
      const clubId = parseInt(req.params.clubId);

      if (!Array.isArray(gameIds) || gameIds.length === 0) {
        console.log('EXIT: gameIds missing or empty');
        return res.status(400).json({ error: 'gameIds array is required' });
      }

      console.log(`Club-scoped batch rosters request for club ${clubId}, games:`, gameIds);

      // TEST 1: Simple equality query on rosters
      try {
        const singleRoster = await db.select()
          .from(rosters)
          .where(eq(rosters.game_id, 1));
        console.log('Simple equality query rostersData:', singleRoster);
      } catch (err) {
        console.error('Simple equality query error:', err);
      }

      // TEST 2: inArray query on gameStats
      try {
        const statsData = await db.select()
          .from(gameStats)
          .where(inArray(gameStats.game_id, [1, 2, 3]));
        console.log('inArray query gameStatsData:', statsData);
      } catch (err) {
        console.error('inArray query on gameStats error:', err);
      }

      // Group rosters by game ID - ensure consistent format
      const rostersMap: Record<string, any[]> = {};
      gameIds.forEach((gameId: number | string) => {
        const gameIdStr = gameId.toString();
        rostersMap[gameIdStr] = [];
      });

      // Fetch all rosters for the requested games
      const rostersData = await db.select()
        .from(rosters)
        .where(inArray(rosters.game_id, gameIds));

      rostersData.forEach((roster) => {
        const gameId = roster.game_id.toString();
        if (rostersMap[gameId]) {
          rostersMap[gameId].push(roster);
        } else {
          rostersMap[gameId] = [roster];
        }
      });

      console.log(`Club-scoped batch rosters response: found rosters for ${Object.keys(rostersMap).filter(id => rostersMap[id].length > 0).length} games`);
      res.json(transformToApiFormat(rostersMap));
    } catch (error) {
      console.error('Club-scoped batch rosters fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch batch rosters', details: error.message });
    }
  });

  // [LEGACY BATCH ROSTERS ENDPOINT REMOVED] - POST /api/games/rosters/batch

  // Batch endpoint to get stats for multiple games at once
  // Club-scoped batch stats endpoint
  app.post("/api/clubs/:clubId/games/stats/batch", standardAuth({ requireClub: true }), async (req: AuthenticatedRequest, res) => {
    try {
      const { gameIds } = req.body;
      const clubId = parseInt(req.params.clubId);

      if (!Array.isArray(gameIds) || gameIds.length === 0) {
        return res.status(400).json({ error: 'gameIds array is required' });
      }

      console.log(`Club-scoped POST Batch stats endpoint for club ${clubId}, gameIds:`, gameIds);

      const gameIdInts = gameIds.map(id => parseInt(id)).filter(id => !isNaN(id));
      if (gameIdInts.length === 0) {
        return res.json({});
      }

      const stats = await db.select()
        .from(gameStats)
        .where(inArray(gameStats.game_id, gameIdInts));

      // Group stats by game ID - ensure consistent format
      const statsMap: Record<string, any[]> = {};
      gameIds.forEach((gameId: number | string) => {
        const gameIdStr = gameId.toString();
        statsMap[gameIdStr] = [];
      });

      stats.forEach((stat) => {
        const gameId = stat.game_id.toString();
        if (statsMap[gameId]) {
          statsMap[gameId].push(stat);
        } else {
          statsMap[gameId] = [stat];
        }
      });

      console.log(`Club-scoped batch stats response: found stats for ${Object.keys(statsMap).filter(id => statsMap[id].length > 0).length} games`);
      res.json(transformToApiFormat(statsMap));
    } catch (error) {
      console.error('Club-scoped batch stats fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch batch stats', details: error.message });
    }
  });

  // Legacy batch stats endpoint for backward compatibility
  app.post("/api/games/stats/batch", standardAuth({ requireClub: true }), async (req: AuthenticatedRequest, res) => {
    try {
      console.log("POST Batch endpoint received body:", req.body);
      const { gameIds } = req.body;
      console.log("Extracted gameIds from POST body:", gameIds);

      // More robust parameter validation - return empty object instead of error for empty requests
      if (!gameIds || !Array.isArray(gameIds) || gameIds.length === 0) {
        console.log("POST Batch stats endpoint: No game IDs provided, returning empty object");
        return res.json({});
      }

      // Parse and validate game IDs
      const validGameIds = gameIds
        .map(id => {
          const parsed = typeof id === 'number' ? id : parseInt(id, 10);
          return isNaN(parsed) ? null : parsed;
        })
        .filter((id): id is number => id !== null && id > 0);

      if (!validGameIds.length) {
        return res.status(400).json({ error: "No valid game IDs provided" });
      }

      console.log(`POST Batch fetching stats for ${validGameIds.length} games: ${validGameIds.join(',')}`);

      // Process each game ID in parallel with error handling
      const statsPromises = validGameIds.map(async (gameId) => {
        try {
          const stats = await storage.getGameStatsByGame(gameId);
          return { gameId, stats, success: true };
        } catch (error) {
          console.error(`Error fetching stats for game ${gameId}:`, error);
          return { gameId, stats: [], success: false };
        }
      });

      const results = await Promise.all(statsPromises);

      // Create a map of gameId -> stats[]
      const statsMap = results.reduce((acc, result) => {
        acc[result.gameId] = result.stats;
        return acc;
      }, {} as Record<number, any[]>);

      console.log(`POST Batch endpoint successfully returned stats for ${validGameIds.length} games`);
      res.json(transformToApiFormat(statsMap));
    } catch (error) {
      console.error(`Error in POST batch game stats endpoint:`, error);
      res.status(500).json({ error: "Failed to get batch game stats" });
    }
  });

  // Get all game stats for a specific game
  app.get("/api/games/:gameId/stats", standardAuth({ requireGameAccess: true }), async (req, res) => {
    try {
      const gameId = Number(req.params.gameId);
      const stats = await storage.getGameStatsByGame(gameId);
      res.json(transformToApiFormat(stats));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch game stats" });
    }
  });

  // Create a new stat for a specific game (standardized endpoint)
  app.post("/api/games/:gameId/stats", standardAuth({ requireGameAccess: true, permission: 'canManageStats' }), async (req, res) => {
    try {
      const gameId = Number(req.params.gameId);

      // Ensure gameId matches the URL parameter
      const statData = { ...req.body, gameId };

      // Log the request body to diagnose issues
      console.log("Creating game stat with data:", statData);

      // Validate that team_id is provided (after case conversion)
      if (!statData.team_id) {
        return res.status(400).json({ message: "teamId is required for game statistics" });
      }

      // Ensure the rating is properly handled
      if (statData.rating === undefined || statData.rating === '') {
        statData.rating = null;
      }

      const parsedData = insertGameStatSchema.safeParse(statData);
      if (!parsedData.success) {
        console.error("Game stat validation error:", parsedData.error.errors);
        return res.status(400).json({ message: "Invalid game stat data", errors: parsedData.error.errors });
      }

      // Validate quarter (1-4)
      if (parsedData.data.quarter < 1 || parsedData.data.quarter > 4) {
        return res.status(400).json({ message: "Quarter must be between 1 and 4" });
      }

      // Validate position is from allowed set
      if (!POSITIONS.includes(parsedData.data.position as any)) {
        console.error("Invalid position:", parsedData.data.position);
        return res.status(400).json({ message: "Invalid position value" });
      }

      // Stats are now recorded directly against positions without requiring roster context

      try {
        // Check for existing stat with team context
        const existingStats = await storage.getGameStatsByGame(parsedData.data.gameId);
        const duplicate = existingStats.find(s => 
          s.gameId === parsedData.data.gameId && 
          s.teamId === parsedData.data.teamId &&
          s.position === parsedData.data.position && 
          s.quarter === parsedData.data.quarter
        );

        let stat;
        if (duplicate) {
          // Update existing stat instead of creating duplicate
          console.log(`Updating existing stat ID ${duplicate.id} instead of creating duplicate`);
          stat = await storage.updateGameStat(duplicate.id, {
            goalsFor: parsedData.data.goalsFor,
            goalsAgainst: parsedData.data.goalsAgainst,
            missedGoals: parsedData.data.missedGoals,
            rebounds: parsedData.data.rebounds,
            intercepts: parsedData.data.intercepts,
            deflections: parsedData.data.deflections,
            turnovers: parsedData.data.turnovers,
            gains: parsedData.data.gains,
            receives: parsedData.data.receives,
            penalties: parsedData.data.penalties,
            rating: parsedData.data.rating
          });
        } else {
          // Create new stat
          stat = await storage.createGameStat(parsedData.data);
        }

        console.log("Game stat created/updated successfully:", stat);
        res.set('Cache-Control', 'no-cache');
        res.status(201).json(transformToApiFormat(stat, '/api/games/*/stats'));
      } catch (innerError) {
        console.error("Inner error handling game stats:", innerError);
        throw innerError;
      }
    } catch (error) {
      console.error("Failed to create game stat:", error);
      res.status(500).json({ message: "Failed to create game stat" });
    }
  });

  // Update a specific stat for a specific game (standardized endpoint)
  app.patch("/api/games/:gameId/stats/:id", async (req, res) => {
    try {
      const gameId = Number(req.params.gameId);
      const id = Number(req.params.id);

      const updatedStat = await storage.updateGameStat(id, req.body);
      if (!updatedStat) {
        return res.status(404).json({ message: "Game stat not found" });
      }

      // Verify the stat belongs to the correct game
      if (updatedStat.gameId !== gameId) {
        return res.status(400).json({ message: "Stat does not belong to the specified game" });
      }

      // Invalidate cache for this game
      res.set('Cache-Control', 'no-cache');
      console.log(`Updated game stat for game ${updatedStat.gameId}, cache invalidated`);

      res.json(transformToApiFormat(updatedStat));
    } catch (error) {
      console.error("Failed to update game stat:", error);
      res.status(500).json({ message: "Failed to update game stat" });
    }
  });

  // Legacy gamestats endpoints removed - use /api/games/:id/stats instead

  // ----- SEASONS API -----

  // Get teams for a specific player
  app.get("/api/players/:playerId/teams", async (req, res) => {
    try {
      const playerId = parseInt(req.params.playerId);

      console.log(`Fetching teams for player ${playerId}`);

      const teams = await db.execute(sql`
        SELECT 
          t.id,
          t.name,
          t.division_id,
          t.club_id,
          t.season_id,
          c.name as club_name,
          s.name as season_name,
          d.display_name as division_name
        FROM teams t
        JOIN team_players tp ON t.id = tp.team_id
        JOIN clubs c ON t.club_id = c.id
        JOIN seasons s ON t.season_id = s.id
        LEFT JOIN divisions d ON t.division_id = d.id
        WHERE tp.player_id = ${playerId} 
          AND t.is_active = true 
          AND t.name != 'Bye'
        ORDER BY s.start_date DESC, t.name
      `);

      console.log(`Found ${teams.rows.length} teams for player ${playerId}:`, teams.rows.map(r => r.name));

      const mappedTeams = teams.rows.map(row => ({
        id: row.id,
        name: row.name,
        divisionId: row.division_id,
        divisionName: row.division_name,
        clubId: row.club_id,
        seasonId: row.season_id,
        clubName: row.club_name,
        seasonName: row.season_name
      }));

      res.json(transformToApiFormat(mappedTeams));
    } catch (error) {
      console.error("Error fetching player teams:", error);
      res.status(500).json({ message: "Failed to fetch player teams" });
    }
  });

 // [SEASON ENDPOINTS REMOVED] - now in server/season-routes.ts 

  // Get games for a specific season
  app.get('/api/seasons/:id/games', async (req, res) => {
    try {
      const seasonId = parseInt(req.params.id);
      const games = await storage.getGamesBySeason(seasonId);
      res.json(transformToApiFormat(games));
    } catch (error) {
      console.error(`Error fetching games for season ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to fetch games for season' });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // User clubs endpoint - return actual clubs from database
  app.get('/api/user/clubs', async (req: any, res) => {
    try {
      console.log('Fetching user clubs from database...');

      // Get all active clubs and return them as user clubs
      // In a real implementation, this would be filtered by user access
      const result = await db.execute(sql`
        SELECT id, name, code FROM clubs WHERE is_active = true ORDER BY name
      `);

      const userClubs = result.rows.map(club => ({
        clubId: club.id,
        clubName: club.name,
        clubCode: club.code,
        role: "admin", // Default role for now
        permissions: {
          canManagePlayers: true,
          canManageGames: true,
          canManageStats: true,
          canViewOtherTeams: true,
        }
      }));

      console.log('Returning user clubs:', userClubs);
      res.json(userClubs);
    } catch (error) {
      console.error('Error fetching user clubs:', error);
      // Return empty array on error to prevent app crashes
      res.json([]);
    }
  });

  // [CLUB ENDPOINTS REMOVED] - now in server/club-routes.ts

  // Register game status routes
  app.use("/api/game-statuses", gameStatusRoutes);

  // Register game routes
  registerGameRoutes(app);

  // Register club routes
  registerClubRoutes(app);

  // Register player routes
  registerPlayerRoutes(app);

  // Register team routes
  registerTeamRoutes(app);

  // Register season routes
  registerSeasonRoutes(app);

  // Register user management routes
  registerUserManagementRoutes(app);

  //// Register player borrowing routes
  registerPlayerBorrowingRoutes(app);

  // Register game permissions routes
  registerGamePermissionsRoutes(app);

  // Register section routes - REMOVED (section system deprecated)
  
  // Register game-centric stats routes
  const { registerGameStatsRoutes } = await import('./game-stats-routes');
  registerGameStatsRoutes(app);

  // [LEGACY GAME-CENTRIC ROSTER ENDPOINT REMOVED] - now handled in server/team-routes.ts
  // Team Game Awards endpoints
  app.get('/api/games/:gameId/team-awards', async (req, res) => {
    try {
      const gameId = parseInt(req.params.gameId);
      const currentTeamId = req.headers['x-current-team-id'] ? parseInt(req.headers['x-current-team-id'] as string) : null;
      const currentClubId = req.headers['x-current-club-id'] ? parseInt(req.headers['x-current-club-id'] as string) : null;
      
      if (isNaN(gameId)) {
        return res.status(400).json({ error: 'Invalid game ID' });
      }

      // Get the game to determine team context
      const gameResult = await db.execute(sql`
        SELECT g.home_team_id, g.away_team_id, ht.club_id as home_club_id, at.club_id as away_club_id
        FROM games g
        LEFT JOIN teams ht ON g.home_team_id = ht.id
        LEFT JOIN teams at ON g.away_team_id = at.id
        WHERE g.id = ${gameId}
      `);

      if (gameResult.rows.length === 0) {
        return res.status(404).json({ error: 'Game not found' });
      }

      const game = gameResult.rows[0];
      
      // Determine which team to get awards for
      let teamId = currentTeamId;
      
      if (!teamId && currentClubId) {
        // If no specific team, use the team from current club that's playing in this game
        if (game.home_club_id === currentClubId) {
          teamId = game.home_team_id;
        } else if (game.away_club_id === currentClubId) {
          teamId = game.away_team_id;
        } else {
          teamId = game.home_team_id; // Fallback to home team
        }
      } else if (!teamId) {
        // Final fallback to home team
        teamId = game.home_team_id;
      }

      // Get team awards for this game and team
      const awardsResult = await db.execute(sql`
        SELECT tga.*, p.display_name, p.first_name, p.last_name 
        FROM team_game_awards tga
        JOIN players p ON tga.player_id = p.id
        WHERE tga.game_id = ${gameId} AND tga.team_id = ${teamId}
      `);

      res.json(transformToApiFormat(awardsResult.rows.map(row => ({
        id: row.id,
        gameId: row.game_id,
        teamId: row.team_id,
        playerId: row.player_id,
        awardType: row.award_type,
        playerName: row.display_name,
        enteredBy: row.entered_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }))));
    } catch (error) {
      console.error('Error fetching team game awards:', error);
      res.status(500).json({ error: 'Failed to fetch team game awards' });
    }
  });

  app.post('/api/games/:gameId/team-awards', async (req, res) => {
    try {
      const gameId = parseInt(req.params.gameId);
      const { playerId, awardType = 'player_of_match', teamId: bodyTeamId } = req.body;
      const currentTeamId = req.headers['x-current-team-id'] ? parseInt(req.headers['x-current-team-id'] as string) : null;
      const currentClubId = req.headers['x-current-club-id'] ? parseInt(req.headers['x-current-club-id'] as string) : null;
      
      if (isNaN(gameId)) {
        return res.status(400).json({ error: 'Invalid game ID' });
      }

      if (!playerId) {
        return res.status(400).json({ error: 'Player ID is required' });
      }

      // Get the game to determine team context
      const gameResult = await db.execute(sql`
        SELECT g.home_team_id, g.away_team_id, ht.club_id as home_club_id, at.club_id as away_club_id
        FROM games g
        LEFT JOIN teams ht ON g.home_team_id = ht.id
        LEFT JOIN teams at ON g.away_team_id = at.id
        WHERE g.id = ${gameId}
      `);

      if (gameResult.rows.length === 0) {
        return res.status(404).json({ error: 'Game not found' });
      }

      const game = gameResult.rows[0];
      
      // Determine which team to save awards for
      let teamId = bodyTeamId || currentTeamId;
      
      if (!teamId && currentClubId) {
        // If no specific team, use the team from current club that's playing in this game
        if (game.home_club_id === currentClubId) {
          teamId = game.home_team_id;
        } else if (game.away_club_id === currentClubId) {
          teamId = game.away_team_id;
        } else {
          teamId = game.home_team_id; // Fallback to home team
        }
      } else if (!teamId) {
        // Final fallback to home team
        teamId = game.home_team_id;
      }

      if (!teamId) {
        return res.status(400).json({ error: 'Unable to determine team for award' });
      }

      // Insert or update team award
      const result = await db.execute(sql`
        INSERT INTO team_game_awards (game_id, team_id, player_id, award_type, entered_by, created_at, updated_at)
        VALUES (${gameId}, ${teamId}, ${playerId}, ${awardType}, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (game_id, team_id, award_type)
        DO UPDATE SET 
          player_id = EXCLUDED.player_id,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `);

      res.json({ success: true, award: transformToApiFormat(result.rows[0]) });
    } catch (error) {
      console.error('Error saving team game award:', error);
      res.status(500).json({ error: 'Failed to save team game award' });
    }
  });

  // Team Game Notes endpoints
  app.get('/api/games/:gameId/team-notes', async (req, res) => {
    try {
      const gameId = parseInt(req.params.gameId);
      const currentTeamId = req.headers['x-current-team-id'] ? parseInt(req.headers['x-current-team-id'] as string) : null;
      
      if (isNaN(gameId)) {
        return res.status(400).json({ error: 'Invalid game ID' });
      }

      // Get the game to determine team context if no current team
      const gameResult = await db.execute(sql`
        SELECT home_team_id, away_team_id FROM games WHERE id = ${gameId}
      `);

      if (gameResult.rows.length === 0) {
        return res.status(404).json({ error: 'Game not found' });
      }

      const game = gameResult.rows[0];
      
      // Determine which team to get notes for
      let teamId = currentTeamId;
      if (!teamId) {
        // Default to home team if no current team context
        teamId = game.home_team_id;
      }

      // Get team notes for this game and team
      const notesResult = await db.execute(sql`
        SELECT notes, entered_by, created_at, updated_at 
        FROM team_game_notes 
        WHERE game_id = ${gameId} AND team_id = ${teamId}
      `);

      if (notesResult.rows.length === 0) {
        return res.status(404).json({ error: 'No notes found for this game and team' });
      }

      const notes = notesResult.rows[0];
      res.json(transformToApiFormat({
        notes: notes.notes,
        enteredBy: notes.entered_by,
        createdAt: notes.created_at,
        updatedAt: notes.updated_at
      }));
    } catch (error) {
      console.error('Error fetching team game notes:', error);
      res.status(500).json({ error: 'Failed to fetch team game notes' });
    }
  });

  app.post('/api/games/:gameId/team-notes', async (req, res) => {
    try {
      const gameId = parseInt(req.params.gameId);
      const { notes, teamId: bodyTeamId } = req.body;
      const currentTeamId = req.headers['x-current-team-id'] ? parseInt(req.headers['x-current-team-id'] as string) : null;
      
      if (isNaN(gameId)) {
        return res.status(400).json({ error: 'Invalid game ID' });
      }

      // Get the game to determine team context
      const gameResult = await db.execute(sql`
        SELECT home_team_id, away_team_id FROM games WHERE id = ${gameId}
      `);

      if (gameResult.rows.length === 0) {
        return res.status(404).json({ error: 'Game not found' });
      }

      const game = gameResult.rows[0];
      
      // Determine which team to save notes for
      let teamId = bodyTeamId || currentTeamId;
      if (!teamId) {
        // Default to home team if no team context
        teamId = game.home_team_id;
      }

      // Insert or update team notes
      const result = await db.execute(sql`
        INSERT INTO team_game_notes (game_id, team_id, notes, entered_by, created_at, updated_at)
        VALUES (${gameId}, ${teamId}, ${notes}, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (game_id, team_id)
        DO UPDATE SET 
          notes = EXCLUDED.notes,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `);

      res.json(transformToApiFormat({ success: true, notes: result.rows[0] }));
    } catch (error) {
      console.error('Error saving team game notes:', error);
      res.status(500).json({ error: 'Failed to save team game notes' });
    }
  });

  // Register game scores routes
  const { registerGameScoresRoutes } = await import('./game-scores-routes');
  registerGameScoresRoutes(app);

  // Grant Warrandyte access to all games endpoint
  app.post('/api/admin/grant-warrandyte-access', async (req, res) => {
    try {
      const { grantWarrandyteAccessToAllGames } = await import('./grant-warrandyteaccess');
      await grantWarrandyteAccessToAllGames();
      res.json({ message: 'Successfully granted Warrandyte access to all games' });
    } catch (error) {
      console.error('Error granting Warrandyte access:', error);
      res.status(500).json({ error: 'Failed to grant Warrandyte access to games' });
    }
  });

  // Fix player-club associations for players assigned to teams
  app.post('/api/admin/fix-player-club-associations', async (req, res) => {
    try {
      console.log('Fixing player-club associations...');
      
      // Find all players who are assigned to teams but not properly associated with clubs
      const playersNeedingFix = await db.execute(sql`
        SELECT DISTINCT tp.player_id, t.club_id, p.display_name, c.name as club_name
        FROM team_players tp
        JOIN teams t ON tp.team_id = t.id
        JOIN players p ON tp.player_id = p.id
        JOIN clubs c ON t.club_id = c.id
        WHERE NOT EXISTS (
          SELECT 1 FROM club_players cp 
          WHERE cp.player_id = tp.player_id 
            AND cp.club_id = t.club_id 
            AND cp.is_active = true
        )
        ORDER BY c.name, p.display_name
      `);

      console.log(`Found ${playersNeedingFix.rows.length} players needing club association fixes`);
      
      let fixedCount = 0;
      
      for (const row of playersNeedingFix.rows) {
        try {
          await db.execute(sql`
            INSERT INTO club_players (club_id, player_id, joined_date, is_active)
            VALUES (${row.club_id}, ${row.player_id}, CURRENT_DATE, true)
            ON CONFLICT (club_id, player_id) DO UPDATE SET
              is_active = true,
              left_date = null,
              updated_at = NOW()
          `);
          
          console.log(`Fixed: ${row.display_name} -> ${row.club_name} (club_id: ${row.club_id})`);
          fixedCount++;
        } catch (error) {
          console.error(`Failed to fix ${row.display_name} -> ${row.club_name}:`, error);
        }
      }

      res.json({ 
        message: `Successfully fixed ${fixedCount} player-club associations`,
        playersFixed: fixedCount,
        playersNeedingFix: playersNeedingFix.rows.length
      });
    } catch (error) {
      console.error('Error fixing player-club associations:', error);
      res.status(500).json({ error: 'Failed to fix player-club associations' });
    }
  });

  // Reassign all players to Warrandyte and remove from other teams/clubs
  app.post('/api/admin/reassign-all-players-to-warrandyte', async (req, res) => {
    try {
      const { reassignAllPlayersToWarrandyte } = await import('./reassign-all-players-to-warrandyte');
      const result = await reassignAllPlayersToWarrandyte();
      res.json(transformToApiFormat(result));
    } catch (error) {
      console.error('Error reassigning players to Warrandyte:', error);
      res.status(500).json({ error: 'Failed to reassign players to Warrandyte' });
    }
  });

  // ----- CLUB-PLAYER RELATIONSHIPS API -----
  // [MOVED TO player-routes.ts] - GET/POST /api/players/:playerId/clubs



  // Get all teams across all clubs (for inter-club games)
  app.get("/api/teams/all", async (req, res) => {
    try {
      console.log('Fetching all teams across all clubs');

      const teams = await db.execute(sql`
        SELECT t.*, 
               s.name as season_name, 
               s.year as season_year,
               c.name as club_name,
               c.code as club_code,
               d.display_name as division_name
        FROM teams t
        LEFT JOIN seasons s ON t.season_id = s.id
        LEFT JOIN clubs c ON t.club_id = c.id
        LEFT JOIN divisions d ON t.division_id = d.id
        WHERE t.name != 'Bye'
        ORDER BY c.name, t.name
      `);

      console.log(`Found ${teams.rows.length} teams across all clubs`);

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
        seasonName: row.season_name,
        seasonYear: row.season_year,
        clubName: row.club_name,
        clubCode: row.club_code
      }));

      res.json(transformToApiFormat(mappedTeams));
    } catch (error) {
      console.error('Error fetching all teams:', error);
      res.status(500).json({ error: 'Failed to fetch all teams' });
    }
  });

  // Teams routes - DEPRECATED: Use team-routes.ts instead
  // This endpoint is kept for backward compatibility but should be removed
  app.get("/api/teams", async (req, res) => {
    try {
      console.log(`DEPRECATED /api/teams endpoint called for club ${req.user.currentClubId}`);
      console.log('User context:', req.user.clubs);
      console.log('Query params:', req.query);

      if (!req.user.currentClubId) {
        return res.status(400).json({ error: "No current club selected" });
      }

      console.log(`Fetching teams for club ${req.user.currentClubId}`);

      const teams = await db.execute(sql`
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
        WHERE t.club_id = ${req.user.currentClubId} AND t.is_active = true
        ORDER BY s.start_date DESC, t.name
      `);

      console.log(`Raw team query results for club ${req.user.currentClubId}:`, teams.rows.map(row => ({
        id: row.id,
        name: row.name,
        division_id: row.division_id,
        division_name: row.division_name
      })));

      const mappedTeams = teams.rows.map(row => ({
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

      res.json(transformToApiFormat(mappedTeams));
    } catch (error) {
      console.error('Error fetching all teams:', error);
      res.status(500).json({ error: 'Failed to fetch all teams' });
    }
  });

  // Admin endpoint to add all players to Warrandyte

  // Get all unassigned players for a season (not assigned to any team)
  app.get('/api/seasons/:seasonId/unassigned-players', standardAuth({ requireClub: true }), async (req: AuthenticatedRequest, res) => {
    try {
      const seasonId = parseInt(req.params.seasonId);
      const clubId = req.user?.currentClubId;

      if (!clubId) {
        return res.status(400).json({ error: 'Club context required' });
      }

      if (isNaN(seasonId)) {
        return res.status(400).json({ error: 'Invalid season ID' });
      }

      console.log(`\n=== DETAILED UNASSIGNED PLAYERS DEBUG ===`);
      console.log(`Fetching unassigned players for season ${seasonId}, club ${clubId}`);

      // Step 1: Check all players in the club
      const allClubPlayers = await db.execute(sql`
        SELECT p.id, p.display_name, cp.is_active as club_active, p.active as player_active
        FROM players p
        JOIN club_players cp ON p.id = cp.player_id
        WHERE cp.club_id = ${clubId}
        ORDER BY p.display_name
      `);
      console.log(`STEP 1 - All club ${clubId} players (${allClubPlayers.rows.length}):`, 
        allClubPlayers.rows.map(r => `${r.display_name} (club_active: ${r.club_active}, player_active: ${r.player_active})`));

      // Step 2: Check active club players
      const activeClubPlayers = await db.execute(sql`
        SELECT p.id, p.display_name
        FROM players p
        JOIN club_players cp ON p.id = cp.player_id
        WHERE cp.club_id = ${clubId} 
          AND cp.is_active = true
          AND p.active = true
        ORDER BY p.display_name
      `);
      console.log(`STEP 2 - Active club players (${activeClubPlayers.rows.length}):`, 
        activeClubPlayers.rows.map(r => r.display_name));

      // Step 3: Check player_seasons table entries
      const playerSeasonsCheck = await db.execute(sql`
        SELECT ps.player_id, ps.season_id, p.display_name
        FROM players p
        JOIN club_players cp ON p.id = cp.player_id
        JOIN player_seasons ps ON p.id = ps.player_id
        WHERE cp.club_id = ${clubId}
        ORDER BY ps.season_id, p.display_name
      `);
      console.log(`STEP 3 - All player_seasons entries for club ${clubId} (${playerSeasonsCheck.rows.length}):`, 
        playerSeasonsCheck.rows.map(r => `${r.display_name} -> season ${r.season_id}`));

      // Step 4: Check which players are assigned to this specific season
      const seasonPlayers = await db.execute(sql`
        SELECT p.id, p.display_name
        FROM players p
        JOIN club_players cp ON p.id = cp.player_id
        JOIN player_seasons ps ON p.id = ps.player_id
        WHERE cp.club_id = ${clubId} 
          AND ps.season_id = ${seasonId}
        ORDER BY p.display_name
      `);
      console.log(`STEP 4 - Players assigned to season ${seasonId} (${seasonPlayers.rows.length}):`, 
        seasonPlayers.rows.map(r => r.display_name));

      // Step 5: Check team assignments in this season
      const teamAssignments = await db.execute(sql`
        SELECT tp.player_id, tp.team_id, p.display_name, t.name as team_name
        FROM team_players tp
        JOIN players p ON tp.player_id = p.id
        JOIN teams t ON tp.team_id = t.id
        WHERE t.season_id = ${seasonId}
        ORDER BY p.display_name
      `);
      console.log(`STEP 5 - Team assignments in season ${seasonId} (${teamAssignments.rows.length}):`, 
        teamAssignments.rows.map(r => `${r.display_name} -> ${r.team_name} (team_id: ${r.team_id})`));

      // Step 6: Check what the main query would not return without the team exclusion
      const seasonPlayersWithoutTeamFilter = await db.execute(sql`
        SELECT p.id, p.display_name
        FROM players p
        JOIN club_players cp ON p.id = cp.player_id
        JOIN player_seasons ps ON p.id = ps.player_id
        WHERE cp.club_id = ${clubId} 
          AND cp.is_active = true
          AND p.active = true
          AND ps.season_id = ${seasonId}
        ORDER BY p.display_name
      `);
      console.log(`STEP 6 - Season players before team exclusion (${seasonPlayersWithoutTeamFilter.rows.length}):`, 
        seasonPlayersWithoutTeamFilter.rows.map(r => r.display_name));

      // Get all active players from the club who are not assigned to any team in this season
      // This query is more inclusive and will show all club players regardless of season assignment
      const unassignedPlayers = await db.execute(sql`
        SELECT p.id, p.display_name, p.first_name, p.last_name, p.date_of_birth, 
               p.position_preferences, p.active, p.avatar_color
        FROM players p
        JOIN club_players cp ON p.id = cp.player_id
        WHERE cp.club_id = ${clubId} 
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

      console.log(`Unassigned players query returned ${unassignedPlayers.rows.length} players:`, unassignedPlayers.rows.map(r => r.display_name));

      // Let's also check what the final mapped result looks like
      const mappedPlayers = unassignedPlayers.rows.map(row => ({
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

      console.log(`Found ${mappedPlayers.length} unassigned players for season ${seasonId}:`, mappedPlayers.map(p => ({ id: p.id, name: p.displayName })));

      // SPECIFIC DEBUG: Check for Erin
      const erinCheck = await db.execute(sql`
        SELECT p.id, p.display_name,
               cp.is_active as club_active,
               ps.season_id,
               CASE WHEN tp.player_id IS NOT NULL THEN 'ASSIGNED_TO_TEAM' ELSE 'NOT_ASSIGNED' END as team_status,
               t.name as team_name
        FROM players p
        LEFT JOIN club_players cp ON p.id = cp.player_id AND cp.club_id = ${clubId}
        LEFT JOIN player_seasons ps ON p.id = ps.player_id AND ps.season_id = ${seasonId}
        LEFT JOIN team_players tp ON p.id = tp.player_id
        LEFT JOIN teams t ON tp.team_id = t.id AND t.season_id = ${seasonId}
        WHERE LOWER(p.display_name) LIKE '%erin%' OR LOWER(p.first_name) LIKE '%erin%'
        ORDER BY p.display_name
      `);
      console.log(`=== ERIN DEBUG ===`);
      erinCheck.rows.forEach(row => {
        console.log(`Player: ${row.display_name} (ID: ${row.id})`);
        console.log(`  - Club Active: ${row.club_active}`);
        console.log(`  - Season ID: ${row.season_id}`);
        console.log(`  - Team Status: ${row.team_status}`);
        console.log(`  - Team Name: ${row.team_name}`);
      });
      console.log(`=== END ERIN DEBUG ===`);

      console.log(`Final response being sent:`, JSON.stringify(mappedPlayers, null, 2));
      console.log(`=== UNASSIGNED PLAYERS ENDPOINT COMPLETE ===`);
      res.json(transformToApiFormat(mappedPlayers));
    } catch (error) {
      console.error('Error fetching unassigned players:', error);
      res.status(500).json({ error: 'Failed to fetch unassigned players' });
    }
  });

  // Get players by club (DEPRECATED - duplicate endpoint removed)
  // Use the REST endpoint at /api/clubs/:clubId/players with standardAuth instead

  // Games routes
  app.get("/api/games", async (req, res) => {
    try {
      const currentTeamId = req.headers['x-current-team-id'];
      const isClubWide = req.headers['x-club-wide'] === 'true';

      console.log('Games endpoint headers:', {
        'x-current-club-id': req.headers['x-current-club-id'],
        'x-current-team-id': currentTeamId,
        'x-club-wide': isClubWide,
        'user-agent': req.headers['user-agent']?.substring(0, 50),
        'all-headers': Object.keys(req.headers)
      });

      console.log(`Games endpoint: currentClubId=${req.user.currentClubId}, currentTeamId=${currentTeamId}, isClubWide=${isClubWide}, user clubs:`, req.user.clubs);

      if (!req.user.currentClubId) {
        return res.status(400).json({ error: "No current club selected" });
      }

      let query;
      if (isClubWide) {
        console.log(`Fetching ALL games for club ${req.user.currentClubId} (club-wide view)`);
        query = sql`
          SELECT 
            g.*,
            ht.name as home_team_name,
            at.name as away_team_name,
            s.name as season_name,
            s.id as season_id,
            hc.name as home_club_name,
            ac.name as away_club_name,
            gs.name as status_name,
            gs.display_name as status_display_name,
            gs.is_completed as status_is_completed,
            gs.allows_statistics as status_allows_statistics,
            gs.home_team_goals as status_home_team_goals,
            gs.away_team_goals as status_away_team_goals
          FROM games g
          LEFT JOIN teams ht ON g.home_team_id = ht.id
          LEFT JOIN teams at ON g.away_team_id = at.id
          LEFT JOIN seasons s ON g.season_id = s.id
          LEFT JOIN clubs hc ON g.home_club_id = hc.id
          LEFT JOIN clubs ac ON g.away_club_id = ac.id
          LEFT JOIN game_statuses gs ON g.status_id = gs.id
          WHERE g.home_club_id = ${req.user.currentClubId} OR g.away_club_id = ${req.user.currentClubId}
          ORDER BY g.date DESC, g.time DESC
        `;
      } else if (currentTeamId && currentTeamId !== 'null' && currentTeamId !== 'undefined') {
        console.log(`Fetching games for club ${req.user.currentClubId} and team ${currentTeamId}`);
        query = sql`
          SELECT 
            g.*,
            ht.name as home_team_name,
            at.name as away_team_name,
            s.name as season_name,
            s.id as season_id,
            hc.name as home_club_name,
            ac.name as away_club_name,
            gs.name as status_name,
            gs.display_name as status_display_name,
            gs.is_completed as status_is_completed,
            gs.allows_statistics as status_allows_statistics,
            gs.home_team_goals as status_home_team_goals,
            gs.away_team_goals as status_away_team_goals
          FROM games g
          LEFT JOIN teams ht ON g.home_team_id = ht.id
          LEFT JOIN teams at ON g.away_team_id = at.id
          LEFT JOIN seasons s ON g.season_id = s.id
          LEFT JOIN clubs hc ON g.home_club_id = hc.id
          LEFT JOIN clubs ac ON g.away_club_id = ac.id
          LEFT JOIN game_statuses gs ON g.status_id = gs.id
          WHERE (g.home_club_id = ${req.user.currentClubId} OR g.away_club_id = ${req.user.currentClubId})
            AND (g.home_team_id = ${currentTeamId} OR g.away_team_id = ${currentTeamId})
          ORDER BY g.date DESC, g.time DESC
        `;
      } else {
        console.log(`Fetching all games for club ${req.user.currentClubId}`);
        query = sql`
          SELECT 
            g.*,
            ht.name as home_team_name,
            at.name as away_team_name,
            s.name as season_name,
            s.id as season_id,
            hc.name as home_club_name,
            ac.name as away_club_name,
            gs.name as status_name,
            gs.display_name as status_display_name,
            gs.is_completed as status_is_completed,
            gs.allows_statistics as status_allows_statistics,
            gs.home_team_goals as status_home_team_goals,
            gs.away_team_goals as status_away_team_goals
          FROM games g
          LEFT JOIN teams ht ON g.home_team_id = ht.id
          LEFT JOIN teams at ON g.away_team_id = at.id
          LEFT JOIN seasons s ON g.season_id = s.id
          LEFT JOIN clubs hc ON g.home_club_id = hc.id
          LEFT JOIN clubs ac ON g.away_club_id = ac.id
          LEFT JOIN game_statuses gs ON g.status_id = gs.id
          WHERE g.home_club_id = ${req.user.currentClubId} OR g.away_club_id = ${req.user.currentClubId}
          ORDER BY g.date DESC, g.time DESC
        `;
      }

      const games = (await db.execute(query)).rows.map(row => ({
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
        homeTeamName: row.home_team_name,
        awayTeamName: row.away_team_name,
        seasonName: row.season_name,
              seasonId: row.season_id,
        homeClubName: row.home_club_name,
        awayClubName: row.away_club_name,
        statusName: row.status_name,
        statusDisplayName: row.status_display_name,
        statusIsCompleted: row.status_is_completed,
        statusAllowsStatistics: row.status_allows_statistics,
        statusTeamGoals: row.status_home_team_goals,
        statusOpponentGoals: row.status_away_team_goals
      }));

      res.json(transformToApiFormat(games));
    } catch (error) {
      console.error('Error fetching games:', error);
      res.status(500).json({ error: 'Failed to fetch games' });
    }
  });

  // Update game statistics
  app.put("/api/games/:id/stats", requireClubAccess(), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const gameId = parseInt(req.params.id);
      const { stats, confirmCompleted } = req.body;

      // Check if game is completed and require confirmation
      const gameResult = await db.execute(sql`
        SELECT g.*, gs.is_completed, gs.display_name as status_display_name
        FROM games g 
        LEFT JOIN game_statuses gs ON g.status_id = gs.id
        WHERE g.id = ${gameId}
      `);

      if (gameResult.rows.length === 0) {
        return res.status(404).json({ error: "Game not found" });
      }

      const game = gameResult.rows[0];

      // If game is completed and no confirmation provided, require confirmation
      if (game.is_completed && !confirmCompleted) {
        return res.status(400).json({ 
          error: "This game is completed. Please confirm you want to edit completed game statistics.",
          requiresConfirmation: true,
          gameStatus: game.status_display_name
        });
      }

      // Process the statistics update
      for (const stat of stats) {
        await storage.updateGameStat(stat.id, stat);
      }

      // For inter-club games, check for score discrepancies and warn
      const updatedStats = await storage.getGameStatsByGame(gameId);
      let mismatchWarning = null;

      if (updatedStats.length > 0) {
        const teamIds = [...new Set(updatedStats.map(s => s.teamId))];
        if (teamIds.length > 1) {
          // This is an inter-club game - check for mismatches
          const team1Stats = updatedStats.filter(s => s.teamId === teamIds[0]);
          const team2Stats = updatedStats.filter(s => s.teamId === teamIds[1]);

          const team1Totals = {
            teamId: teamIds[0],
            goalsFor: team1Stats.reduce((sum, s) => sum + (s.goalsFor || 0), 0),
            goalsAgainst: team1Stats.reduce((sum, s) => sum + (s.goalsAgainst || 0), 0)
          };

          const team2Totals = {
            teamId: teamIds[1],
            goalsFor: team2Stats.reduce((sum, s) => sum + (s.goalsFor || 0), 0),
            goalsAgainst: team2Stats.reduce((sum, s) => sum + (s.goalsAgainst || 0), 0)
          };

          // Check if scores match (team1's goalsFor should equal team2's goalsAgainst)
          if (team1Totals.goalsFor !== team2Totals.goalsAgainst || 
              team1Totals.goalsAgainst !== team2Totals.goalsFor) {
            mismatchWarning = `Score mismatch detected: Team ${teamIds[0]} recorded ${team1Totals.goalsFor} for/${team1Totals.goalsAgainst} against, but Team ${teamIds[1]} recorded ${team2Totals.goalsFor} for/${team2Totals.goalsAgainst} against`;
          }
        }
      }

      res.json({ 
        success: true, 
        message: "Statistics updated successfully",
        mismatchWarning 
      });
    } catch (error) {
      console.error('Error updating game statistics:', error);
      res.status(500).json({ error: 'Failed to update game statistics' });
    }
  });



  // [LEGACY BATCH ROSTER ENDPOINT REMOVED] - POST /api/games/:gameId/rosters/batch

  // Canonical club-scoped batch roster save endpoint
  app.post('/api/clubs/:clubId/teams/:teamId/games/:gameId/rosters/batch', requireTeamGameAccess(true), async (req: AuthenticatedRequest, res) => {
    try {
      const { clubId, teamId, gameId } = req.params;
      const { rosters: rosterData } = req.body;

      // Normalize all roster entries to use playerId (support both playerId and player_id)
      const normalizedRosterData = Array.isArray(rosterData)
        ? rosterData.map(r => ({ ...r, playerId: r.playerId ?? r.player_id }))
        : [];

      // Log the incoming normalizedRosterData for debugging
      console.log('Received normalizedRosterData:', JSON.stringify(normalizedRosterData, null, 2));

      if (!Array.isArray(normalizedRosterData)) {
        return res.status(400).json({ error: 'Rosters data must be an array' });
      }

      // Fail-fast check for missing playerId
      const missingPlayerId = normalizedRosterData.find(r => r.playerId == null);
      if (missingPlayerId) {
        console.error('Roster entry missing playerId:', missingPlayerId);
        return res.status(400).json({ error: 'All roster entries must have a playerId' });
      }

      const clubIdNum = parseInt(clubId);
      const teamIdNum = parseInt(teamId);
      const gameIdNum = parseInt(gameId);

      // Validate club/team relationship
      const teamResult = await pool.query('SELECT club_id FROM teams WHERE id = $1', [teamIdNum]);
      if (teamResult.rowCount === 0 || teamResult.rows[0].club_id !== clubIdNum) {
        return res.status(400).json({ error: 'Team does not belong to the specified club' });
      }

      // Validate team/game relationship
      const gameResult = await pool.query('SELECT id FROM games WHERE id = $1 AND (home_team_id = $2 OR away_team_id = $2)', [gameIdNum, teamIdNum]);
      if (gameResult.rowCount === 0) {
        return res.status(400).json({ error: 'Team is not playing in this game' });
      }

      // Log the mapped insert values for debugging
      const insertValues = normalizedRosterData.flatMap(roster => [gameIdNum, roster.playerId, roster.position, roster.quarter]);
      console.log('Insert values:', insertValues);

      // Use a single transaction for the entire operation
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        // Delete all existing roster entries for this game
        await client.query('DELETE FROM rosters WHERE game_id = $1', [gameIdNum]);
        // Insert new roster entries
        if (normalizedRosterData.length > 0) {
          const insertQuery = `
            INSERT INTO rosters (game_id, player_id, position, quarter)
            VALUES ${normalizedRosterData.map((_, index) => `($${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}, $${index * 4 + 4})`).join(', ')};
          `;
          await client.query(insertQuery, insertValues);
        }
        await client.query('COMMIT');
        res.json({ success: true, message: `Successfully saved ${normalizedRosterData.length} roster entries for game ${gameIdNum}` });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error in club-scoped batch roster save:', error);
      res.status(500).json({ error: 'Failed to save roster entries' });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}