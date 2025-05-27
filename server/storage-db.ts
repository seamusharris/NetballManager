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
    console.log('⭐ APPROACH: Using direct SQL query with joins that we know work');

    try {
      // Use raw SQL query since we know it works with the correct column types
      console.log('📋 FETCHING GAMES WITH DIRECT SQL...');
      const gamesResult = await db.execute(sql`
        SELECT 
          g.id,
          g.date,
          g.time,
          g.opponent_id,
          g.status_id,
          g.round,
          g.season_id,
          g.notes,
          g.award_winner_id,
          g.venue,
          g.team_score,
          g.opponent_score,
          gs.name as status_name,
          gs.display_name as status_display_name,
          gs.is_completed as status_is_completed,
          gs.allows_statistics as status_allows_statistics,
          gs.color_class as status_color_class,
          o.team_name as opponent_name,
          o.primary_color as opponent_primary_color,
          o.secondary_color as opponent_secondary_color,
          p.display_name as award_winner_display_name,
          p.first_name as award_winner_first_name,
          p.last_name as award_winner_last_name
        FROM games g
        LEFT JOIN game_statuses gs ON g.status_id = gs.id
        LEFT JOIN opponents o ON g.opponent_id = o.id
        LEFT JOIN players p ON g.award_winner_id = p.id
        ORDER BY g.date DESC, g.time DESC
      `);

      console.log(`✅ Retrieved ${gamesResult.rows.length} games from database using direct SQL`);

      // Transform the raw SQL results into our expected format
      const combinedGames = gamesResult.rows.map((row, index) => {
        console.log(`🎮 Processing game ${index + 1}/${gamesResult.rows.length} (ID: ${row.id})`);
        console.log(`   - statusId: ${row.status_id}`);
        console.log(`   - status_name: ${row.status_name}`);
        console.log(`   - opponentId: ${row.opponent_id}`);
        console.log(`   - opponent_name: ${row.opponent_name}`);

        const gameObject = {
          id: row.id,
          date: row.date,
          time: row.time,
          opponentId: row.opponent_id,
          statusId: row.status_id,
          round: row.round,
          seasonId: row.season_id,
          notes: row.notes,
          awardWinnerId: row.award_winner_id,
          isBye: row.status_name === 'bye',
          venue: row.venue || null,
          teamScore: row.team_score ?? 0,
          opponentScore: row.opponent_score ?? 0,
          gameStatus: row.status_name ? {
            name: row.status_name,
            displayName: row.status_display_name,
            isCompleted: row.status_is_completed,
            allowsStatistics: row.status_allows_statistics,
            colorClass: row.status_color_class
          } : null,
          opponent: row.opponent_name ? {
            teamName: row.opponent_name,
            primaryContact: row.opponent_primary_contact,
            contactInfo: row.opponent_contact_info
          } : null,
          awardWinner: row.award_winner_display_name ? {
            displayName: row.award_winner_display_name,
            firstName: row.award_winner_first_name,
            lastName: row.award_winner_last_name
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