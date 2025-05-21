import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { db } from "./db";
import { 
  insertPlayerSchema, importPlayerSchema,
  insertOpponentSchema, importOpponentSchema,
  insertGameSchema, importGameSchema,
  insertRosterSchema, importRosterSchema,
  insertGameStatSchema, importGameStatSchema,
  players, opponents, games, rosters, gameStats,
  POSITIONS
} from "@shared/schema";
import { fixGameStatsSchema } from "./fixDbSchema";
import { setPositionsForStats } from "./migrations/setPositionsForStats";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api
  
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
  
  // Fix game stats schema if needed
  app.post("/api/fix-game-stats-schema", async (req, res) => {
    try {
      const result = await fixGameStatsSchema();
      res.status(200).json(result);
    } catch (error) {
      console.error("Error fixing game stats schema:", error);
      res.status(500).json({ 
        success: false, 
        message: `Schema fix failed: ${error}` 
      });
    }
  });
  
  // Add position data to existing stats
  app.post("/api/add-positions-to-stats", async (req, res) => {
    try {
      const result = await setPositionsForStats();
      res.status(200).json(result);
    } catch (error) {
      console.error("Error adding positions to stats:", error);
      res.status(500).json({ 
        success: false, 
        message: `Position migration failed: ${error}` 
      });
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

  app.post("/api/players", async (req, res) => {
    try {
      // Check if we're doing an import operation (with ID) or regular create
      const hasId = req.body.id !== undefined;
      
      // Use the appropriate schema based on operation type
      const schema = hasId ? importPlayerSchema : insertPlayerSchema;
      const parsedData = schema.safeParse(req.body);
      
      if (!parsedData.success) {
        return res.status(400).json({ message: "Invalid player data", errors: parsedData.error.errors });
      }
      
      // For new players, ensure they have a unique avatar color
      const playerData = parsedData.data;
      
      // If no specific avatar color is provided, generate one (with more inclusive check for empty strings and null)
      if (!playerData.avatarColor || playerData.avatarColor === 'auto' || playerData.avatarColor === '') {
        // Get existing player colors to avoid duplicates
        const existingPlayers = await storage.getPlayers();
        const usedColors = existingPlayers.map(p => p.avatarColor).filter(Boolean);
        
        // Define a set of visually distinct colors
        const availableColors = [
          'bg-blue-600', 'bg-purple-600', 'bg-green-600', 'bg-red-600', 
          'bg-orange-600', 'bg-yellow-600', 'bg-pink-600', 'bg-teal-600',
          'bg-indigo-600', 'bg-cyan-600', 'bg-amber-600', 'bg-lime-600',
          'bg-emerald-600', 'bg-sky-600', 'bg-violet-600', 'bg-fuchsia-600',
          'bg-rose-600', 'bg-blue-700', 'bg-purple-700', 'bg-green-700',
          'bg-red-700', 'bg-orange-700', 'bg-yellow-700', 'bg-pink-700'
        ];
        
        // Find an unused color
        const unusedColors = availableColors.filter(color => !usedColors.includes(color));
        
        // If we have unused colors, pick one; otherwise select a random one
        if (unusedColors.length > 0) {
          playerData.avatarColor = unusedColors[Math.floor(Math.random() * unusedColors.length)];
        } else {
          playerData.avatarColor = availableColors[Math.floor(Math.random() * availableColors.length)];
        }
      }
      
      // Pass the enhanced data to the storage layer
      const player = await storage.createPlayer(playerData);
      res.status(201).json(player);
    } catch (error) {
      console.error("Failed to create player:", error);
      res.status(500).json({ message: "Failed to create player" });
    }
  });

  app.patch("/api/players/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      
      // Get the update data
      const updateData = req.body;
      
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
      
      const updatedPlayer = await storage.updatePlayer(id, updateData);
      if (!updatedPlayer) {
        return res.status(404).json({ message: "Player not found" });
      }
      res.json(updatedPlayer);
    } catch (error) {
      res.status(500).json({ message: "Failed to update player" });
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
      console.log("Available games:", games.map(g => ({ id: g.id, date: g.date, completed: g.completed })));
      
      res.json(games);
    } catch (error) {
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
      
      // If we're updating a game to be a BYE round, allow opponentId to be null
      if (req.body.isBye === true) {
        // Make opponentId null if updating to BYE game
        req.body.opponentId = null;
      } else if (req.body.isBye === false && req.body.opponentId === null) {
        // Don't allow non-BYE games with null opponent
        return res.status(400).json({ message: "Opponent is required for non-BYE games" });
      }
      
      const updatedGame = await storage.updateGame(id, req.body);
      if (!updatedGame) {
        return res.status(404).json({ message: "Game not found" });
      }
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

  // ----- GAME STATS API -----
  app.get("/api/games/:gameId/stats", async (req, res) => {
    try {
      const gameId = Number(req.params.gameId);
      const stats = await storage.getGameStatsByGame(gameId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch game stats" });
    }
  });

  app.post("/api/gamestats", async (req, res) => {
    try {
      // Log the request body to diagnose issues
      console.log("Creating game stat with data:", req.body);
      
      const parsedData = insertGameStatSchema.safeParse(req.body);
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
      
      // Check if a stat for this position and quarter already exists
      const existingStats = await storage.getGameStatsByGame(parsedData.data.gameId);
      const duplicate = existingStats.find(s => 
        s.gameId === parsedData.data.gameId && 
        s.position === parsedData.data.position && 
        s.quarter === parsedData.data.quarter
      );
      
      let stat;
      
      if (duplicate) {
        // Update existing stat instead of creating new one to avoid unique constraint violation
        console.log(`Updating existing stat ID ${duplicate.id} instead of creating duplicate`);
        stat = await storage.updateGameStat(duplicate.id, parsedData.data);
      } else {
        // Create new stat
        stat = await storage.createGameStat(parsedData.data);
      }
      
      // Log the successfully created/updated stat
      console.log("Game stat created/updated successfully:", stat);
      res.status(201).json(stat);
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

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
