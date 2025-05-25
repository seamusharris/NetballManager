import {
  users, type User, type InsertUser,
  players, type Player, type InsertPlayer,
  opponents, type Opponent, type InsertOpponent,
  games, type Game, type InsertGame,
  rosters, type Roster, type InsertRoster,
  gameStats, type GameStat, type InsertGameStat,
  seasons, type Season, type InsertSeason,
  playerSeasons,
  type Position
} from "../shared/schema";
import { db } from "./db";
import { eq, desc, and, isNull, inArray, sql } from "drizzle-orm";

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Player methods
  getPlayers(): Promise<Player[]>;
  getPlayersBySeason(seasonId: number): Promise<Player[]>;
  getPlayer(id: number): Promise<Player | undefined>;
  createPlayer(player: InsertPlayer, seasonIds?: number[]): Promise<Player>;
  updatePlayer(id: number, player: Partial<InsertPlayer>, seasonIds?: number[]): Promise<Player | undefined>;
  deletePlayer(id: number): Promise<boolean>;
  
  // Player-Season relationship methods
  getPlayerSeasons(playerId: number): Promise<number[]>; // Returns array of season IDs
  addPlayerToSeason(playerId: number, seasonId: number): Promise<boolean>;
  removePlayerFromSeason(playerId: number, seasonId: number): Promise<boolean>;
  
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
  
  async getPlayersBySeason(seasonId: number): Promise<Player[]> {
    // Query players that are associated with the given season
    const result = await db
      .select({
        player: players
      })
      .from(playerSeasons)
      .where(eq(playerSeasons.seasonId, seasonId))
      .innerJoin(players, eq(playerSeasons.playerId, players.id));
    
    // Map to return just the player objects
    return result.map(row => row.player);
  }

  async getPlayer(id: number): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.id, id));
    return player || undefined;
  }

  async createPlayer(insertPlayer: InsertPlayer, seasonIds?: number[]): Promise<Player> {
    // Check if a specific avatar color was provided (for import/export)
    let avatarColor = insertPlayer.avatarColor;
    
    // Create the player with all properties
    const [player] = await db
      .insert(players)
      .values({
        displayName: insertPlayer.displayName,
        firstName: insertPlayer.firstName,
        lastName: insertPlayer.lastName,
        dateOfBirth: insertPlayer.dateOfBirth || null,
        positionPreferences: insertPlayer.positionPreferences as any, // Cast to any to bypass TS checking
        active: insertPlayer.active !== undefined ? insertPlayer.active : true,
        // Include the avatar color if provided
        ...(avatarColor ? { avatarColor } : {})
      })
      .returning();
    
    // If no color was provided, generate one deterministically
    if (!avatarColor) {
      // This matches the original color mapping used in the application
      // Extended with additional colors to ensure new players get distinct colors
      const avatarColors = [
        'bg-blue-600',    // Blue
        'bg-purple-600',  // Purple
        'bg-pink-600',    // Pink
        'bg-green-600',   // Green
        'bg-accent',      // Accent (teal)
        'bg-secondary',   // Secondary
        'bg-orange-500',  // Orange
        'bg-primary',     // Primary
        'bg-red-500',     // Red
        'bg-yellow-600',  // Yellow
        'bg-indigo-600',  // Indigo
        'bg-cyan-600',    // Cyan
        'bg-amber-600',   // Amber
        'bg-lime-600',    // Lime
        'bg-emerald-600', // Emerald
        'bg-violet-600',  // Violet
        'bg-fuchsia-600', // Fuchsia
        'bg-rose-600',    // Rose
      ];
      
      // Use the same deterministic assignment based on player ID
      avatarColor = avatarColors[player.id % avatarColors.length];
      
      // Update the player with the generated avatar color
      const [updatedPlayer] = await db
        .update(players)
        .set({ avatarColor })
        .where(eq(players.id, player.id))
        .returning();
      
      player.avatarColor = updatedPlayer.avatarColor;
    }
    
    // Add player to selected seasons if provided
    if (seasonIds && seasonIds.length > 0) {
      // Create player-season entries
      const playerSeasonEntries = seasonIds.map(seasonId => ({
        playerId: player.id,
        seasonId
      }));
      
      try {
        await db.insert(playerSeasons).values(playerSeasonEntries);
      } catch (error) {
        console.error('Failed to add player to seasons:', error);
      }
    } else {
      // If no seasons provided, add to active season by default
      const activeSeason = await this.getActiveSeason();
      if (activeSeason) {
        try {
          await db.insert(playerSeasons).values({
            playerId: player.id,
            seasonId: activeSeason.id
          });
        } catch (error) {
          console.error('Failed to add player to active season:', error);
        }
      }
    }
    
    return player;
  }

  async updatePlayer(id: number, updatePlayer: Partial<InsertPlayer>, seasonIds?: number[]): Promise<Player | undefined> {
    // Handle type-safe update to avoid TS errors
    const updateData: Record<string, any> = {};
    
    if (updatePlayer.displayName !== undefined) updateData.displayName = updatePlayer.displayName;
    if (updatePlayer.firstName !== undefined) updateData.firstName = updatePlayer.firstName;
    if (updatePlayer.lastName !== undefined) updateData.lastName = updatePlayer.lastName;
    if (updatePlayer.dateOfBirth !== undefined) updateData.dateOfBirth = updatePlayer.dateOfBirth;
    if (updatePlayer.active !== undefined) updateData.active = updatePlayer.active;
    if (updatePlayer.positionPreferences !== undefined) updateData.positionPreferences = updatePlayer.positionPreferences;
    if (updatePlayer.avatarColor !== undefined) updateData.avatarColor = updatePlayer.avatarColor;
    
    const [updated] = await db
      .update(players)
      .set(updateData)
      .where(eq(players.id, id))
      .returning();
    
    // Update player seasons if provided
    if (seasonIds && updated) {
      // First remove existing season associations
      await db.delete(playerSeasons).where(eq(playerSeasons.playerId, id));
      
      // Then add new season associations
      if (seasonIds.length > 0) {
        const playerSeasonEntries = seasonIds.map(seasonId => ({
          playerId: id,
          seasonId
        }));
        
        try {
          await db.insert(playerSeasons).values(playerSeasonEntries);
        } catch (error) {
          console.error('Failed to update player seasons:', error);
        }
      }
    }
    
    return updated || undefined;
  }

  async deletePlayer(id: number): Promise<boolean> {
    // Player-season associations will be deleted automatically due to CASCADE constraint
    const result = await db
      .delete(players)
      .where(eq(players.id, id))
      .returning({ id: players.id });
    return result.length > 0;
  }
  
  // Player-Season relationship methods
  async getPlayerSeasons(playerId: number): Promise<number[]> {
    const result = await db
      .select({ seasonId: playerSeasons.seasonId })
      .from(playerSeasons)
      .where(eq(playerSeasons.playerId, playerId));
    
    return result.map(row => row.seasonId);
  }
  
  async addPlayerToSeason(playerId: number, seasonId: number): Promise<boolean> {
    try {
      await db.insert(playerSeasons).values({ playerId, seasonId });
      return true;
    } catch (error) {
      console.error('Failed to add player to season:', error);
      return false;
    }
  }
  
  async removePlayerFromSeason(playerId: number, seasonId: number): Promise<boolean> {
    const result = await db
      .delete(playerSeasons)
      .where(
        and(
          eq(playerSeasons.playerId, playerId),
          eq(playerSeasons.seasonId, seasonId)
        )
      );
    
    return result.count > 0;
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