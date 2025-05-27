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
    console.log('⭐ QUERY: Building join query with games, gameStatuses, opponents, players');

    // First, let's verify the data exists in the database
    console.log('\n🔍 DATABASE VERIFICATION CHECKS:');
    try {
      // Check games table sample
      const gamesSample = await db.execute(sql`
        SELECT id, date, status_id, opponent_id 
        FROM games 
        ORDER BY id 
        LIMIT 3
      `);
      console.log('📋 Sample games in database:', gamesSample.rows);

      // Check game_statuses table
      const statusesSample = await db.execute(sql`
        SELECT id, name, display_name, is_completed 
        FROM game_statuses 
        ORDER BY id 
        LIMIT 5
      `);
      console.log('📊 Available game statuses:', statusesSample.rows);

      // Check for games with NULL statusId
      const nullStatusCount = await db.execute(sql`
        SELECT COUNT(*) as count 
        FROM games 
        WHERE status_id IS NULL
      `);
      console.log('⚠️ Games with NULL status_id:', nullStatusCount.rows[0].count);

      // Test the join manually with SQL
      const joinTest = await db.execute(sql`
        SELECT 
          g.id as game_id, 
          g.status_id, 
          gs.id as status_table_id, 
          gs.name as status_name,
          gs.display_name,
          gs.is_completed
        FROM games g
        LEFT JOIN game_statuses gs ON g.status_id = gs.id
        ORDER BY g.id 
        LIMIT 3
      `);
      console.log('🔗 Manual join test results:', joinTest.rows);

    } catch (verificationError) {
      console.error('❌ Database verification failed:', verificationError);
    }

    // Log the exact SQL we're executing
    console.log('🔧 BUILDING DRIZZLE QUERY:');
    console.log('   - FROM: games table');
    console.log('   - LEFT JOIN: gameStatuses ON games.statusId = gameStatuses.id');
    console.log('   - LEFT JOIN: opponents ON games.opponentId = opponents.id');
    console.log('   - LEFT JOIN: players ON games.awardWinnerId = players.id');
    console.log('   - ORDER BY: games.date DESC, games.time DESC');

    // Execute the query with error handling
    let results;
    try {
      console.log('🚀 EXECUTING DRIZZLE QUERY...');
      results = await db
        .select()
        .from(games)
        .leftJoin(gameStatuses, eq(games.statusId, gameStatuses.id))
        .leftJoin(opponents, eq(games.opponentId, opponents.id))
        .leftJoin(players, eq(games.awardWinnerId, players.id))
        .orderBy(desc(games.date), desc(games.time));
      console.log('✅ QUERY EXECUTED SUCCESSFULLY');
    } catch (queryError) {
      console.error('❌ QUERY EXECUTION FAILED:', queryError);
      throw queryError;
    }

    console.log('🚨 COMPREHENSIVE DRIZZLE DEBUGGING START');
    console.log('📊 Query returned', results.length, 'results');

    // Log sample data for first 3 records
    if (results.length > 0) {
      for (let i = 0; i < Math.min(3, results.length); i++) {
        const row = results[i];
        console.log(`\n🔍 ROW ${i + 1} ANALYSIS:`);
        console.log('🔑 Available keys:', Object.keys(row));
        console.log('🎮 games object:', JSON.stringify(row.games, null, 2));
        console.log('📋 gameStatuses object:', JSON.stringify(row.gameStatuses, null, 2));
        console.log('🎯 gameStatuses type:', typeof row.gameStatuses);
        console.log('🎯 gameStatuses keys:', row.gameStatuses ? Object.keys(row.gameStatuses) : 'null/undefined');
        console.log('🆔 gameStatuses.id:', row.gameStatuses?.id);
        console.log('📝 gameStatuses.name:', row.gameStatuses?.name);
        console.log('🏆 opponents object:', row.opponents ? JSON.stringify(row.opponents, null, 2) : 'null');
        console.log('👤 players object:', row.players ? JSON.stringify(row.players, null, 2) : 'null');
      }
    }
    console.log('🚨 DEBUGGING END');

    console.log('🔄 STARTING RESULTS MAPPING PROCESS');
    console.log(`📊 Processing ${results.length} database rows`);

    return results.map((row, index) => {
      console.log(`\n🎮 PROCESSING GAME ROW ${index + 1}/${results.length}`);
      console.log(`🆔 Game ID: ${row.games.id}`);
      console.log(`📅 Game Date: ${row.games.date}`);
      console.log(`🔗 Game statusId: ${row.games.statusId}`);
      console.log(`🏢 Game opponentId: ${row.games.opponentId}`);

      // The join works correctly - gameStatuses is the right key
      console.log('🔍 DEBUGGING GAME STATUS DETECTION:');
      console.log('🔸 row.gameStatuses exists:', !!row.gameStatuses);
      console.log('🔸 row.gameStatuses value:', JSON.stringify(row.gameStatuses, null, 2));
      console.log('🔸 row.gameStatuses type:', typeof row.gameStatuses);
      console.log('🔸 row.gameStatuses === null:', row.gameStatuses === null);
      console.log('🔸 row.gameStatuses === undefined:', row.gameStatuses === undefined);
      console.log('🔸 Object.keys(row.gameStatuses):', row.gameStatuses ? Object.keys(row.gameStatuses) : 'N/A');
      console.log('🔸 Object.keys length:', row.gameStatuses ? Object.keys(row.gameStatuses).length : 'N/A');
      console.log('🔸 row.gameStatuses.id:', row.gameStatuses?.id);
      console.log('🔸 row.gameStatuses.name:', row.gameStatuses?.name);

      // Debugging opponents data
      console.log('🏢 DEBUGGING OPPONENT DETECTION:');
      console.log('🔸 row.opponents exists:', !!row.opponents);
      console.log('🔸 row.opponents value:', JSON.stringify(row.opponents, null, 2));
      console.log('🔸 row.opponents type:', typeof row.opponents);
      console.log('🔸 Object.keys(row.opponents):', row.opponents ? Object.keys(row.opponents) : 'N/A');
      console.log('🔸 Object.keys length:', row.opponents ? Object.keys(row.opponents).length : 'N/A');
      console.log('🔸 row.opponents.id:', row.opponents?.id);
      console.log('🔸 row.opponents.teamName:', row.opponents?.teamName);

      // Declare the gameStatus variable
      let gameStatus = null;

      // Check if gameStatuses has actual data (not just an empty object)
      if (row.gameStatuses && row.gameStatuses.id) {
        console.log('✅ Found valid gameStatus with ID:', row.gameStatuses.id);
        gameStatus = row.gameStatuses;
      } else {
        console.log('❌ No valid gameStatus found');
        console.log('   - gameStatuses exists:', !!row.gameStatuses);
        console.log('   - gameStatuses.id exists:', row.gameStatuses?.id);
        console.log('   - Full gameStatuses object:', JSON.stringify(row.gameStatuses));
      }
      // Build the final game object
      console.log(`🏗️ CONSTRUCTING FINAL GAME OBJECT FOR GAME ${row.games.id}:`);

      const gameObject = {
        id: row.games.id,
        date: row.games.date,
        time: row.games.time,
        opponentId: row.games.opponentId,
        statusId: row.games.statusId,
        round: row.games.round,
        seasonId: row.games.seasonId,
        notes: row.games.notes,
        awardWinnerId: row.games.awardWinnerId,
        isBye: gameStatus?.name === 'bye',
        venue: row.games.venue,
        teamScore: row.games.teamScore ?? 0,
        opponentScore: row.games.opponentScore ?? 0,
        gameStatus: gameStatus ? {
          name: gameStatus.name,
          displayName: gameStatus.displayName,
          isCompleted: gameStatus.isCompleted,
          allowsStatistics: gameStatus.allowsStatistics,
          colorClass: gameStatus.colorClass
        } : null,
        opponent: (row.opponents && row.opponents.id) ? {
          teamName: row.opponents.teamName,
          primaryColor: row.opponents.primaryColor,
          secondaryColor: row.opponents.secondaryColor
        } : null,
        awardWinner: row.players ? {
          displayName: row.players.displayName,
          firstName: row.players.firstName,
          lastName: row.players.lastName
        } : null
      };

      console.log('📋 Final game object properties:');
      console.log(`   - id: ${gameObject.id}`);
      console.log(`   - statusId: ${gameObject.statusId}`);
      console.log(`   - gameStatus: ${gameObject.gameStatus ? 'PRESENT' : 'NULL'}`);
      if (gameObject.gameStatus) {
        console.log(`   - gameStatus.name: ${gameObject.gameStatus.name}`);
        console.log(`   - gameStatus.displayName: ${gameObject.gameStatus.displayName}`);
        console.log(`   - gameStatus.isCompleted: ${gameObject.gameStatus.isCompleted}`);
      }
      console.log(`   - opponent: ${gameObject.opponent ? 'PRESENT' : 'NULL'}`);
      console.log(`   - isBye: ${gameObject.isBye}`);

      return gameObject;
    });

    console.log('\n🏁 STORAGE-DB.TS: getGames() METHOD COMPLETE');
    console.log(`📊 Returning ${results.length} games to caller`);
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