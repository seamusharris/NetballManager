import { users, type User, type InsertUser } from "@shared/schema";
import { players, type Player, type InsertPlayer } from "@shared/schema";
import { opponents, type Opponent, type InsertOpponent } from "@shared/schema";
import { games, type Game, type InsertGame } from "@shared/schema";
import { rosters, type Roster, type InsertRoster } from "@shared/schema";
import { gameStats, type GameStat, type InsertGameStat } from "@shared/schema";
import { Position } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { gameStatuses, type GameStatus } from "@shared/schema";
import { seasons } from "@shared/schema";
import { sql } from "drizzle-orm";

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
}

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
    const [player] = await db
      .insert(players)
      .values({
        ...insertPlayer,
        dateOfBirth: insertPlayer.dateOfBirth || null
      })
      .returning();
    return player;
  }

  async updatePlayer(id: number, updatePlayer: Partial<InsertPlayer>): Promise<Player | undefined> {
    const [updated] = await db
      .update(players)
      .set({
        ...updatePlayer,
        dateOfBirth: updatePlayer.dateOfBirth || null
      })
      .where(eq(players.id, id))
      .returning();
    return updated || undefined;
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
    console.log('\n\n🚨🚨🚨 STORAGE-DB.TS: getGames() METHOD CALLED! 🚨🚨🚨');
    console.log('⭐ TIMESTAMP:', new Date().toISOString());
    console.log('⭐ METHOD: DatabaseStorage.getGames()');
    console.log('⭐ FILE: server/storage-db.ts');
    console.log('⭐ APPROACH: Fetching games, statuses, and opponents separately then combining');

    try {
      // Fetch games first (no joins to avoid Drizzle empty object issues)
      console.log('📋 FETCHING GAMES...');
      const gamesResult = await db
        .select()
        .from(games)
        .leftJoin(players, eq(games.awardWinnerId, players.id))
        .orderBy(desc(games.date), desc(games.time));

      console.log(`✅ Retrieved ${gamesResult.length} games from database`);

      // Fetch all game statuses separately
      console.log('📊 FETCHING GAME STATUSES...');
      const allGameStatuses = await db.select().from(gameStatuses);
      console.log(`✅ Retrieved ${allGameStatuses.length} game statuses`);
      console.log('📊 Game statuses:', allGameStatuses.map(s => ({ id: s.id, name: s.name })));

      // Create a map for quick status lookup (simple approach like opponents)
      const statusMap = new Map();
      allGameStatuses.forEach(status => {
        const statusId = Number(status.id); // Ensure number type
        statusMap.set(statusId, status);
        console.log(`🗂️ Added status to map: ID ${statusId} (${typeof statusId}) -> ${status.name}`);
      });

      console.log('🏢 FETCHING OPPONENTS...');
      const allOpponents = await db.select().from(opponents);
      console.log(`✅ Retrieved ${allOpponents.length} opponents`);

      // Create a map for quick opponent lookup (simple approach that works)
      const opponentMap = new Map();
      allOpponents.forEach(opponent => {
        opponentMap.set(opponent.id, opponent);
      });

      console.log('🔄 COMBINING DATA WITH JAVASCRIPT LOGIC...');

      // Map games with their related data using JavaScript
      const combinedGames = gamesResult.map((row, index) => {
        const game = row.games;

        console.log(`🎮 Processing game ${index + 1}/${gamesResult.length} (ID: ${game.id})`);
        console.log(`   - statusId: ${game.statusId}`);
        console.log(`   - opponentId: ${game.opponentId}`);

        // Get game status from map (ensure consistent types like opponents)
        const statusIdToLookup = game.statusId ? Number(game.statusId) : null;
        const gameStatus = statusIdToLookup ? statusMap.get(statusIdToLookup) : null;
        console.log(`   - StatusId: ${game.statusId} (${typeof game.statusId}) -> ${statusIdToLookup} (${typeof statusIdToLookup})`);
        console.log(`   - Found gameStatus: ${gameStatus ? 'YES' : 'NO'}`);
        if (gameStatus) {
          console.log(`   - Status name: ${gameStatus.name}`);
        } else if (game.statusId) {
          console.log(`   - ❌ Status lookup failed for ID ${game.statusId}`);
        }

        // Get opponent from map (simple lookup that works)
        const opponent = game.opponentId ? opponentMap.get(game.opponentId) : null;
        console.log(`   - OpponentId: ${game.opponentId}, Found opponent: ${opponent ? 'YES' : 'NO'}`);
        if (opponent) {
          console.log(`   - Opponent name: ${opponent.teamName}`);
        }

        // Build the final game object
        const gameObject = {
          id: game.id,
          date: game.date,
          time: game.time,
          opponentId: game.opponentId,
          statusId: game.statusId,
          round: game.round,
          seasonId: game.seasonId,
          notes: game.notes,
          awardWinnerId: game.awardWinnerId,
          isBye: gameStatus?.name === 'bye',
          venue: game.venue,
          teamScore: game.teamScore ?? 0,
          opponentScore: game.opponentScore ?? 0,
          gameStatus: gameStatus ? {
            name: gameStatus.name,
            displayName: gameStatus.displayName,
            isCompleted: gameStatus.isCompleted,
            allowsStatistics: gameStatus.allowsStatistics,
            colorClass: gameStatus.colorClass
          } : null,
          opponent: opponent ? {
            teamName: opponent.teamName,
            primaryColor: opponent.primaryColor,
            secondaryColor: opponent.secondaryColor
          } : null,
          awardWinner: row.players ? {
            displayName: row.players.displayName,
            firstName: row.players.firstName,
            lastName: row.players.lastName
          } : null
        };

        console.log(`   ✅ Final game object: status=${gameObject.gameStatus?.name || 'null'}, opponent=${gameObject.opponent?.teamName || 'null'}, isBye=${gameObject.isBye}`);

        return gameObject;
      });

      console.log('\n📊 FINAL SUMMARY:');
      const gamesWithStatus = combinedGames.filter(g => g.gameStatus !== null).length;
      const gamesWithOpponent = combinedGames.filter(g => g.opponent !== null).length;
      console.log(`✅ Games with status: ${gamesWithStatus}/${combinedGames.length}`);
      console.log(`✅ Games with opponent: ${gamesWithOpponent}/${combinedGames.length}`);

      console.log('\n🏁 STORAGE-DB.TS: getGames() METHOD COMPLETE');
      return combinedGames;

    } catch (error) {
      console.error('❌ Error in getGames():', error);
      throw error;
    }
  }

  async getGame(id: number): Promise<Game | undefined> {
    try {
      const result = await db
        .select()
        .from(games)
        .leftJoin(opponents, eq(games.opponentId, opponents.id))
        .leftJoin(seasons, eq(games.seasonId, seasons.id))
        .leftJoin(gameStatuses, eq(games.statusId, gameStatuses.id))
        .where(eq(games.id, id))
        .limit(1);

      if (result.length === 0) return undefined;

      const row = result[0];
      return {
        id: row.games.id,
        date: row.games.date,
        time: row.games.time,
        opponentId: row.games.opponentId,
        statusId: row.games.statusId,
        round: row.games.round,
        seasonId: row.games.seasonId,
        notes: row.games.notes,
        awardWinnerId: row.games.awardWinnerId,
        // Include opponent details if available
        opponent: row.opponents ? {
          id: row.opponents.id,
          teamName: row.opponents.teamName,
          primaryContact: row.opponents.primaryContact,
          contactInfo: row.opponents.contactInfo
        } : undefined,
        // Include season details if available
        season: row.seasons ? {
          id: row.seasons.id,
          name: row.seasons.name,
          startDate: row.seasons.startDate,
          endDate: row.seasons.endDate,
          isActive: row.seasons.isActive,
          type: row.seasons.type,
          year: row.seasons.year,
          displayOrder: row.seasons.displayOrder
        } : undefined,
        // Include status information from the game_statuses table
        gameStatus: row.game_statuses ? {
          id: row.game_statuses.id,
          name: row.game_statuses.name,
          displayName: row.game_statuses.displayName,
          points: row.game_statuses.points,
          opponentPoints: row.game_statuses.opponentPoints,
          isCompleted: row.game_statuses.isCompleted,
          allowsStatistics: row.game_statuses.allowsStatistics,
          requiresOpponent: row.game_statuses.requiresOpponent,
          colorClass: row.game_statuses.colorClass,
          sortOrder: row.game_statuses.sortOrder,
          isActive: row.game_statuses.isActive
        } : undefined,
        isBye: row.games.opponentId === null
      };
    } catch (error) {
      console.error('Error fetching game:', error);
      throw error;
    }
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
    const [roster] = await db
      .insert(rosters)
      .values(insertRoster)
      .returning();
    return roster;
  }

  async updateRoster(id: number, updateRoster: Partial<InsertRoster>): Promise<Roster | undefined> {
    const [updated] = await db
      .update(rosters)
      .set(updateRoster)
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
}

// Export the database storage implementation
export const storage = new DatabaseStorage();