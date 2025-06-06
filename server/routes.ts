import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { db, pool } from "./db";
import { 
  insertPlayerSchema, importPlayerSchema,
  insertGameSchema, importGameSchema,
  insertRosterSchema, importRosterSchema,
  insertGameStatSchema, importGameStatSchema,
  insertSeasonSchema,
  players, games, rosters, gameStats, seasons,
  POSITIONS
} from "@shared/schema";

import { updatePlayerSeasonRelationships, getPlayerSeasons } from "./player-season-routes";
import gameStatusRoutes from "./game-status-routes";
import { registerTeamRoutes } from './team-routes';
import { registerUserManagementRoutes } from "./user-management-routes";
import { registerPlayerBorrowingRoutes } from "./player-borrowing-routes";
import { registerGamePermissionsRoutes } from "./game-permissions-routes";
import { 
  AuthenticatedRequest, 
  requireClubAccess, 
  requireTeamAccess, 
  requireGameAccess,
  loadUserPermissions,
  requireAuth,
  standardAuth
} from "./auth-middleware";

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
  app.use(async (req: any, res, next) => {
    // For development, simulate an authenticated user with access to all clubs
    if (!req.user) {
      try {
        // Check database health first
        const isHealthy = await checkPoolHealth();
        if (!isHealthy) {
          console.warn('Database connection unhealthy, using fallback user setup');
          req.user = {
            id: 1,
            username: 'dev-user',
            clubs: [],
            currentClubId: null
          };
        } else {
          // Get all clubs from database for dev user with retry logic
          let allClubs;
          let retryCount = 0;
          const maxRetries = 3;

          while (retryCount < maxRetries) {
            try {
              allClubs = await db.execute(sql`SELECT id, name, code FROM clubs WHERE is_active = true`);
              break;
            } catch (dbError: any) {
              retryCount++;
              console.warn(`Database query attempt ${retryCount} failed:`, dbError.message);

              if (retryCount >= maxRetries) {
                throw dbError;
              }

              // Wait before retry (exponential backoff)
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 100));
            }
          }

          const userClubs = allClubs.rows.map(club => ({
            clubId: club.id,
            role: 'admin',
            permissions: {
              canManagePlayers: true,
              canManageGames: true,
              canManageStats: true,
              canViewOtherTeams: true,
            }
          }));

          req.user = {
            id: 1,
            username: 'dev-user',
            clubs: userClubs,
            currentClubId: null // Will be set below
          };
        }
      } catch (error) {
        console.error('Error loading clubs for dev user:', error);
        // Fallback to basic setup without default club
        req.user = {
          id: 1,
          username: 'dev-user',
          clubs: [],
          currentClubId: null
        };
      }
    }

    // Check for club ID header and set it if present
    const headerClubId = req.headers['x-current-club-id'];
    if (headerClubId) {
      const clubId = parseInt(headerClubId as string, 10);
      if (!isNaN(clubId)) {
        req.user.currentClubId = clubId;
        console.log(`Auth middleware: Set currentClubId to ${clubId} from header`);
      } else {
        console.log(`Auth middleware: Invalid header club ID: ${headerClubId}`);
        req.user.currentClubId = null;
      }
    } else {
      // Log only once per request type to avoid spam
      if (!req.url.includes('user/clubs') && !req.url.includes('seasons')) {
        console.log(`Auth middleware: No x-current-club-id header for ${req.method} ${req.url}`);
      }
      req.user.currentClubId = null;
    }

    next();
  });

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

      console.log("Import validation:", { 
        players: hasPlayers ? data.players.length : 0,
        opponents: hasOpponents ? data.opponents.length : 0, 
        games: hasGames ? data.games.length : 0,
        rosters: hasRosters ? data.rosters.length : 0,
        stats: hasGameStats ? data.gameStats.length : 0
      });

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
              id, name, display_name, points, opponent_points, team_goals, opponent_goals,
              is_completed, allows_statistics, requires_opponent, color_class, sort_order, is_active
            ) VALUES (
              ${status.id}, 
              ${status.name || "unknown"}, 
              ${status.displayName || "Unknown"}, 
              ${status.points || 0}, 
              ${status.opponentPoints || 0}, 
              ${status.teamGoals || null}, 
              ${status.opponentGoals || null}, 
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
              id, club_id, season_id, name, division, is_active
            ) VALUES (
              ${team.id}, 
              ${team.clubId}, 
              ${team.seasonId}, 
              ${team.name || "Unknown Team"}, 
              ${team.division || null}, 
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

      // First, log the total we'll attempt to import
      console.log(`Processing ${rostersData.length} roster entries...`);

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

          console.log(`Found valid roster entry:`, roster);

          await db.execute(sql`
            INSERT INTO rosters (
              id, game_id, quarter, position, player_id
            ) VALUES (
              ${roster.id}, 
              ${roster.gameId}, 
              ${quarter}, 
              ${position}, 
              ${roster.playerId}
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
      console.log(`Processing ${statsData.length} game stat entries...`);

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
            gameId: stat.gameId,
            playerId: stat.playerId,
            quarter: stat.quarter >= 1 && stat.quarter <= 4 ? stat.quarter : 1,
            goalsFor: Math.max(0, parseInt(stat.goalsFor || 0)),
            goalsAgainst: Math.max(0, parseInt(stat.goalsAgainst || 0)),
            missedGoals: Math.max(0, parseInt(stat.missedGoals || 0)),
            rebounds: Math.max(0, parseInt(stat.rebounds || 0)),
            intercepts: Math.max(0, parseInt(stat.intercepts || 0)),
            badPass: Math.max(0, parseInt(stat.badPass || 0)),
            handlingError: Math.max(0, parseInt(stat.handlingError || 0)),
            pickUp: Math.max(0, parseInt(stat.pickUp || 0)),
            infringement: Math.max(0, parseInt(stat.infringement || 0)),
            rating: Math.min(10, Math.max(1, parseInt(stat.rating || 5)))
          };

          console.log(`Processing stat for quarter ${cleanStat.quarter}, player ${cleanStat.playerId}:`, stat);

          await db.execute(sql`
            INSERT INTO game_stats (
              id, game_id, player_id, quarter, goals_for, goals_against, 
              missed_goals, rebounds, intercepts, bad_pass, handling_error, 
              pick_up, infringement, rating
            ) VALUES (
              ${cleanStat.id}, 
              ${cleanStat.gameId}, 
              ${cleanStat.playerId}, 
              ${cleanStat.quarter}, 
              ${cleanStat.goalsFor}, 
              ${cleanStat.goalsAgainst}, 
              ${cleanStat.missedGoals}, 
              ${cleanStat.rebounds}, 
              ${cleanStat.intercepts}, 
              ${cleanStat.badPass}, 
              ${cleanStat.handlingError}, 
              ${cleanStat.pickUp}, 
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
  app.get("/api/players", standardAuth({ requireClub: true }), async (req: AuthenticatedRequest, res) => {
    try {
      const clubId = req.user?.currentClubId;

      if (!clubId) {
        return res.status(400).json({ message: "Club context not available" });
      }

      console.log(`Fetching players for club ${clubId}`);
      const players = await storage.getPlayersByClub(clubId);
      res.json(players);
    } catch (error) {
      console.error('Error fetching players:', error);
      res.status(500).json({ message: "Failed to fetch players" });
    }
  });

  // Simple direct player-seasons relationships handler
  app.post("/api/players/:id/seasons", async (req, res) => {
    try {
      const playerId = parseInt(req.params.id, 10);
      const seasonIds = req.body.seasonIds || [];

      console.log(`POST /api/players/${playerId}/seasons - DIRECT HANDLER`);
      console.log("Request body:", req.body);
      console.log("Season IDs:", seasonIds);

      // Validate playerId
      if (isNaN(playerId) || playerId <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid player ID" 
        });
      }

      // Get database client
      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        // Check if player exists
        const playerCheck = await client.query(
          'SELECT id FROM players WHERE id = $1',
          [playerId]
        );

        if (playerCheck.rowCount === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({ 
            success: false, 
            message: "Player not found" 
          });
        }

        // Convert and validate seasonIds
        const validSeasonIds = seasonIds
          .map((id) => typeof id === 'string' ? parseInt(id, 10) : id)
          .filter((id) => !isNaN(id) && id > 0);

        console.log("Valid season IDs:", validSeasonIds);

        // Delete existing relationships
        await client.query(
          'DELETE FROM player_seasons WHERE player_id = $1',
          [playerId]
        );

        // Insert new relationships if any
        if (validSeasonIds.length > 0) {
          // Create query for batch insert
          const placeholders = validSeasonIds
            .map((_, idx) => `($1, $${idx + 2})`)
            .join(', ');

          const params = [playerId, ...validSeasonIds];

          // Execute insert
          const query = `INSERT INTO player_seasons (player_id, season_id) VALUES ${placeholders}`;
          console.log("Insert query:", query);
          console.log("Insert params:", params);

          await client.query(query, params);
        }

        // Commit changes
        await client.query('COMMIT');

        // Get updated seasons for response
        const seasonsResult = await client.query(
          `SELECT s.* 
           FROM seasons s
           JOIN player_seasons ps ON s.id = ps.season_id
           WHERE ps.player_id = $1
           ORDER BY s.start_date DESC`,
          [playerId]
        );

        return res.json({
          success: true,
          message: `Player ${playerId} seasons updated successfully`,
          seasons: seasonsResult.rows
        });

      } catch (dbError) {
        await client.query('ROLLBACK');
        console.error("Database error in player-seasons update:", dbError);
        return res.status(500).json({ 
          success: false, 
          message: "Database error in player-seasons update", 
          error: dbError instanceof Error ? dbError.message : "Unknown database error"
        });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error in player-seasons update:", error);
      return res.status(500).json({ 
        success: false,
        message: "Failed to update player seasons", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // GET endpoint to retrieve player's seasons
  app.get("/api/players/:id/seasons", async (req, res) => {
    try {
      // Import the player-season route handler function
      const { getPlayerSeasons } = await import('./player-season-routes');

      // Call the handler with the request and response objects
      await getPlayerSeasons(req, res);
    } catch (error) {
      console.error("Error handling player-seasons fetch request:", error);
      res.status(500).json({ 
        message: "Failed to get player seasons", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Player-club association routes
  app.get("/api/players/:id/clubs", async (req, res) => {
    try {
      const playerId = parseInt(req.params.id, 10);

      if (isNaN(playerId)) {
        return res.status(400).json({ message: "Invalid player ID" });
      }

      const result = await pool.query(`
        SELECT c.id, c.name, c.code, c.description
        FROM clubs c
        JOIN club_players cp ON c.id = cp.club_id
        WHERE cp.player_id = $1 AND cp.is_active = true
      `, [playerId]);

      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching player clubs:", error);
      res.status(500).json({ message: "Failed to fetch player clubs" });
    }
  });

  app.post("/api/players/:id/clubs", async (req, res) => {
    try {
      const playerId = parseInt(req.params.id, 10);
      const { clubIds = [] } = req.body;

      console.log(`Updating clubs for player ${playerId}:`, clubIds);

      if (isNaN(playerId)) {
        return res.status(400).json({ message: "Invalid player ID" });
      }

      // Validate that clubIds is an array
      if (!Array.isArray(clubIds)) {
        return res.status(400).json({ message: "clubIds must be an array" });
      }

      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        // Check if player exists
        const playerCheck = await client.query(
          'SELECT id FROM players WHERE id = $1',
          [playerId]
        );

        if (playerCheck.rowCount === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({ message: "Player not found" });
        }

        // Remove existing club associations for this player
        const deleteResult = await client.query(
          'DELETE FROM club_players WHERE player_id = $1',
          [playerId]
        );
        console.log(`Deleted ${deleteResult.rowCount} existing club associations for player ${playerId}`);

        // Add new club associations
        let insertedCount = 0;
        for (const clubId of clubIds) {
          const numericClubId = typeof clubId === 'string' ? parseInt(clubId, 10) : clubId;
          if (typeof numericClubId === 'number' && numericClubId > 0) {
            console.log(`Inserting club association: player ${playerId} -> club ${numericClubId}`);
            await client.query(`
              INSERT INTO club_players (club_id, player_id, is_active, joined_date)
              VALUES ($1, $2, true, CURRENT_DATE)
            `, [numericClubId, playerId]);
            insertedCount++;
          } else {
            console.warn(`Skipping invalid club ID: ${clubId}`);
          }
        }

        await client.query('COMMIT');
        console.log(`Successfully updated player ${playerId} clubs: inserted ${insertedCount} associations`);
        res.json({ 
          success: true, 
          message: "Player clubs updated successfully",
          clubsAdded: insertedCount,
          clubIds: clubIds
        });
      } catch (error) {
        await client.query('ROLLBACK');
        console.error("Database error updating player clubs:", error);
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error updating player clubs:", error);
      res.status(500).json({ 
        message: "Failed to update player clubs",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Club CRUD routes - removed duplicate endpoint (enhanced version below includes statistics)

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
        return res.status(400).json({ message: "Club code already exists" });
      }

      const result = await pool.query(`
        INSERT INTO clubs (name, code, description, address, contact_email, contact_phone, primary_color, secondary_color)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, name, code,description, address, contact_email, contact_phone, primary_color, secondary_color
      `, [name, code.toUpperCase(), description, address, contactEmail, contactPhone, primaryColor, secondaryColor]);

      const club = result.rows[0];
      res.status(201).json({
        id: club.id,
        name: club.name,
        code: club.code,
        description: club.description,
        address: club.address,
        contactEmail: club.contact_email,
        contactPhone: club.contact_phone,
        primaryColor: club.primary_color,
        secondaryColor: club.secondary_color
      });
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
      res.json({
        id: club.id,
        name: club.name,
        code: club.code,
        description: club.description,
        address: club.address,
        contactEmail: club.contact_email,
        contactPhone: club.contact_phone,
        primaryColor: club.primary_color,
        secondaryColor: club.secondary_color
      });
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
      const playerId = Number(req.params.id);

      //      // Import our specialized player-season function
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
      console.log(`Fetching seasons for player ID: ${playerId}`);

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
  // Players endpoints
  app.post('/api/players', standardAuth({ requireClub: true, permission: 'canManagePlayers' }), async (req: AuthenticatedRequest, res) => {
    try {
      const {
        firstName,
        lastName,
        dateOfBirth,
        email,
        phone,
        positionPreferences,
        clubId,
        avatarColor
      } = req.body;

      if (!req.user?.currentClubId) {
        return res.status(400).json({ error: 'Club context required' });
      }

      // Validate required fields
      if (!firstName || !lastName) {
        return res.status(400).json({ error: 'First name and last name are required' });
      }

      // Create the player
      const playerId = await db.transaction(async (tx) => {
        // Insert player
        const playerResult = await tx.execute(sql`
          INSERT INTO players (
            first_name, 
            last_name, 
            display_name,
            date_of_birth, 
            email, 
            phone, 
            position_preferences,
            avatar_color,
            created_at,
            updated_at
          ) VALUES (
            ${firstName},
            ${lastName},
            ${`${firstName} ${lastName.charAt(0)}`},
            ${dateOfBirth || null},
            ${email || null},
            ${phone || null},
            ${positionPreferences ? JSON.stringify(positionPreferences) : null},
            ${avatarColor || 'auto'},
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          ) RETURNING id
        `);

        const newPlayerId = playerResult.rows[0].id;

        // Add player to club_players table
        await tx.execute(sql`
          INSERT INTO club_players (club_id, player_id, is_active, created_at)
          VALUES (${req.user.currentClubId}, ${newPlayerId}, true, CURRENT_TIMESTAMP)
        `);

        return newPlayerId;
      });

      // Fetch the created player
      const playerResult = await db.execute(sql`
        SELECT 
          p.*,
          cp.is_active as club_active
        FROM players p
        JOIN club_players cp ON p.id = cp.player_id
        WHERE p.id = ${playerId} AND cp.club_id = ${req.user.currentClubId}
      `);

      if (playerResult.rows.length === 0) {
        return res.status(404).json({ error: 'Player not found after creation' });
      }

      const player = playerResult.rows[0];
      res.json({
        id: player.id,
        firstName: player.first_name,
        lastName: player.last_name,
        displayName: player.display_name,
        dateOfBirth: player.date_of_birth,
        email: player.email,
        phone: player.phone,
        positionPreferences: player.position_preferences ? JSON.parse(player.position_preferences) : [],
        avatarColor: player.avatar_color,
        isActive: player.club_active,
        createdAt: player.created_at,
        updatedAt: player.updated_at
      });

    } catch (error) {
      console.error('Error creating player:', error);
      res.status(500).json({ error: 'Failed to create player' });
    }
  });

  app.get('/api/players', async (req: AuthenticatedRequest, res) => {
    try {
      const players = await storage.getPlayers();
      res.json(players);
    } catch (error) {
      console.error('Error fetching players:', error);
      res.status(500).json({ error: 'Failed to fetch players' });
    }
  });

  // Get players for a specific club
  app.get('/api/clubs/:clubId/players', standardAuth({ requireClub: true }), async (req: AuthenticatedRequest, res) => {
    try {
      const clubId = parseInt(req.params.clubId);
      const players = await storage.getPlayersByClub(clubId);
      res.json(players);
    } catch (error) {
      console.error('Error fetching club players:', error);
      res.status(500).json({ error: 'Failed to fetch club players' });
    }
  });
  // Games routes
  app.get("/api/games", loadUserPermissions, async (req, res) => {
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
            gs.team_goals as status_team_goals,
            gs.opponent_goals as status_opponent_goals
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
            gs.team_goals as status_team_goals,
            gs.opponent_goals as status_opponent_goals
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
            gs.team_goals as status_team_goals,
            gs.opponent_goals as status_opponent_goals
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
        statusTeamGoals: row.status_team_goals,
        statusOpponentGoals: row.status_opponent_goals
      }));

      res.json(games);
    } catch (error) {
      console.error('Error fetching games:', error);
      res.status(500).json({ error: 'Failed to fetch games' });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}