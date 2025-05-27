import { users, type User, type InsertUser } from "@shared/schema";
import { players, type Player, type InsertPlayer } from "@shared/schema";
import { opponents, type Opponent, type InsertOpponent } from "@shared/schema";
import { games, type Game, type InsertGame } from "@shared/schema";
import { rosters, type Roster, type InsertRoster } from "@shared/schema";
import { gameStats, type GameStat, type InsertGameStat } from "@shared/schema";
import { Position } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { gameStatuses } from "@shared/schema";
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
    console.log('=== DEBUGGING getGames() START ===');

    // Debug: Show available statuses
    const availableStatuses = await db.select().from(gameStatuses);
    console.log('=== AVAILABLE GAME STATUSES ===');
    console.log(availableStatuses);

    // Debug: Show distribution of status IDs in games
    const statusDistribution = await db.execute(sql`
      SELECT status_id, COUNT(*) as count 
      FROM games 
      WHERE status_id IS NOT NULL 
      GROUP BY status_id 
      ORDER BY status_id
    `);
    console.log('=== GAME STATUS ID DISTRIBUTION ===');
    console.log(statusDistribution.rows);

    // Show sample games with their actual status IDs
    const gamesSample = await db.execute(sql`
      SELECT g.id, g.date, g.status_id, gs.name as status_name, gs.is_completed
      FROM games g
      LEFT JOIN game_statuses gs ON g.status_id = gs.id
      ORDER BY g.id 
      LIMIT 10
    `);
    console.log('=== SAMPLE GAMES WITH ACTUAL STATUS DATA ===');
    console.log(gamesSample.rows);

    const results = await db
      .select({
        games,
        opponents,
        gameStatuses,
        seasons,
        players,
      })
      .from(games)
      .leftJoin(opponents, eq(games.opponentId, opponents.id))
      .leftJoin(gameStatuses, eq(games.statusId, gameStatuses.id))
      .leftJoin(seasons, eq(games.seasonId, seasons.id))
      .leftJoin(players, eq(games.awardWinnerId, players.id))
      .orderBy(desc(games.date), desc(games.time));

    console.log('=== DRIZZLE JOIN RESULTS (first 5) ===');
    results.slice(0, 5).forEach((row, index) => {
      console.log(`Result ${index}:`, {
        gameId: row.games.id,
        gameDate: row.games.date,
        gameStatusId: row.games.statusId,
        gameStatusObject: row.gameStatuses,
        gameStatusName: row.gameStatuses?.name,
        gameStatusIsCompleted: row.gameStatuses?.isCompleted,
        joinKeys: Object.keys(row)
      });
    });

    return results.map(row => {
      console.log(`=== GAME ${row.games.id} DEBUG ===`);
      console.log(`StatusID in games table: ${row.games.statusId}`);
      console.log(`gameStatuses object:`, row.gameStatuses);
      console.log(`Full row structure:`, JSON.stringify(row, null, 2));

      // Extract status data more explicitly - check all possible property access patterns
      let statusName = 'upcoming';
      let isCompleted = false;

      if (row.gameStatuses) {
        statusName = row.gameStatuses.name || 'upcoming';
        isCompleted = row.gameStatuses.isCompleted === true;
        console.log(`✅ Successfully extracted: status="${statusName}", completed=${isCompleted}`);
      } else {
        console.log(`❌ gameStatuses is null/undefined for game ${row.games.id}`);
      }

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
        opponent: row.opponents ? {
          id: row.opponents.id,
          teamName: row.opponents.teamName,
          primaryContact: row.opponents.primaryContact,
          contactInfo: row.opponents.contactInfo
        } : undefined,
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
        awardWinner: row.players ? {
          id: row.players.id,
          displayName: row.players.displayName,
          firstName: row.players.firstName,
          lastName: row.players.lastName,
          dateOfBirth: row.players.dateOfBirth,
          positionPreferences: row.players.positionPreferences,
          active: row.players.active,
          avatarColor: row.players.avatarColor
        } : undefined,
        gameStatus: row.gameStatuses ? {
          id: row.gameStatuses.id,
          name: row.gameStatuses.name,
          displayName: row.gameStatuses.displayName,
          points: row.gameStatuses.points,
          opponentPoints: row.gameStatuses.opponentPoints,
          isCompleted: row.gameStatuses.isCompleted,
          allowsStatistics: row.gameStatuses.allowsStatistics,
          requiresOpponent: row.gameStatuses.requiresOpponent,
          colorClass: row.gameStatuses.colorClass,
          sortOrder: row.gameStatuses.sortOrder,
          isActive: row.gameStatuses.isActive
        } : undefined,
        // Use the values we extracted above
        status: statusName,
        completed: isCompleted,
        isBye: row.games.opponentId === null
      };
    });
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
        gameStatus: row.gameStatuses ? {
          id: row.gameStatuses.id,
          name: row.gameStatuses.name,
          displayName: row.gameStatuses.displayName,
          points: row.gameStatuses.points,
          opponentPoints: row.gameStatuses.opponentPoints,
          isCompleted: row.gameStatuses.isCompleted,
          allowsStatistics: row.gameStatuses.allowsStatistics,
          requiresOpponent: row.gameStatuses.requiresOpponent,
          colorClass: row.gameStatuses.colorClass,
          sortOrder: row.gameStatuses.sortOrder,
          isActive: row.gameStatuses.isActive
        } : undefined,
        // Map status field to the actual status name from game_statuses table
        status: row.gameStatuses?.name || 'upcoming',
        // Legacy fields for backward compatibility - use gameStatus.isCompleted since completed column was removed
        completed: row.gameStatuses?.isCompleted ?? false,
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