import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { db, pool } from "./db";
import { 
  insertPlayerSchema, importPlayerSchema,
  insertOpponentSchema, importOpponentSchema,
  insertGameSchema, importGameSchema,
  insertRosterSchema, importRosterSchema,
  insertGameStatSchema, importGameStatSchema,
  insertSeasonSchema,
  players, opponents, games, rosters, gameStats, seasons,
  POSITIONS
} from "@shared/schema";

import { updatePlayerSeasonRelationships, getPlayerSeasons } from "./player-season-routes";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // ----- DIAGNOSTIC APIs -----

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

  // Clear all data for fresh import
  app.post("/api/clear-data", async (req, res) => {
    try {
      // Delete all data in reverse order of dependencies
      await db.execute(sql`DELETE FROM game_stats`);
      await db.execute(sql`DELETE FROM rosters`);
      await db.execute(sql`DELETE FROM games`);
      await db.execute(sql`DELETE FROM opponents`);
      await db.execute(sql`DELETE FROM players`);

      // Reset all sequences
      await db.execute(sql`ALTER SEQUENCE game_stats_id_seq RESTART WITH 1`);
      await db.execute(sql`ALTER SEQUENCE rosters_id_seq RESTART WITH 1`);
      await db.execute(sql`ALTER SEQUENCE games_id_seq RESTART WITH 1`);
      await db.execute(sql`ALTER SEQUENCE opponents_id_seq RESTART WITH 1`);
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

      // DIRECT INSERT OPPONENTS
      for (const opponent of data.opponents) {
        try {
          await db.execute(sql`
            INSERT INTO opponents (
              id, team_name, primary_contact, contact_info,
              primary_color, secondary_color, notes
            ) VALUES (
              ${opponent.id}, 
              ${opponent.teamName || "Unknown Team"}, 
              ${opponent.primaryContact || null}, 
              ${opponent.contactInfo || null},
              ${opponent.primaryColor || "#000000"},
              ${opponent.secondaryColor || "#FFFFFF"},
              ${opponent.notes || null}
            )
          `);
          opponentsImported++;
        } catch (error) {
          console.error(`Failed to import opponent ${opponent.id}:`, error);
        }
      }

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
  app.get("/api/players", async (req, res) => {
    try {
      const players = await storage.getPlayers();
      res.json(players);
    } catch (error) {
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

      // Import our specialized player-season function
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

  app.post("/api/players", async (req, res) => {
    try {
      // Ensure we're not processing a duplicate request
      const requestId = req.headers['x-request-id'] || req.ip + ':' + Date.now();

      // Check if we're doing an import operation (with ID) or regular create
      const hasId = req.body.id !== undefined;

      // Use the appropriate schema based on operation type
      const schema = hasId ? importPlayerSchema : insertPlayerSchema;
      const parsedData = schema.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({ message: "Invalid player data", errors: parsedData.error.errors });
      }

      // Let the storage layer handle the avatar color assignment
      const playerData = parsedData.data;

      // Log the request for debugging
      console.log(`Creating player with request ID: ${requestId}`, {
        displayName: playerData.displayName,
        firstName: playerData.firstName,
        lastName: playerData.lastName
      });

      // Create the player (avatar color handling is now in the storage layer)
      const player = await storage.createPlayer(playerData);

      // Log successful creation
      console.log(`Successfully created player with ID: ${player.id}`);

      res.status(201).json(player);
    } catch (error) {
      console.error("Failed to create player:", error);
      res.status(500).json({ message: "Failed to create player" });
    }
  });

  app.patch("/api/players/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);

      console.log("\n\n======= PLAYER UPDATE START ========");
      console.log("Player ID:", id);
      console.log("Raw request body:", JSON.stringify(req.body, null, 2));

      // Simplify - always use the direct format
      const updateData = {...req.body};

      console.log("Player update data:", JSON.stringify(updateData, null, 2));

      // Season management is now handled separately on the player details page
      // We don't expect seasonIds in the request anymore
      let processedSeasonIds = [];

      // Remove season IDs from player update data if it exists
      delete updateData.seasonIds;
      console.log("==================================");

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
        displayName: updateData.displayName,
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        dateOfBirth: updateData.dateOfBirth,
        positionPreferences: updateData.positionPreferences,
        active: updateData.active,
        avatarColor: updateData.avatarColor
      };

      console.log("Sanitized player data for update:", validPlayerData);

      // Update the player first
      const updatedPlayer = await storage.updatePlayer(id, validPlayerData);
      if (!updatedPlayer) {
        return res.status(404).json({ message: "Player not found" });
      }

      // Season management is now handled separately on the player details page
      // We don't need to update player-season relationships here anymore
      console.log(`Player ${id} updated successfully. Season management is handled separately now.`);

      // Fetch the updated player with season info before returning
      try {
        // Get the player's seasons to include in the response
        const { getPlayerSeasons } = await import('./db');
        const playerSeasons = await getPlayerSeasons(id);

        // Create a more complete response that includes the seasons
        const enhancedResponse = {
          ...updatedPlayer,
          seasons: playerSeasons || []
        };

        console.log(`Player ${id} successfully updated with seasons:`, playerSeasons);
        console.log("======= PLAYER UPDATE COMPLETE ========\n\n");

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

  // ----- OPPONENTS API -----
  app.get("/api/opponents", async (req, res) => {
    try {
      const opponents = await storage.getOpponents();
      res.json(opponents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch opponents" });
    }
  });

  app.get("/api/opponents/:id", async (req, res) => {
    try {
      const opponent = await storage.getOpponent(Number(req.params.id));
      if (!opponent) {
        return res.status(404).json({ message: "Opponent not found" });
      }
      res.json(opponent);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch opponent" });
    }
  });

  app.post("/api/opponents", async (req, res) => {
    try {
      // Check if we're doing an import operation (with ID) or regular create
      const hasId = req.body.id !== undefined;

      // Use the appropriate schema based on operation type
      const schema = hasId ? importOpponentSchema : insertOpponentSchema;
      const parsedData = schema.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({ message: "Invalid opponent data", errors: parsedData.error.errors });
      }

      // Pass the parsed data to the storage layer
      const opponent = await storage.createOpponent(parsedData.data);
      res.status(201).json(opponent);
    } catch (error) {
      console.error("Failed to create opponent:", error);
      res.status(500).json({ message: "Failed to create opponent" });
    }
  });

  app.patch("/api/opponents/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const updatedOpponent = await storage.updateOpponent(id, req.body);
      if (!updatedOpponent) {
        return res.status(404).json({ message: "Opponent not found" });
      }
      res.json(updatedOpponent);
    } catch (error) {
      res.status(500).json({ message: "Failed to update opponent" });
    }
  });

  app.delete("/api/opponents/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteOpponent(id);
      if (!success) {
        return res.status(404).json({ message: "Opponent not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete opponent" });
    }
  });

  // ----- GAMES API -----
  app.get("/api/games", async (req, res) => {
    try {
      const games = await storage.getGames();

      // Debug game information
      console.log("Available games:", games.map(g => ({ 
        id: g.id, 
        date: g.date, 
        status: g.status || (g.completed ? 'completed' : 'upcoming'),
        completed: g.completed 
      })));

      res.json(games);
    } catch (error) {
      console.error("Error fetching games:", error);
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });

  app.get("/api/games/:id", async (req, res) => {
    try {
      const game = await storage.getGame(Number(req.params.id));
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.json(game);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch game" });
    }
  });

  // Unified endpoint for all games (BYE and regular)
  app.post("/api/games", async (req, res) => {
    try {
      console.log("Game creation request:", req.body);

      // Direct database insert for BYE games to bypass schema validation
      if (req.body.isBye === true) {
        try {
          // Use drizzle SQL to execute a direct insert for BYE games
          const result = await db.execute(
            sql`INSERT INTO "games" ("date", "time", "is_bye", "completed", "opponent_id") 
                VALUES (${req.body.date}, ${req.body.time}, ${true}, ${false}, NULL) 
                RETURNING *`
          );

          // Map the result to match our expected format
          const game = {
            id: result.rows[0].id,
            date: result.rows[0].date,
            time: result.rows[0].time,
            opponentId: null,
            completed: result.rows[0].completed,
            isBye: result.rows[0].is_bye
          };

          console.log("Created BYE game:", game);
          return res.status(201).json(game);
        } catch (dbError) {
          console.error("Database BYE game error:", dbError);
          return res.status(500).json({ 
            message: "Failed to create BYE game", 
            error: (dbError as Error).message
          });
        }
      } else {
        // For regular games, ensure we have an opponentId
        if (!req.body.opponentId) {
          return res.status(400).json({ 
            message: "Invalid game data", 
            errors: [{ message: "Opponent is required for regular games" }] 
          });
        }

        // Handle normal games
        const gameData = {
          date: req.body.date,
          time: req.body.time,
          opponentId: typeof req.body.opponentId === 'string' 
            ? parseInt(req.body.opponentId, 10) 
            : req.body.opponentId,
          completed: req.body.completed || false,
          isBye: false,
          round: req.body.round || null,
          venue: req.body.venue || null,
          teamScore: req.body.teamScore || 0,
          opponentScore: req.body.opponentScore || 0,
          notes: req.body.notes || null
        };

        console.log("Creating regular game:", gameData);
        const game = await storage.createGame(gameData);
        console.log("Created regular game:", game);
        return res.status(201).json(game);
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

  // One-time endpoint to add the missing 4th game as upcoming
  app.post("/api/games/createUpcoming", async (req, res) => {
    try {
      // Check if a 4th game exists already
      const games = await storage.getGames();
      if (games.length >= 4) {
        // Set the 4th game as upcoming
        const fourthGame = games[3];
        await storage.updateGame(fourthGame.id, { completed: false });
        return res.json({ message: "Fourth game updated as upcoming", game: fourthGame });
      }

      // Add a new upcoming game (e.g., June 2, 2025)
      const newGame = await storage.createGame({
        date: "2025-06-02",
        time: "14:00",
        opponentId: 2, // Using an existing opponent ID
        completed: false
      });

      res.status(201).json({ message: "New upcoming game created", game: newGame });
    } catch (error) {
      res.status(500).json({ message: "Failed to create upcoming game" });
    }
  });

  app.patch("/api/games/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);

      console.log('Updating game with ID:', id);
      console.log('Update payload:', req.body);

      // If we're updating a game to be a BYE round, allow opponentId to be null
      if (req.body.isBye === true) {
        // Make opponentId null if updating to BYE game
        req.body.opponentId = null;
      } else if (req.body.isBye === false && req.body.opponentId === null) {
        // Don't allow non-BYE games with null opponent
        return res.status(400).json({ message: "Opponent is required for non-BYE games" });
      }

      // Handle status changes - make sure completed field is also updated for compatibility
      if (req.body.status) {
        const completedStatuses = ['completed', 'forfeit-win', 'forfeit-loss'];
        req.body.completed = completedStatuses.includes(req.body.status);
        console.log(`Status changed to ${req.body.status}, setting completed to ${req.body.completed}`);
      }

      // Log all available games before update for debugging
      const allGames = await storage.getGames();
      console.log('Available games:', allGames.map(g => ({ 
        id: g.id, 
        date: g.date, 
        status: g.status, 
        completed: g.completed 
      })));

      const updatedGame = await storage.updateGame(id, req.body);
      if (!updatedGame) {
        console.log('Game not found for update');
        return res.status(404).json({ message: "Game not found" });
      }

      console.log('Game updated successfully:', updatedGame);

      res.json(updatedGame);
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

  // ----- ROSTERS API -----
  app.get("/api/games/:gameId/rosters", async (req, res) => {
    try {
      const gameId = Number(req.params.gameId);
      const rosters = await storage.getRostersByGame(gameId);
      res.json(rosters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rosters" });
    }
  });

  // API endpoint to delete all roster entries for a game
  app.delete("/api/games/:gameId/rosters", async (req, res) => {
    try {
      const gameId = Number(req.params.gameId);
      await storage.deleteRostersByGame(gameId);
      res.json({ success: true, message: "All roster entries deleted for game" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete roster entries" });
    }
  });

  app.post("/api/rosters", async (req, res) => {
    try {
      const parsedData = insertRosterSchema.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({ message: "Invalid roster data", errors: parsedData.error.errors });
      }

      // Validate position
      if (!POSITIONS.includes(parsedData.data.position as any)) {
        return res.status(400).json({ message: "Invalid position" });
      }

      // Validate quarter (1-4)
      if (parsedData.data.quarter < 1 || parsedData.data.quarter > 4) {
        return res.status(400).json({ message: "Quarter must be between 1 and 4" });
      }

      const roster = await storage.createRoster(parsedData.data);
      res.status(201).json(roster);
    } catch (error) {
      res.status(500).json({ message: "Failed to create roster position" });
    }
  });

  app.patch("/api/rosters/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const updatedRoster = await storage.updateRoster(id, req.body);
      if (!updatedRoster) {
        return res.status(404).json({ message: "Roster position not found" });
      }
      res.json(updatedRoster);
    } catch (error) {
      res.status(500).json({ message: "Failed to update roster position" });
    }
  });

  app.delete("/api/rosters/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteRoster(id);
      if (!success) {
        return res.status(404).json({ message: "Roster position not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete roster position" });
    }
  });

  // ----- PLAYER AVAILABILITY API -----

  // Get player availability for a specific game
  app.get("/api/games/:gameId/availability", async (req, res) => {
    try {
      const gameId = Number(req.params.gameId);
      const { playerAvailabilityStorage } = await import('./player-availability-storage');

      const availablePlayerIds = await playerAvailabilityStorage.getPlayerAvailabilityForGame(gameId);
      res.json({ availablePlayerIds });
    } catch (error) {
      console.error('Error fetching player availability:', error);
      res.status(500).json({ message: "Failed to fetch player availability" });
    }
  });

  // Set player availability for a specific game
  app.post("/api/games/:gameId/availability", async (req, res) => {
    try {
      const gameId = Number(req.params.gameId);
      const { availablePlayerIds } = req.body;

      if (!Array.isArray(availablePlayerIds)) {
        return res.status(400).json({ message: "availablePlayerIds must be an array" });
      }

      const { playerAvailabilityStorage } = await import('./player-availability-storage');
      const success = await playerAvailabilityStorage.setPlayerAvailabilityForGame(gameId, availablePlayerIds);

      if (success) {
        res.json({ message: "Player availability updated successfully" });
      } else {
        res.status(500).json({ message: "Failed to update player availability" });
      }
    } catch (error) {
      console.error('Error setting player availability:', error);
      res.status(500).json({ message: "Failed to set player availability" });
    }
  });

  // Update individual player availability
  app.patch("/api/games/:gameId/availability/:playerId", async (req, res) => {
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
  // Batch endpoint to get stats for multiple games at once
  app.get("/api/games/stats/batch", async (req, res) => {
    try {
      console.log("Batch endpoint received query:", req.query);
      const gameIdsParam = req.query.gameIds as string;
      console.log("Extracted gameIds parameter:", gameIdsParam);

      // More robust parameter validation - return empty object instead of error for empty requests
      if (!gameIdsParam || typeof gameIdsParam !== 'string' || gameIdsParam.trim() === '') {
        console.log("Batch stats endpoint: No game IDs provided, returning empty object");
        return res.json({});
      }

      // Parse and validate game IDs
      const gameIds = gameIdsParam.split(',')
        .map(id => {
          const parsed = parseInt(id.trim(), 10);
          return isNaN(parsed) ? null : parsed;
        })
        .filter((id): id is number => id !== null && id > 0);

      if (!gameIds.length) {
        return res.status(400).json({ error: "No valid game IDs provided" });
      }

      console.log(`Batch fetching stats for ${gameIds.length} games: ${gameIds.join(',')}`);

      // Process each game ID in parallel with error handling
      const statsPromises = gameIds.map(async (gameId) => {
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

      console.log(`Batch endpoint successfully returned stats for ${gameIds.length} games`);
      res.json(statsMap);
    } catch (error) {
      console.error(`Error in batch game stats endpoint:`, error);
      res.status(500).json({ error: "Failed to get batch game stats" });
    }
  });

  // Get all game stats for a specific game
  app.get("/api/games/:gameId/stats", async (req, res) => {
    try {
      const gameId = Number(req.params.gameId);
      const stats = await storage.getGameStatsByGame(gameId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch game stats" });
    }
  });

  // Create a new stat for a specific game (standardized endpoint)
  app.post("/api/games/:gameId/stats", async (req, res) => {
    try {
      const gameId = Number(req.params.gameId);

      // Ensure gameId matches the URL parameter
      const statData = { ...req.body, gameId };

      // Log the request body to diagnose issues
      console.log("Creating game stat with data:", statData);

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

      try {
        // Check for existing stat
        const existingStats = await storage.getGameStatsByGame(parsedData.data.gameId);
        const duplicate = existingStats.find(s => 
          s.gameId === parsedData.data.gameId && 
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
            badPass: parsedData.data.badPass,
            handlingError: parsedData.data.handlingError,
            pickUp: parsedData.data.pickUp,
            infringement: parsedData.data.infringement,
            rating: parsedData.data.rating
          });
        } else {
          // Create new stat
          stat = await storage.createGameStat(parsedData.data);
        }

        console.log("Game stat created/updated successfully:", stat);
        res.set('Cache-Control', 'no-cache');
        res.status(201).json(stat);
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

      res.json(updatedStat);
    } catch (error) {
      console.error("Failed to update game stat:", error);
      res.status(500).json({ message: "Failed to update game stat" });
    }
  });

  // Add a standard route without hyphens for game stats (for consistency)
  app.get("/api/gamestats", async (req, res) => {
    try {
      // If no game ID is provided, return an empty array
      if (!req.query.gameId) {
        return res.json([]);
      }

      const gameId = Number(req.query.gameId);
      const stats = await storage.getGameStatsByGame(gameId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch game stats" });
    }
  });

  // Batch endpoint to fetch stats for multiple games in a single request
  app.get("/api/gamestats/batch", async (req, res) => {
    try {
      const gameIdsParam = req.query.gameIds as string;

      if (!gameIdsParam) {
        return res.status(400).json({ message: "gameIds query parameter is required" });
      }

      // Parse and validate game IDs
      const gameIds = gameIdsParam.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));

      if (gameIds.length === 0) {
        return res.status(400).json({ message: "No valid game IDs provided" });
      }

      console.log(`Batch fetching stats for ${gameIds.length} games:`, gameIds);

      // Fetch stats for all games in parallel
      const statsPromises = gameIds.map(id => storage.getGameStatsByGame(id));
      const statsResults = await Promise.all(statsPromises);

      // Flatten the array of arrays into a single array of all stats
      const allStats = statsResults.flat();

      console.log(`Returning batch of ${allStats.length} stats for ${gameIds.length} games`);
      res.json(allStats);
    } catch (error) {
      console.error("Error in batch stats API:", error);
      res.status(500).json({ message: "Failed to fetch batch game stats" });
    }
  });

  app.post("/api/gamestats", async (req, res) => {
    try {
      // Log the request body to diagnose issues
      console.log("Creating/updating game stat with data:", req.body);

      // Ensure the rating is properly handled
      if (req.body.rating === undefined || req.body.rating === '') {
        req.body.rating = null;
      }

      const parsedData = insertGameStatSchema.safeParse(req.body);
      if (!parsedData.success) {
        console.error("Game stat validation error:", parsedData.error.errors);
        return res.status(400).json({ message: "Invalid game stat data", errors: parsedData.error.errors });
      }

      // Validate quarter (1-4)
      if (parsedData.data.quarter < 1 || parsedData.data.quarter > 4) {
        return res.status(400).json({ message: "Quarter must be between 1 and 4" });
      }

      // Check if a stat already exists for this game/position/quarter
      const existingStats = await storage.getGameStatsByGame(parsedData.data.gameId);
      const existingStat = existingStats.find(s => 
        s.position === parsedData.data.position && 
        s.quarter === parsedData.data.quarter
      );

      // Validate position is from allowed set
      if (!POSITIONS.includes(parsedData.data.position as any)) {
        console.error("Invalid position:", parsedData.data.position);
        return res.status(400).json({ message: "Invalid position value" });
      }

      try {
        // First, try to find an existing stat record
        const existingStats = await storage.getGameStatsByGame(parsedData.data.gameId);
        console.log(`Found ${existingStats.length} existing stats for game ${parsedData.data.gameId}`);

        const duplicate = existingStats.find(s => 
          s.gameId === parsedData.data.gameId && 
          s.position === parsedData.data.position && 
          s.quarter === parsedData.data.quarter
        );

        let stat;

        if (duplicate) {
          // Update existing stat instead of creating new one to avoid unique constraint violation
          console.log(`Updating existing stat ID ${duplicate.id} instead of creating duplicate`);
          try {
            stat = await storage.updateGameStat(duplicate.id, {
              goalsFor: parsedData.data.goalsFor,
              goalsAgainst: parsedData.data.goalsAgainst,
              missedGoals: parsedData.data.missedGoals,
              rebounds: parsedData.data.rebounds,
              intercepts: parsedData.data.intercepts,
              badPass: parsedData.data.badPass,
              handlingError: parsedData.data.handlingError,
              pickUp: parsedData.data.pickUp,
              infringement: parsedData.data.infringement,
              rating: parsedData.data.rating
            });
          } catch (updateError) {
            console.error("Error updating existing stat:", updateError);
            throw updateError;
          }
        } else {
          // Try to insert directly via SQL query to avoid ORM issues
          try {
            console.log("Creating new game stat via direct SQL");
            const result = await db.execute(sql`
              INSERT INTO game_stats (
                game_id, position, quarter, goals_for, goals_against, 
                missed_goals, rebounds, intercepts, bad_pass, 
                handling_error, pick_up, infringement, rating
              ) 
              VALUES (
                ${parsedData.data.gameId}, 
                ${parsedData.data.position}, 
                ${parsedData.data.quarter}, 
                ${parsedData.data.goalsFor || 0}, 
                ${parsedData.data.goalsAgainst || 0}, 
                ${parsedData.data.missedGoals || 0}, 
                ${parsedData.data.rebounds || 0}, 
                ${parsedData.data.intercepts || 0}, 
                ${parsedData.data.badPass || 0}, 
                ${parsedData.data.handlingError || 0}, 
                ${parsedData.data.pickUp || 0}, 
                ${parsedData.data.infringement || 0}, 
                ${parsedData.data.rating === undefined ? null : parsedData.data.rating}
              )
              RETURNING *
            `);
            console.log("Insert result:", result);

            // The result should contain the newly created record
            if (result.length > 0) {
              stat = result[0];
            } else {
              throw new Error("Failed to insert game stat - no rows returned");
            }
          } catch (insertError) {
            console.error("Error creating new game stat via SQL:", insertError);

            // Try one more time with the regular ORM method
            try {
              stat = await storage.createGameStat(parsedData.data);
            } catch (ormError) {
              console.error("ORM method also failed:", ormError);
              throw ormError;
            }
          }
        }

        // Log the successfully created/updated stat
        console.log("Game stat created/updated successfully:", stat);

        // Invalidate any cached data for this game
        // This ensures fresh data is fetched on next request
        res.set('Cache-Control', 'no-cache');

        res.status(201).json(stat);
      } catch (innerError) {
        console.error("Inner error handling game stats:", innerError);
        throw innerError;
      }
    } catch (error) {
      console.error("Failed to create game stat:", error);
      res.status(500).json({ message: "Failed to create game stat" });
    }
  });

  app.patch("/api/gamestats/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const updatedStat = await storage.updateGameStat(id, req.body);
      if (!updatedStat) {
        return res.status(404).json({ message: "Game stat not found" });
      }

      // Invalidate cache for this game
      res.set('Cache-Control', 'no-cache');
      console.log(`Updated game stat for game ${updatedStat.gameId}, cache invalidated`);

      res.json(updatedStat);
    } catch (error) {
      res.status(500).json({ message: "Failed to update game stat" });
    }
  });

  app.delete("/api/gamestats/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteGameStat(id);
      if (!success) {
        return res.status(404).json({ message: "Game stat not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete game stat" });
    }
  });

  // ----- SEASONS API -----

  // Get all seasons
  app.get('/api/seasons', async (req, res) => {
    try {
      const allSeasons = await storage.getSeasons();
      res.json(allSeasons);
    } catch (error) {
      console.error('Error fetching seasons:', error);
      res.status(500).json({ message: 'Failed to fetch seasons' });
    }
  });

  // Get active season
  app.get('/api/seasons/active', async (req, res) => {
    try {
      const activeSeason = await storage.getActiveSeason();
      if (!activeSeason) {
        return res.status(404).json({ message: 'No active season found' });
      }
      res.json(activeSeason);
    } catch (error) {
      console.error('Error fetching active season:', error);
      res.status(500).json({ message: 'Failed to fetch active season' });
    }
  });

  // Get season by ID
  app.get('/api/seasons/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const season = await storage.getSeason(id);
      if (!season) {
        return res.status(404).json({ message: 'Season not found' });
      }
      res.json(season);
    } catch (error) {
      console.error(`Error fetching season ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to fetch season' });
    }
  });

  // Create season
  app.post('/api/seasons', async (req, res) => {
    try {
      const seasonData = insertSeasonSchema.parse(req.body);
      const season = await storage.createSeason(seasonData);
      res.status(201).json(season);
    } catch (error) {
      console.error('Error creating season:', error);
      res.status(400).json({ message: 'Invalid season data' });
    }
  });

  // Update season
  app.patch('/api/seasons/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // Allow partial updates
      const seasonData = req.body;
      const updatedSeason = await storage.updateSeason(id, seasonData);
      if (!updatedSeason) {
        return res.status(404).json({ message: 'Season not found' });
      }
      res.json(updatedSeason);
    } catch (error) {
      console.error(`Error updating season ${req.params.id}:`, error);
      res.status(400).json({ message: 'Invalid season data' });
    }
  });

  // Set active season
  app.post('/api/seasons/:id/activate', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const season = await storage.setActiveSeason(id);
      if (!season) {
        return res.status(404).json({ message: 'Season not found' });
      }
      res.json(season);
    } catch (error) {
      console.error(`Error activating season ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to activate season' });
    }
  });

  // Delete season
  app.delete('/api/seasons/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const activeSeason = await storage.getActiveSeason();

      // Prevent deleting the active season
      if (activeSeason && activeSeason.id === id) {
        return res.status(400).json({ 
          message: 'Cannot delete the active season. Activate another season first.' 
        });
      }

      const deleted = await storage.deleteSeason(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Season not found' });
      }
      res.status(204).end();
    } catch (error) {
      console.error(`Error deleting season ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to delete season' });
    }
  });

  // Get games for a specific season
  app.get('/api/seasons/:id/games', async (req, res) => {
    try {
      const seasonId = parseInt(req.params.id);
      const games = await storage.getGamesBySeason(seasonId);
      res.json(games);
    } catch (error) {
      console.error(`Error fetching games for season ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to fetch games for season' });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
import {
  players,
  opponents,
  games,
  gameStats,
  rosters,
  seasons,
  playerAvailability,
  users,
  gameStatuses,
  type InsertPlayer,
  type InsertOpponent,
  type InsertGame,
  type InsertGameStat,
  type InsertRoster,
  type InsertSeason,
  type InsertPlayerAvailability,
  type InsertUser,
} from "@shared/schema";

import { updatePlayerSeasonRelationships, getPlayerSeasons } from "./player-season-routes";
// Import the game status routes
import gameStatusRoutes from "./game-status-routes";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // ----- DIAGNOSTIC APIs -----

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

  // Clear all data for fresh import
  app.post("/api/clear-data", async (req, res) => {
    try {
      // Delete all data in reverse order of dependencies
      await db.execute(sql`DELETE FROM game_stats`);
      await db.execute(sql`DELETE FROM rosters`);
      await db.execute(sql`DELETE FROM games`);
      await db.execute(sql`DELETE FROM opponents`);
      await db.execute(sql`DELETE FROM players`);

      // Reset all sequences
      await db.execute(sql`ALTER SEQUENCE game_stats_id_seq RESTART WITH 1`);
      await db.execute(sql`ALTER SEQUENCE rosters_id_seq RESTART WITH 1`);
      await db.execute(sql`ALTER SEQUENCE games_id_seq RESTART WITH 1`);
      await db.execute(sql`ALTER SEQUENCE opponents_id_seq RESTART WITH 1`);
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

      // DIRECT INSERT OPPONENTS
      for (const opponent of data.opponents) {
        try {
          await db.execute(sql`
            INSERT INTO opponents (
              id, team_name, primary_contact, contact_info,
              primary_color, secondary_color, notes
            ) VALUES (
              ${opponent.id},
              ${opponent.teamName || "Unknown Team"},
              ${opponent.primaryContact || null},
              ${opponent.contactInfo || null},
              ${opponent.primaryColor || "#000000"},
              ${opponent.secondaryColor || "#FFFFFF"},
              ${opponent.notes || null}
            )
          `);
          opponentsImported++;
        } catch (error) {
          console.error(`Failed to import opponent ${opponent.id}:`, error);
        }
      }

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
  app.get("/api/players", async (req, res) => {
    try {
      const players = await storage.getPlayers();
      res.json(players);
    } catch (error) {
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

      // Import our specialized player-season function
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

  app.post("/api/players", async (req, res) => {
    try {
      // Ensure we're not processing a duplicate request
      const requestId = req.headers['x-request-id'] || req.ip + ':' + Date.now();

      // Check if we're doing an import operation (with ID) or regular create
      const hasId = req.body.id !== undefined;

      // Use the appropriate schema based on operation type
      const schema = hasId ? importPlayerSchema : insertPlayerSchema;
      const parsedData = schema.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({ message: "Invalid player data", errors: parsedData.error.errors });
      }

      // Let the storage layer handle the avatar color assignment
      const playerData = parsedData.data;

      // Log the request for debugging
      console.log(`Creating player with request ID: ${requestId}`, {
        displayName: playerData.displayName,
        firstName: playerData.firstName,
        lastName: playerData.lastName
      });

      // Create the player (avatar color handling is now in the storage layer)
      const player = await storage.createPlayer(playerData);

      // Log successful creation
      console.log(`Successfully created player with ID: ${player.id}`);

      res.status(201).json(player);
    } catch (error) {
      console.error("Failed to create player:", error);
      res.status(500).json({ message: "Failed to create player" });
    }
  });

  app.patch("/api/players/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);

      console.log("\n\n======= PLAYER UPDATE START ========");
      console.log("Player ID:", id);
      console.log("Raw request body:", JSON.stringify(req.body, null, 2));

      // Simplify - always use the direct format
      const updateData = { ...req.body };

      console.log("Player update data:", JSON.stringify(updateData, null, 2));

      // Season management is now handled separately on the player details page
      // We don't expect seasonIds in the request anymore
      let processedSeasonIds = [];

      // Remove season IDs from player update data if it exists
      delete updateData.seasonIds;
      console.log("==================================");

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
        displayName: updateData.displayName,
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        dateOfBirth: updateData.dateOfBirth,
        positionPreferences: updateData.positionPreferences,
        active: updateData.active,
        avatarColor: updateData.avatarColor
      };

      console.log("Sanitized player data for update:", validPlayerData);

      // Update the player first
      const updatedPlayer = await storage.updatePlayer(id, validPlayerData);
      if (!updatedPlayer) {
        return res.status(404).json({ message: "Player not found" });
      }

      // Season management is now handled separately on the player details page
      // We don't need to update player-season relationships here anymore
      console.log(`Player ${id} updated successfully. Season management is handled separately now.`);

      // Fetch the updated player with season info before returning
      try {
        // Get the player's seasons to include in the response
        const { getPlayerSeasons } = await import('./db');
        const playerSeasons = await getPlayerSeasons(id);

        // Create a more complete response that includes the seasons
        const enhancedResponse = {
          ...updatedPlayer,
          seasons: playerSeasons || []
        };

        console.log(`Player ${id} successfully updated with seasons:`, playerSeasons);
        console.log("======= PLAYER UPDATE COMPLETE ========\n\n");

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

  // ----- OPPONENTS API -----
  app.get("/api/opponents", async (req, res) => {
    try {
      const opponents = await storage.getOpponents();
      res.json(opponents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch opponents" });
    }
  });

  app.get("/api/opponents/:id", async (req, res) => {
    try {
      const opponent = await storage.getOpponent(Number(req.params.id));
      if (!opponent) {
        return res.status(404).json({ message: "Opponent not found" });
      }
      res.json(opponent);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch opponent" });
    }
  });

  app.post("/api/opponents", async (req, res) => {
    try {
      // Check if we're doing an import operation (with ID) or regular create
      const hasId = req.body.id !== undefined;

      // Use the appropriate schema based on operation type
      const schema = hasId ? importOpponentSchema : insertOpponentSchema;
      const parsedData = schema.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({ message: "Invalid opponent data", errors: parsedData.error.errors });
      }

      // Pass the parsed data to the storage layer
      const opponent = await storage.createOpponent(parsedData.data);
      res.status(201).json(opponent);
    } catch (error) {
      console.error("Failed to create opponent:", error);
      res.status(500).json({ message: "Failed to create opponent" });
    }
  });

  app.patch("/api/opponents/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const updatedOpponent = await storage.updateOpponent(id, req.body);
      if (!updatedOpponent) {
        return res.status(404).json({ message: "Opponent not found" });
      }
      res.json(updatedOpponent);
    } catch (error) {
      res.status(500).json({ message: "Failed to update opponent" });
    }
  });

  app.delete("/api/opponents/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteOpponent(id);
      if (!success) {
        return res.status(404).json({ message: "Opponent not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete opponent" });
    }
  });

  // ----- GAMES API -----
  app.get("/api/games", async (req, res) => {
    try {
      const games = await storage.getGames();

      // Debug game information
      console.log("Available games:", games.map(g => ({
        id: g.id,
        date: g.date,
        status: g.status || (g.completed ? 'completed' : 'upcoming'),
        completed: g.completed
      })));

      res.json(games);
    } catch (error) {
      console.error("Error fetching games:", error);
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });

  app.get("/api/games/:id", async (req, res) => {
    try {
      const game = await storage.getGame(Number(req.params.id));
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.json(game);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch game" });
    }
  });

  // Unified endpoint for all games (BYE and regular)
  app.post("/api/games", async (req, res) => {
    try {
      console.log("Game creation request:", req.body);

      // Direct database insert for BYE games to bypass schema validation
      if (req.body.isBye === true) {
        try {
          // Use drizzle SQL to execute a direct insert for BYE games
          const result = await db.execute(
            sql`INSERT INTO "games" ("date", "time", "is_bye", "completed", "opponent_id")
                VALUES (${req.body.date}, ${req.body.time}, ${true}, ${false}, NULL)
                RETURNING *`
          );

          // Map the result to match our expected format
          const game = {
            id: result.rows[0].id,
            date: result.rows[0].date,
            time: result.rows[0].time,
            opponentId: null,
            completed: result.rows[0].completed,
            isBye: result.rows[0].is_bye
          };

          console.log("Created BYE game:", game);
          return res.status(201).json(game);
        } catch (dbError) {
          console.error("Database BYE game error:", dbError);
          return res.status(500).json({
            message: "Failed to create BYE game",
            error: (dbError as Error).message
          });
        }
      } else {
        // For regular games, ensure we have an opponentId
        if (!req.body.opponentId) {
          return res.status(400).json({
            message: "Invalid game data",
            errors: [{ message: "Opponent is required for regular games" }]
          });
        }

        // Handle normal games
        const gameData = {
          date: req.body.date,
          time: req.body.time,
          opponentId: typeof req.body.opponentId === 'string'
            ? parseInt(req.body.opponentId, 10)
            : req.body.opponentId,
          completed: req.body.completed || false,
          isBye: false,
          round: req.body.round || null,
          venue: req.body.venue || null,
          teamScore: req.body.teamScore || 0,
          opponentScore: req.body.opponentScore || 0,
          notes: req.body.notes || null
        };

        console.log("Creating regular game:", gameData);
        const game = await storage.createGame(gameData);
        console.log("Created regular game:", game);
        return res.status(201).json(game);
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

  // One-time endpoint to add the missing 4th game as upcoming
  app.post("/api/games/createUpcoming", async (req, res) => {
    try {
      // Check if a 4th game exists already
      const games = await storage.getGames();
      if (games.length >= 4) {
        // Set the 4th game as upcoming
        const fourthGame = games[3];
        await storage.updateGame(fourthGame.id, { completed: false });
        return res.json({ message: "Fourth game updated as upcoming", game: fourthGame });
      }

      // Add a new upcoming game (e.g., June 2, 2025)
      const newGame = await storage.createGame({
        date: "2025-06-02",
        time: "14:00",
        opponentId: 2, // Using an existing opponent ID
        completed: false
      });

      res.status(201).json({ message: "New upcoming game created", game: newGame });
    } catch (error) {
      res.status(500).json({ message: "Failed to create upcoming game" });
    }
  });

  app.patch("/api/games/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);

      console.log('Updating game with ID:', id);
      console.log('Update payload:', req.body);

      // If we're updating a game to be a BYE round, allow opponentId to be null
      if (req.body.isBye === true) {
        // Make opponentId null if updating to BYE game
        req.body.opponentId = null;
      } else if (req.body.isBye === false && req.body.opponentId === null) {
        // Don't allow non-BYE games with null opponent
        return res.status(400).json({ message: "Opponent is required for non-BYE games" });
      }

      // Handle status changes - make sure completed field is also updated for compatibility
      if (req.body.status) {
        const completedStatuses = ['completed', 'forfeit-win', 'forfeit-loss'];
        req.body.completed = completedStatuses.includes(req.body.status);
        console.log(`Status changed to ${req.body.status}, setting completed to ${req.body.completed}`);
      }

      // Log all available games before update for debugging
      const allGames = await storage.getGames();
      console.log('Available games:', allGames.map(g => ({
        id: g.id,
        date: g.date,
        status: g.status,
        completed: g.completed
      })));

      const updatedGame = await storage.updateGame(id, req.body);
      if (!updatedGame) {
        console.log('Game not found for update');
        return res.status(404).json({ message: "Game not found" });
      }

      console.log('Game updated successfully:', updatedGame);

      res.json(updatedGame);
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

  // ----- ROSTERS API -----
  app.get("/api/games/:gameId/rosters", async (req, res) => {
    try {
      const gameId = Number(req.params.gameId);
      const rosters = await storage.getRostersByGame(gameId);
      res.json(rosters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rosters" });
    }
  });

  // API endpoint to delete all roster entries for a game
  app.delete("/api/games/:gameId/rosters", async (req, res) => {
    try {
      const gameId = Number(req.params.gameId);
      await storage.deleteRostersByGame(gameId);
      res.json({ success: true, message: "All roster entries deleted for game" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete roster entries" });
    }
  });

  app.post("/api/rosters", async (req, res) => {
    try {
      const parsedData = insertRosterSchema.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({ message: "Invalid roster data", errors: parsedData.error.errors });
      }

      // Validate position
      if (!POSITIONS.includes(parsedData.data.position as any)) {
        return res.status(400).json({ message: "Invalid position" });
      }

      // Validate quarter (1-4)
      if (parsedData.data.quarter < 1 || parsedData.data.quarter > 4) {
        return res.status(400).json({ message: "Quarter must be between 1 and 4" });
      }

      const roster = await storage.createRoster(parsedData.data);
      res.status(201).json(roster);
    } catch (error) {
      res.status(500).json({ message: "Failed to create roster position" });
    }
  });

  app.patch("/api/rosters/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const updatedRoster = await storage.updateRoster(id, req.body);
      if (!updatedRoster) {
        return res.status(404).json({ message: "Roster position not found" });
      }
      res.json(updatedRoster);
    } catch (error) {
      res.status(500).json({ message: "Failed to update roster position" });
    }
  });

  app.delete("/api/rosters/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteRoster(id);
      if (!success) {
        return res.status(404).json({ message: "Roster position not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete roster position" });
    }
  });

  // ----- PLAYER AVAILABILITY API -----

  // Get player availability for a specific game
  app.get("/api/games/:gameId/availability", async (req, res) => {
    try {
      const gameId = Number(req.params.gameId);
      const { playerAvailabilityStorage } = await import('./player-availability-storage');

      const availablePlayerIds = await playerAvailabilityStorage.getPlayerAvailabilityForGame(gameId);
      res.json({ availablePlayerIds });
    } catch (error) {
      console.error('Error fetching player availability:', error);
      res.status(500).json({ message: "Failed to fetch player availability" });
    }
  });

  // Set player availability for a specific game
  app.post("/api/games/:gameId/availability", async (req, res) => {
    try {
      const gameId = Number(req.params.gameId);
      const { availablePlayerIds } = req.body;

      if (!Array.isArray(availablePlayerIds)) {
        return res.status(400).json({ message: "availablePlayerIds must be an array" });
      }

      const { playerAvailabilityStorage } = await import('./player-availability-storage');
      const success = await playerAvailabilityStorage.setPlayerAvailabilityForGame(gameId, availablePlayerIds);

      if (success) {
        res.json({ message: "Player availability updated successfully" });
      } else {
        res.status(500).json({ message: "Failed to update player availability" });
      }
    } catch (error) {
      console.error('Error setting player availability:', error);
      res.status(500).json({ message: "Failed to set player availability" });
    }
  });

  // Update individual player availability
  app.patch("/api/games/:gameId/availability/:playerId", async (req, res) => {
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
  // Batch endpoint to get stats for multiple games at once
  app.get("/api/games/stats/batch", async (req, res) => {
    try {
      console.log("Batch endpoint received query:", req.query);
      const gameIdsParam = req.query.gameIds as string;
      console.log("Extracted gameIds parameter:", gameIdsParam);

      // More robust parameter validation - return empty object instead of error for empty requests
      if (!gameIdsParam || typeof gameIdsParam !== 'string' || gameIdsParam.trim() === '') {
        console.log("Batch stats endpoint: No game IDs provided, returning empty object");
        return res.json({});
      }

      // Parse and validate game IDs
      const gameIds = gameIdsParam.split(',')
        .map(id => {
          const parsed = parseInt(id.trim(), 10);
          return isNaN(parsed) ? null : parsed;
        })
        .filter((id): id is number => id !== null && id > 0);

      if (!gameIds.length) {
        return res.status(400).json({ error: "No valid game IDs provided" });
      }

      console.log(`Batch fetching stats for ${gameIds.length} games: ${gameIds.join(',')}`);

      // Process each game ID in parallel with error handling
      const statsPromises = gameIds.map(async (gameId) => {
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

      console.log(`Batch endpoint successfully returned stats for ${gameIds.length} games`);
      res.json(statsMap);
    } catch (error) {
      console.error(`Error in batch game stats endpoint:`, error);
      res.status(500).json({ error: "Failed to get batch game stats" });
    }
  });

  // Get all game stats for a specific game
  app.get("/api/games/:gameId/stats", async (req, res) => {
    try {
      const gameId = Number(req.params.gameId);
      const stats = await storage.getGameStatsByGame(gameId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch game stats" });
    }
  });

  // Create a new stat for a specific game (standardized endpoint)
  app.post("/api/games/:gameId/stats", async (req, res) => {
    try {
      const gameId = Number(req.params.gameId);

      // Ensure gameId matches the URL parameter
      const statData = { ...req.body, gameId };

      // Log the request body to diagnose issues
      console.log("Creating game stat with data:", statData);

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

      try {
        // Check for existing stat
        const existingStats = await storage.getGameStatsByGame(parsedData.data.gameId);
        const duplicate = existingStats.find(s =>
          s.gameId === parsedData.data.gameId &&
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
            badPass: parsedData.data.badPass,
            handlingError: parsedData.data.handlingError,
            pickUp: parsedData.data.pickUp,
            infringement: parsedData.data.infringement,
            rating: parsedData.data.rating
          });
        } else {
          // Create new stat
          stat = await storage.createGameStat(parsedData.data);
        }

        console.log("Game stat created/updated successfully:", stat);
        res.set('Cache-Control', 'no-cache');
        res.status(201).json(stat);
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

      res.json(updatedStat);
    } catch (error) {
      console.error("Failed to update game stat:", error);
      res.status(500).json({ message: "Failed to update game stat" });
    }
  });

  // Add a standard route without hyphens for game stats (for consistency)
  app.get("/api/gamestats", async (req, res) => {
    try {
      // If no game ID is provided, return an empty array
      if (!req.query.gameId) {
        return res.json([]);
      }

      const gameId = Number(req.query.gameId);
      const stats = await storage.getGameStatsByGame(gameId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch game stats" });
    }
  });

  // Batch endpoint to fetch stats for multiple games in a single request
  app.get("/api/gamestats/batch", async (req, res) => {
    try {
      const gameIdsParam = req.query.gameIds as string;

      if (!gameIdsParam) {
        return res.status(400).json({ message: "gameIds query parameter is required" });
      }

      // Parse and validate game IDs
      const gameIds = gameIdsParam.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));

      if (gameIds.length === 0) {
        return res.status(400).json({ message: "No valid game IDs provided" });
      }

      console.log(`Batch fetching stats for ${gameIds.length} games:`, gameIds);

      // Fetch stats for all games in parallel
      const statsPromises = gameIds.map(id => storage.getGameStatsByGame(id));
      const statsResults = await Promise.all(statsPromises);

      // Flatten the array of arrays into a single array of all stats
      const allStats = statsResults.flat();

      console.log(`Returning batch of ${allStats.length} stats for ${gameIds.length} games`);
      res.json(allStats);
    } catch (error) {
      console.error("Error in batch stats API:", error);
      res.status(500).json({ message: "Failed to fetch batch game stats" });
    }
  });

  app.post("/api/gamestats", async (req, res) => {
    try {
      // Log the request body to diagnose issues
      console.log("Creating/updating game stat with data:", req.body);

      // Ensure the rating is properly handled
      if (req.body.rating === undefined || req.body.rating === '') {
        req.body.rating = null;
      }

      const parsedData = insertGameStatSchema.safeParse(req.body);
      if (!parsedData.success) {
        console.error("Game stat validation error:", parsedData.error.errors);
        return res.status(400).json({ message: "Invalid game stat data", errors: parsedData.error.errors });
      }

      // Validate quarter (1-4)
      if (parsedData.data.quarter < 1 || parsedData.data.quarter > 4) {
        return res.status(400).json({ message: "Quarter must be between 1 and 4" });
      }

      // Check if a stat already exists for this game/position/quarter
      const existingStats = await storage.getGameStatsByGame(parsedData.data.gameId);
      const existingStat = existingStats.find(s =>
        s.position === parsedData.data.position &&
        s.quarter === parsedData.data.quarter
      );

      // Validate position is from allowed set
      if (!POSITIONS.includes(parsedData.data.position as any)) {
        console.error("Invalid position:", parsedData.data.position);
        return res.status(400).json({ message: "Invalid position value" });
      }

      try {
        // First, try to find an existing stat record
        const existingStats = await storage.getGameStatsByGame(parsedData.data.gameId);
        console.log(`Found ${existingStats.length} existing stats for game ${parsedData.data.gameId}`);

        const duplicate = existingStats.find(s =>
          s.gameId === parsedData.data.gameId &&
          s.position === parsedData.data.position &&
          s.quarter === parsedData.data.quarter
        );

        let stat;

        if (duplicate) {
          // Update existing stat instead of creating new one to avoid unique constraint violation
          console.log(`Updating existing stat ID ${duplicate.id} instead of creating duplicate`);
          try {
            stat = await storage.updateGameStat(duplicate.id, {
              goalsFor: parsedData.data.goalsFor,
              goalsAgainst: parsedData.data.goalsAgainst,
              missedGoals: parsedData.data.missedGoals,
              rebounds: parsedData.data.rebounds,
              intercepts: parsedData.data.intercepts,
              badPass: parsedData.data.badPass,
              handlingError: parsedData.data.handlingError,
              pickUp: parsedData.data.pickUp,
              infringement: parsedData.data.infringement,
              rating: parsedData.data.rating
            });
          } catch (updateError) {
            console.error("Error updating existing stat:", updateError);
            throw updateError;
          }
        } else {
          // Try to insert directly via SQL query to avoid ORM issues
          try {
            console.log("Creating new game stat via direct SQL");
            const result = await db.execute(sql`
              INSERT INTO game_stats (
                game_id, position, quarter, goals_for, goals_against,
                missed_goals, rebounds, intercepts, bad_pass,
                handling_error, pick_up, infringement, rating
              )
              VALUES (
                ${parsedData.data.gameId},
                ${parsedData.data.position},
                ${parsedData.data.quarter},
                ${parsedData.data.goalsFor || 0},
                ${parsedData.data.goalsAgainst || 0},
                ${parsedData.data.missedGoals || 0},
                ${parsedData.data.rebounds || 0},
                ${parsedData.data.intercepts || 0},
                ${parsedData.data.badPass || 0},
                ${parsedData.data.handlingError || 0},
                ${parsedData.data.pickUp || 0},
                ${parsedData.data.infringement || 0},
                ${parsedData.data.rating === undefined ? null : parsedData.data.rating}
              )
              RETURNING *
            `);
            console.log("Insert result:", result);

            // The result should contain the newly created record
            if (result.length > 0) {
              stat = result[0];
            } else {
              throw new Error("Failed to insert game stat - no rows returned");
            }
          } catch (insertError) {
            console.error("Error creating new game stat via SQL:", insertError);

            // Try one more time with the regular ORM method
            try {
              stat = await storage.createGameStat(parsedData.data);
            } catch (ormError) {
              console.error("ORM method also failed:", ormError);
              throw ormError;
            }
          }
        }

        // Log the successfully created/updated stat
        console.log("Game stat created/updated successfully:", stat);

        // Invalidate any cached data for this game
        // This ensures fresh data is fetched on next request
        res.set('Cache-Control', 'no-cache');

        res.status(201).json(stat);
      } catch (innerError) {
        console.error("Inner error handling game stats:", innerError);
        throw innerError;
      }
    } catch (error) {
      console.error("Failed to create game stat:", error);
      res.status(500).json({ message: "Failed to create game stat" });
    }
  });

  app.patch("/api/gamestats/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const updatedStat = await storage.updateGameStat(id, req.body);
      if (!updatedStat) {
        return res.status(404).json({ message: "Game stat not found" });
      }

      // Invalidate cache for this game
      res.set('Cache-Control', 'no-cache');
      console.log(`Updated game stat for game ${updatedStat.gameId}, cache invalidated`);

      res.json(updatedStat);
    } catch (error) {
      res.status(500).json({ message: "Failed to update game stat" });
    }
  });

  app.delete("/api/gamestats/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteGameStat(id);
      if (!success) {
        return res.status(404).json({ message: "Game stat not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete game stat" });
    }
  });

  // ----- SEASONS API -----

  // Get all seasons
  app.get('/api/seasons', async (req, res) => {
    try {
      const allSeasons = await storage.getSeasons();
      res.json(allSeasons);
    } catch (error) {
      console.error('Error fetching seasons:', error);
      res.status(500).json({ message: 'Failed to fetch seasons' });
    }
  });

  // Get active season
  app.get('/api/seasons/active', async (req, res) => {
    try {
      const activeSeason = await storage.getActiveSeason();
      if (!activeSeason) {
        return res.status(404).json({ message: 'No active season found' });
      }
      res.json(activeSeason);
    } catch (error) {
      console.error('Error fetching active season:', error);
      res.status(500).json({ message: 'Failed to fetch active season' });
    }
  });

  // Get season by ID
  app.get('/api/seasons/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const season = await storage.getSeason(id);
      if (!season) {
        return res.status(404).json({ message: 'Season not found' });
      }
      res.json(season);
    } catch (error) {
      console.error(`Error fetching season ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to fetch season' });
    }
  });

  // Create season
  app.post('/api/seasons', async (req, res) => {
    try {
      const seasonData = insertSeasonSchema.parse(req.body);
      const season = await storage.createSeason(seasonData);
      res.status(201).json(season);
    } catch (error) {
      console.error('Error creating season:', error);
      res.status(400).json({ message: 'Invalid season data' });
    }
  });

  // Update season
  app.patch('/api/seasons/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // Allow partial updates
      const seasonData = req.body;
      const updatedSeason = await storage.updateSeason(id, seasonData);
      if (!updatedSeason) {
        return res.status(404).json({ message: 'Season not found' });
      }
      res.json(updatedSeason);
    } catch (error) {
      console.error(`Error updating season ${req.params.id}:`, error);
      res.status(400).json({ message: 'Invalid season data' });
    }
  });

  // Set active season
  app.post('/api/seasons/:id/activate', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const season = await storage.setActiveSeason(id);
      if (!season) {
        return res.status(404).json({ message: 'Season not found' });
      }
      res.json(season);
    } catch (error) {
      console.error(`Error activating season ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to activate season' });
    }
  });

  // Delete season
  app.delete('/api/seasons/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const activeSeason = await storage.getActiveSeason();

      // Prevent deleting the active season
      if (activeSeason && activeSeason.id === id) {
        return res.status(400).json({
          message: 'Cannot delete the active season. Activate another season first.'
        });
      }

      const deleted = await storage.deleteSeason(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Season not found' });
      }
      res.status(204).end();
    } catch (error) {
      console.error(`Error deleting season ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to delete season' });
    }
  });

  // Get games for a specific season
  app.get('/api/seasons/:id/games', async (req, res) => {
    try {
      const seasonId = parseInt(req.params.id);
      const games = await storage.getGamesBySeason(seasonId);
      res.json(games);
    } catch (error) {
      console.error(`Error fetching games for season ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to fetch games for season' });
    }
  });

    app.use("/api/game-statuses", gameStatusRoutes);

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}