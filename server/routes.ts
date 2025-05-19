import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertPlayerSchema, 
  insertOpponentSchema, 
  insertGameSchema, 
  insertRosterSchema, 
  insertGameStatSchema,
  POSITIONS
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

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
      const parsedData = insertPlayerSchema.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({ message: "Invalid player data", errors: parsedData.error.errors });
      }
      
      const player = await storage.createPlayer(parsedData.data);
      res.status(201).json(player);
    } catch (error) {
      res.status(500).json({ message: "Failed to create player" });
    }
  });

  app.patch("/api/players/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const updatedPlayer = await storage.updatePlayer(id, req.body);
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
      const parsedData = insertOpponentSchema.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({ message: "Invalid opponent data", errors: parsedData.error.errors });
      }
      
      const opponent = await storage.createOpponent(parsedData.data);
      res.status(201).json(opponent);
    } catch (error) {
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

  app.post("/api/games", async (req, res) => {
    try {
      // Create a custom validation schema that allows opponentId to be null for BYE games
      const gameValidationSchema = z.object({
        date: z.string().min(1, "Date is required"),
        time: z.string().min(1, "Time is required"),
        opponentId: z.number().nullable(), // Allow null for BYE games
        completed: z.boolean().default(false),
        isBye: z.boolean().default(false)
      }).refine(data => {
        // If it's a BYE round, opponentId can be null
        if (data.isBye) return true;
        // If not a BYE round, opponentId is required
        return data.opponentId !== null;
      }, {
        message: "Opponent is required for non-BYE games",
        path: ["opponentId"]
      });
      
      const parsedData = gameValidationSchema.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({ message: "Invalid game data", errors: parsedData.error.errors });
      }
      
      const game = await storage.createGame(parsedData.data);
      res.status(201).json(game);
    } catch (error) {
      console.error("Game creation error:", error);
      res.status(500).json({ message: "Failed to create game" });
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
      const parsedData = insertGameStatSchema.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({ message: "Invalid game stat data", errors: parsedData.error.errors });
      }
      
      // Validate quarter (1-4)
      if (parsedData.data.quarter < 1 || parsedData.data.quarter > 4) {
        return res.status(400).json({ message: "Quarter must be between 1 and 4" });
      }
      
      const stat = await storage.createGameStat(parsedData.data);
      res.status(201).json(stat);
    } catch (error) {
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
