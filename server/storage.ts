import {
  users, type User, type InsertUser,
  players, type Player, type InsertPlayer,
  opponents, type Opponent, type InsertOpponent,
  games, type Game, type InsertGame,
  rosters, type Roster, type InsertRoster,
  gameStats, type GameStat, type InsertGameStat,
  seasons, type Season, type InsertSeason,
  type Position
} from "../shared/schema";
import { db } from "./db";
import { eq, desc, and, isNull } from "drizzle-orm";

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Player methods
  getPlayers(): Promise<Player[]>;
  getPlayer(id: number): Promise<Player | undefined>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayer(id: number, player: Partial<InsertPlayer>): Promise<Player | undefined>;
  deletePlayer(id: number): Promise<boolean>;
  
  // Opponent methods
  getOpponents(): Promise<Opponent[]>;
  getOpponent(id: number): Promise<Opponent | undefined>;
  createOpponent(opponent: InsertOpponent): Promise<Opponent>;
  updateOpponent(id: number, opponent: Partial<InsertOpponent>): Promise<Opponent | undefined>;
  deleteOpponent(id: number): Promise<boolean>;
  
  // Game methods
  getGames(): Promise<Game[]>;
  getGamesBySeason(seasonId: number): Promise<Game[]>;
  getGame(id: number): Promise<Game | undefined>;
  createGame(game: InsertGame): Promise<Game>;
  updateGame(id: number, game: Partial<InsertGame>): Promise<Game | undefined>;
  deleteGame(id: number): Promise<boolean>;
  
  // Roster methods
  getRostersByGame(gameId: number): Promise<Roster[]>;
  getRoster(id: number): Promise<Roster | undefined>;
  createRoster(roster: InsertRoster): Promise<Roster>;
  updateRoster(id: number, roster: Partial<InsertRoster>): Promise<Roster | undefined>;
  deleteRoster(id: number): Promise<boolean>;
  deleteRostersByGame(gameId: number): Promise<boolean>;
  
  // Game Stats methods
  getGameStatsByGame(gameId: number): Promise<GameStat[]>;
  getGameStat(id: number): Promise<GameStat | undefined>;
  createGameStat(gameStat: InsertGameStat): Promise<GameStat>;
  updateGameStat(id: number, gameStat: Partial<InsertGameStat>): Promise<GameStat | undefined>;
  deleteGameStat(id: number): Promise<boolean>;
  deleteGameStatsByGame(gameId: number): Promise<boolean>;
  
  // Season methods
  getSeasons(): Promise<Season[]>;
  getSeason(id: number): Promise<Season | undefined>;
  getActiveSeason(): Promise<Season | undefined>;
  createSeason(season: InsertSeason): Promise<Season>;
  updateSeason(id: number, season: Partial<InsertSeason>): Promise<Season | undefined>;
  setActiveSeason(id: number): Promise<Season | undefined>;
  deleteSeason(id: number): Promise<boolean>;
  
  // Games by season
  getGamesBySeason(seasonId: number): Promise<Game[]>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Player methods
  async getPlayers(): Promise<Player[]> {
    return await db.select().from(players);
  }

  async getPlayer(id: number): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.id, id));
    return player || undefined;
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    // Get existing player colors to avoid duplicates
    const existingPlayers = await this.getPlayers();
    const usedColors = existingPlayers.map(p => p.avatarColor).filter(Boolean);
    
    // Define our color palette for players
    const avatarColors = [
      'bg-blue-600',    // Blue
      'bg-purple-600',  // Purple
      'bg-pink-600',    // Pink
      'bg-green-600',   // Green
      'bg-teal-600',    // Teal
      'bg-indigo-600',  // Indigo
      'bg-orange-500',  // Orange
      'bg-red-500',     // Red
      'bg-yellow-600',  // Yellow
      'bg-cyan-600',    // Cyan
      'bg-amber-600',   // Amber
      'bg-lime-600',    // Lime
      'bg-emerald-600', // Emerald
      'bg-violet-600',  // Violet
      'bg-fuchsia-600', // Fuchsia
      'bg-rose-600',    // Rose
      'bg-blue-700',    // Dark Blue
      'bg-purple-700',  // Dark Purple
      'bg-green-700',   // Dark Green
      'bg-red-700',     // Dark Red
    ];
    
    // Determine the avatar color
    let avatarColor: string;
    
    // If specific color provided and not "auto", use it
    if (insertPlayer.avatarColor && 
        insertPlayer.avatarColor !== 'auto' && 
        insertPlayer.avatarColor !== '') {
      avatarColor = insertPlayer.avatarColor;
    } else {
      // Otherwise, pick an unused color or random one if all are used
      const unusedColors = avatarColors.filter(color => !usedColors.includes(color));
      
      if (unusedColors.length > 0) {
        avatarColor = unusedColors[Math.floor(Math.random() * unusedColors.length)];
      } else {
        avatarColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];
      }
    }
    
    console.log("Creating player with avatar color:", avatarColor);
    
    // Prepare the player data with guaranteed avatar color
    const playerData = {
      displayName: insertPlayer.displayName,
      firstName: insertPlayer.firstName,
      lastName: insertPlayer.lastName,
      dateOfBirth: insertPlayer.dateOfBirth || null,
      positionPreferences: insertPlayer.positionPreferences as any, // Cast to any to bypass TS checking
      active: insertPlayer.active !== undefined ? insertPlayer.active : true,
      avatarColor // Always include avatar color
    };
    
    // Create the player with all properties including avatar color
    const [player] = await db
      .insert(players)
      .values(playerData)
      .returning();
    
    return player;
  }

  async updatePlayer(id: number, updatePlayer: Partial<InsertPlayer>): Promise<Player | undefined> {
    try {
      console.log("Storage: Updating player with ID:", id);
      console.log("Storage: Update data received:", JSON.stringify(updatePlayer, null, 2));
      
      // Handle type-safe update to avoid TS errors
      const updateData: Record<string, any> = {};
      
      if (updatePlayer.displayName !== undefined) updateData.displayName = updatePlayer.displayName;
      if (updatePlayer.firstName !== undefined) updateData.firstName = updatePlayer.firstName;
      if (updatePlayer.lastName !== undefined) updateData.lastName = updatePlayer.lastName;
      if (updatePlayer.dateOfBirth !== undefined) updateData.dateOfBirth = updatePlayer.dateOfBirth;
      if (updatePlayer.active !== undefined) updateData.active = updatePlayer.active === true;
      
      // Ensure position preferences is always an array
      if (updatePlayer.positionPreferences !== undefined) {
        if (Array.isArray(updatePlayer.positionPreferences)) {
          updateData.positionPreferences = updatePlayer.positionPreferences;
        } else if (typeof updatePlayer.positionPreferences === 'string') {
          // Handle case where it might come as a string
          updateData.positionPreferences = [updatePlayer.positionPreferences];
        } else {
          // Default to empty array if invalid
          updateData.positionPreferences = [];
        }
      }
      
      if (updatePlayer.avatarColor !== undefined) updateData.avatarColor = updatePlayer.avatarColor;
      
      console.log("Storage: Processed update data:", JSON.stringify(updateData, null, 2));
      
      // Only perform update if there are fields to update
      if (Object.keys(updateData).length === 0) {
        console.log("Storage: No valid update fields provided for player", id);
        // Return the existing player without updating
        const existingPlayer = await this.getPlayer(id);
        return existingPlayer;
      }
      
      const [updated] = await db
        .update(players)
        .set(updateData)
        .where(eq(players.id, id))
        .returning();
      
      console.log("Storage: Player update successful:", updated ? "Yes" : "No");
      return updated || undefined;
    } catch (error) {
      console.error("Storage: Error updating player:", error);
      throw error;
    }
  }

  async deletePlayer(id: number): Promise<boolean> {
    const result = await db
      .delete(players)
      .where(eq(players.id, id))
      .returning({ id: players.id });
    return result.length > 0;
  }

  // Opponent methods
  async getOpponents(): Promise<Opponent[]> {
    return await db.select().from(opponents);
  }

  async getOpponent(id: number): Promise<Opponent | undefined> {
    const [opponent] = await db.select().from(opponents).where(eq(opponents.id, id));
    return opponent || undefined;
  }

  async createOpponent(insertOpponent: InsertOpponent): Promise<Opponent> {
    const [opponent] = await db
      .insert(opponents)
      .values(insertOpponent)
      .returning();
    return opponent;
  }

  async updateOpponent(id: number, updateOpponent: Partial<InsertOpponent>): Promise<Opponent | undefined> {
    const [updated] = await db
      .update(opponents)
      .set(updateOpponent)
      .where(eq(opponents.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteOpponent(id: number): Promise<boolean> {
    const result = await db
      .delete(opponents)
      .where(eq(opponents.id, id))
      .returning({ id: opponents.id });
    return result.length > 0;
  }

  // Game methods
  async getGames(): Promise<Game[]> {
    return await db.select().from(games);
  }

  async getGame(id: number): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game || undefined;
  }

  async createGame(insertGame: InsertGame): Promise<Game> {
    const [game] = await db
      .insert(games)
      .values(insertGame)
      .returning();
    return game;
  }

  async updateGame(id: number, updateGame: Partial<InsertGame>): Promise<Game | undefined> {
    const [updated] = await db
      .update(games)
      .set(updateGame)
      .where(eq(games.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteGame(id: number): Promise<boolean> {
    // Delete related rosters and game stats first
    await this.deleteRostersByGame(id);
    await this.deleteGameStatsByGame(id);
    
    const result = await db
      .delete(games)
      .where(eq(games.id, id))
      .returning({ id: games.id });
    return result.length > 0;
  }

  // Roster methods
  async getRostersByGame(gameId: number): Promise<Roster[]> {
    return await db.select().from(rosters).where(eq(rosters.gameId, gameId));
  }

  async getRoster(id: number): Promise<Roster | undefined> {
    const [roster] = await db.select().from(rosters).where(eq(rosters.id, id));
    return roster || undefined;
  }

  async createRoster(insertRoster: InsertRoster): Promise<Roster> {
    // Ensure position is one of the valid positions
    const validPositions = ['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'];
    const position = validPositions.includes(insertRoster.position) 
      ? insertRoster.position as Position 
      : 'GS'; // Default to GS if invalid position
      
    const [roster] = await db
      .insert(rosters)
      .values({
        gameId: insertRoster.gameId,
        quarter: insertRoster.quarter,
        position: position,
        playerId: insertRoster.playerId
      })
      .returning();
    return roster;
  }

  async updateRoster(id: number, updateRoster: Partial<InsertRoster>): Promise<Roster | undefined> {
    // Handle type-safe update to avoid TS errors
    const updateData: Record<string, any> = {};
    
    if (updateRoster.gameId !== undefined) updateData.gameId = updateRoster.gameId;
    if (updateRoster.quarter !== undefined) updateData.quarter = updateRoster.quarter;
    if (updateRoster.playerId !== undefined) updateData.playerId = updateRoster.playerId;
    
    // Special handling for position to ensure it's a valid enum value
    if (updateRoster.position !== undefined) {
      const validPositions = ['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'];
      if (validPositions.includes(updateRoster.position)) {
        updateData.position = updateRoster.position;
      }
    }
    
    const [updated] = await db
      .update(rosters)
      .set(updateData)
      .where(eq(rosters.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteRoster(id: number): Promise<boolean> {
    const result = await db
      .delete(rosters)
      .where(eq(rosters.id, id))
      .returning({ id: rosters.id });
    return result.length > 0;
  }

  async deleteRostersByGame(gameId: number): Promise<boolean> {
    const result = await db
      .delete(rosters)
      .where(eq(rosters.gameId, gameId))
      .returning({ id: rosters.id });
    return result.length > 0;
  }

  // Game Stats methods
  async getGameStatsByGame(gameId: number): Promise<GameStat[]> {
    return await db.select().from(gameStats).where(eq(gameStats.gameId, gameId));
  }

  async getGameStat(id: number): Promise<GameStat | undefined> {
    const [gameStat] = await db.select().from(gameStats).where(eq(gameStats.id, id));
    return gameStat || undefined;
  }

  async createGameStat(insertGameStat: InsertGameStat): Promise<GameStat> {
    const [gameStat] = await db
      .insert(gameStats)
      .values(insertGameStat)
      .returning();
    return gameStat;
  }

  async updateGameStat(id: number, updateGameStat: Partial<InsertGameStat>): Promise<GameStat | undefined> {
    const [updated] = await db
      .update(gameStats)
      .set(updateGameStat)
      .where(eq(gameStats.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteGameStat(id: number): Promise<boolean> {
    const result = await db
      .delete(gameStats)
      .where(eq(gameStats.id, id))
      .returning({ id: gameStats.id });
    return result.length > 0;
  }

  async deleteGameStatsByGame(gameId: number): Promise<boolean> {
    const result = await db
      .delete(gameStats)
      .where(eq(gameStats.gameId, gameId))
      .returning({ id: gameStats.id });
    return result.length > 0;
  }
  
  // Season methods
  async getSeasons(): Promise<Season[]> {
    return await db.select().from(seasons).orderBy(desc(seasons.year), seasons.displayOrder);
  }

  async getSeason(id: number): Promise<Season | undefined> {
    const [season] = await db.select().from(seasons).where(eq(seasons.id, id));
    return season || undefined;
  }

  async getActiveSeason(): Promise<Season | undefined> {
    const [season] = await db.select().from(seasons).where(eq(seasons.isActive, true));
    return season || undefined;
  }

  async createSeason(insertSeason: InsertSeason): Promise<Season> {
    const [season] = await db.insert(seasons).values(insertSeason).returning();
    return season;
  }

  async updateSeason(id: number, updateSeason: Partial<InsertSeason>): Promise<Season | undefined> {
    const [season] = await db
      .update(seasons)
      .set(updateSeason)
      .where(eq(seasons.id, id))
      .returning();
    return season || undefined;
  }

  async setActiveSeason(id: number): Promise<Season | undefined> {
    // First deactivate all seasons
    await db.update(seasons).set({ isActive: false });
    
    // Then activate the specified season
    const [season] = await db
      .update(seasons)
      .set({ isActive: true })
      .where(eq(seasons.id, id))
      .returning();
      
    return season || undefined;
  }

  async deleteSeason(id: number): Promise<boolean> {
    const result = await db.delete(seasons).where(eq(seasons.id, id));
    return result.rowCount > 0;
  }
  
  // Games by season
  async getGamesBySeason(seasonId: number): Promise<Game[]> {
    return await db.select().from(games).where(eq(games.seasonId, seasonId));
  }
}

// Export a single instance of DatabaseStorage
export const storage = new DatabaseStorage();

// Add some sample data for demonstration if none exists
async function initSampleData() {
  // Check if we have any opponents
  const opponentList = await storage.getOpponents();
  
  if (opponentList.length === 0) {
    // Add sample opponents
    await storage.createOpponent({
      teamName: "Thunder Netball",
      primaryContact: "Jane Smith",
      contactInfo: "coach@thundernetball.com"
    });
    
    await storage.createOpponent({
      teamName: "Lightning Strikers",
      primaryContact: "Mike Johnson",
      contactInfo: "mike@lightningstrikers.com"
    });
    
    await storage.createOpponent({
      teamName: "Phoenix Jets",
      primaryContact: "Sarah Williams",
      contactInfo: "coach@phoenixjets.com"
    });
  }
}

// Initialize sample data
initSampleData().catch(console.error);