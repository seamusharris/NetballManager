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
import { eq, desc, and, isNull, sql, asc } from "drizzle-orm";

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
    const result = await db.select().from(players);
    return result;
  }

  async getPlayersByClub(clubId: number): Promise<Player[]> {
    console.log(`Fetching players for club ${clubId}`);

    // First try to use the club_players table if it exists
    try {
      const directResult = await db.execute(sql`
        SELECT p.id, p.display_name, p.first_name, p.last_name, p.date_of_birth, 
               p.position_preferences, p.active, p.avatar_color
        FROM players p
        JOIN club_players cp ON p.id = cp.player_id
        WHERE cp.club_id = ${clubId} AND cp.is_active = true
        ORDER BY p.display_name
      `);

      console.log(`Direct club_players query returned ${directResult.rows.length} rows`);

      if (directResult.rows.length > 0) {
        const players = directResult.rows.map(row => ({
          id: row.id,
          displayName: row.display_name,
          firstName: row.first_name,
          lastName: row.last_name,
          dateOfBirth: row.date_of_birth,
          positionPreferences: typeof row.position_preferences === 'string' 
            ? JSON.parse(row.position_preferences) 
            : row.position_preferences,
          active: row.active,
          avatarColor: row.avatar_color
        }));
        console.log(`Returning ${players.length} players from club_players table`);
        return players;
      }
    } catch (error) {
      // club_players table might not exist yet, fall back to team-based lookup
      console.log(`club_players table query failed, using team-based lookup for club ${clubId}:`, error);
    }

    // Fallback to team-based lookup - but first check if we have teams
    try {
      console.log(`Attempting team-based lookup for club ${clubId}`);
      const result = await db.execute(sql`
        SELECT DISTINCT p.id, p.display_name, p.first_name, p.last_name, p.date_of_birth, 
               p.position_preferences::text as position_preferences, p.active, p.avatar_color
        FROM players p
        JOIN team_players tp ON p.id = tp.player_id
        JOIN teams t ON tp.team_id = t.id
        WHERE t.club_id = ${clubId}
        ORDER BY p.display_name
      `);

      const players = result.rows.map(row => ({
          id: row.id,
          displayName: row.display_name,
          firstName: row.first_name,
          lastName: row.last_name,
          dateOfBirth: row.date_of_birth,
          positionPreferences: typeof row.position_preferences === 'string' 
            ? JSON.parse(row.position_preferences) 
            : row.position_preferences || [],
          active: row.active,
          avatarColor: row.avatar_color
        }));

      console.log(`Found ${result.rows.length} players via team-based lookup for club ${clubId}`);
      return players;
    } catch (teamError) {
      console.error(`Team-based lookup also failed for club ${clubId}:`, teamError);

      // Last resort: return all players (for backward compatibility)
      console.log(`Falling back to all players query`);
      const allPlayersResult = await db.select().from(players).orderBy(asc(players.displayName));
      console.log(`Returning all ${allPlayersResult.length} players as fallback`);
      return allPlayersResult;
    }
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
    try {
      const result = await db.execute(sql`
        SELECT 
          g.*,
          gs.id as "gameStatus.id",
          gs.name as "gameStatus.name",
          gs.display_name as "gameStatus.displayName",
          gs.points as "gameStatus.points",
          gs.opponent_points as "gameStatus.opponentPoints",
          gs.is_completed as "gameStatus.isCompleted",
          gs.allows_statistics as "gameStatus.allowsStatistics",
          gs.requires_opponent as "gameStatus.requiresOpponent",
          gs.color_class as "gameStatus.colorClass",
          gs.sort_order as "gameStatus.sortOrder",
          gs.is_active as "gameStatus.isActive",
          gs.created_at as "gameStatus.createdAt",
          gs.updated_at as "gameStatus.updatedAt",
          o.id as "opponent.id",
          o.team_name as "opponent.teamName",
          o.primary_contact as "opponent.primaryContact",
          o.contact_info as "opponent.contactInfo",
          s.id as "season.id",
          s.name as "season.name",
          s.start_date as "season.startDate",
          s.end_date as "season.endDate",
          s.is_active as "season.isActive",
          s.type as "season.type",
          s.year as "season.year",
          s.display_order as "season.displayOrder"
        FROM games g
        LEFT JOIN game_statuses gs ON g.status_id = gs.id
        LEFT JOIN opponents o ON g.opponent_id = o.id
        LEFT JOIN seasons s ON g.season_id = s.id
        ORDER BY g.date DESC, g.time DESC
      `);

      return result.rows.map(row => ({
        id: row.id,
        date: row.date,
        time: row.time,
        opponentId: row.opponent_id,
        homeTeamId: row.home_team_id,
        awayTeamId: row.away_team_id,
        venue: row.venue,
        isInterClub: row.is_inter_club,
        statusId: row.status_id,
        round: row.round,
        seasonId: row.season_id,
        notes: row.notes,
        awardWinnerId: row.award_winner_id,
        gameStatus: row['gameStatus.id'] ? {
          id: row['gameStatus.id'],
          name: row['gameStatus.name'],
          displayName: row['gameStatus.displayName'],
          points: row['gameStatus.points'],
          opponentPoints: row['gameStatus.opponentPoints'],
          isCompleted: row['gameStatus.isCompleted'],
          allowsStatistics: row['gameStatus.allowsStatistics'],
          requiresOpponent: row['gameStatus.requiresOpponent'],
          colorClass: row['gameStatus.colorClass'],
          sortOrder: row['gameStatus.sortOrder'],
          isActive: row['gameStatus.isActive'],
          createdAt: row['gameStatus.createdAt'],
          updatedAt: row['gameStatus.updatedAt']
        } : null,
        opponent: row['opponent.id'] ? {
          id: row['opponent.id'],
          teamName: row['opponent.teamName'],
          primaryContact: row['opponent.primaryContact'],
          contactInfo: row['opponent.contactInfo']
        } : null,
        season: row['season.id'] ? {
          id: row['season.id'],
          name: row['season.name'],
          startDate: row['season.startDate'],
          endDate: row['season.endDate'],
          isActive: row['season.isActive'],
          type: row['season.type'],
          year: row['season.year'],
          displayOrder: row['season.displayOrder']
        } : null,
        // Legacy fields for backward compatibility
        isBye: false // This is now handled by game status
      }));
    } catch (error) {
      console.error("Error fetching games:", error);
      throw error;
    }
  }

  async getGamesByClub(clubId: number): Promise<Game[]> {
    try {
      const result = await db.execute(sql`
        SELECT 
          g.*,
          gs.id as "gameStatus.id",
          gs.name as "gameStatus.name",
          gs.display_name as "gameStatus.displayName",
          gs.points as "gameStatus.points",
          gs.opponent_points as "gameStatus.opponentPoints",
          gs.is_completed as "gameStatus.isCompleted",
          gs.allows_statistics as "gameStatus.allowsStatistics",
          gs.requires_opponent as "gameStatus.requiresOpponent",
          gs.color_class as "gameStatus.colorClass",
          gs.sort_order as "gameStatus.sortOrder",
          gs.is_active as "gameStatus.isActive",
          gs.created_at as "gameStatus.createdAt",
          gs.updated_at as "gameStatus.updatedAt",
          o.id as "opponent.id",
          o.team_name as "opponent.teamName",
          o.primary_contact as "opponent.primaryContact",
          o.contact_info as "opponent.contactInfo",
          s.id as "season.id",
          s.name as "season.name",
          s.start_date as "season.startDate",
          s.end_date as "season.endDate",
          s.is_active as "season.isActive",
          s.type as "season.type",
          s.year as "season.year",
          s.display_order as "season.displayOrder"
        FROM games g
        LEFT JOIN game_statuses gs ON g.status_id = gs.id
        LEFT JOIN opponents o ON g.opponent_id = o.id
        LEFT JOIN seasons s ON g.season_id = s.id
        LEFT JOIN teams ht ON g.home_team_id = ht.id
        LEFT JOIN teams at ON g.away_team_id = at.id
        WHERE (ht.club_id = ${clubId} OR at.club_id = ${clubId})
           OR EXISTS (
             SELECT 1 FROM game_permissions gp 
             WHERE gp.game_id = g.id AND gp.club_id = ${clubId}
           )
        ORDER BY g.date DESC, g.time DESC
      `);

      return result.rows.map(row => ({
        id: row.id,
        date: row.date,
        time: row.time,
        opponentId: row.opponent_id,
        homeTeamId: row.home_team_id,
        awayTeamId: row.away_team_id,
        venue: row.venue,
        isInterClub: row.is_inter_club,
        statusId: row.status_id,
        round: row.round,
        seasonId: row.season_id,
        notes: row.notes,
        awardWinnerId: row.award_winner_id,
        gameStatus: row['gameStatus.id'] ? {
          id: row['gameStatus.id'],
          name: row['gameStatus.name'],
          displayName: row['gameStatus.displayName'],
          points: row['gameStatus.points'],
          opponentPoints: row['gameStatus.opponentPoints'],
          isCompleted: row['gameStatus.isCompleted'],
          allowsStatistics: row['gameStatus.allowsStatistics'],
          requiresOpponent: row['gameStatus.requiresOpponent'],
          colorClass: row['gameStatus.colorClass'],
          sortOrder: row['gameStatus.sortOrder'],
          isActive: row['gameStatus.isActive'],
          createdAt: row['gameStatus.createdAt'],
          updatedAt: row['gameStatus.updatedAt']
        } : null,
        opponent: row['opponent.id'] ? {
          id: row['opponent.id'],
          teamName: row['opponent.teamName'],
          primaryContact: row['opponent.primaryContact'],
          contactInfo: row['opponent.contactInfo']
        } : null,
        season: row['season.id'] ? {
          id: row['season.id'],
          name: row['season.name'],
          startDate: row['season.startDate'],
          endDate: row['season.endDate'],
          isActive: row['season.isActive'],
          type: row['season.type'],
          year: row['season.year'],
          displayOrder: row['season.displayOrder']
        } : null,
        // Legacy fields for backward compatibility
        isBye: false // This is now handled by game status
      }));
    } catch (error) {
      console.error("Error fetching games by club:", error);
      throw error;
    }
  }

  async getGame(id: number): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game || undefined;
  }

  async createGame(gameData: any): Promise<Game> {
    try {
      console.log("Creating game:", gameData);

      // If no team IDs provided, try to assign to default team for the season
      if (!gameData.homeTeamId && !gameData.awayTeamId && gameData.seasonId) {
        try {
          const defaultTeam = await db.execute(sql`
            SELECT t.id FROM teams t
            JOIN clubs c ON t.club_id = c.id
            WHERE t.season_id = ${gameData.seasonId} AND c.code = 'DEFAULT'
            LIMIT 1
          `);

          if (defaultTeam.rows.length > 0) {
            gameData.homeTeamId = defaultTeam.rows[0].id;
            console.log(`Assigned game to default team ID: ${gameData.homeTeamId}`);
          }
        } catch (error) {
          console.warn("Could not assign default team to game:", error);
        }
      }

      const [game] = await db.insert(games).values(gameData).returning();
      console.log("Game created:", game);

      return game;
    } catch (error) {
      console.error("Error creating game:", error);
      throw error;
    }
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

  // Club-player relationship methods
  async getPlayerClubs(playerId: number): Promise<any[]> {
    try {
      const result = await db.execute(sql`
        SELECT 
          c.*,
          cp.joined_date,
          cp.left_date,
          cp.is_active,
          cp.notes
        FROM clubs c
        JOIN club_players cp ON c.id = cp.club_id
        WHERE cp.player_id = ${playerId}
        ORDER BY cp.is_active DESC, cp.joined_date DESC
      `);
      return result.rows;
    } catch (error) {
      console.log('club_players table not available, returning empty array');
      return [];
    }
  }

  async addPlayerToClub(playerId: number, clubId: number, notes?: string): Promise<boolean> {
    try {
      await db.execute(sql`
        INSERT INTO club_players (player_id, club_id, notes)
        VALUES (${playerId}, ${clubId}, ${notes || null})
        ON CONFLICT (club_id, player_id) DO UPDATE SET
          is_active = true,
          left_date = null,
          notes = EXCLUDED.notes,
          updated_at = NOW()
      `);
      return true;
    } catch (error) {
      console.error('Error adding player to club:', error);
```text
      return false;
    }
  }

  async removePlayerFromClub(playerId: number, clubId: number): Promise<boolean> {
    try {
      await db.execute(sql`
        UPDATE club_players 
        SET is_active = false, left_date = CURRENT_DATE, updated_at = NOW()
        WHERE player_id = ${playerId} AND club_id = ${clubId}
      `);
      return true;
    } catch (error) {
      console.error('Error removing player from club:', error);
      return false;
    }
  }

  async getClubPlayers(clubId: number): Promise<any[]> {
    try {
      const result = await db.execute(sql`
        SELECT 
          p.*,
          cp.joined_date,
          cp.left_date,
          cp.is_active as club_active,
          cp.notes as club_notes
        FROM players p
        JOIN club_players cp ON p.id = cp.player_id
        WHERE cp.club_id = ${clubId} AND cp.is_active = true
        ORDER BY p.display_name
      `);
      return result.rows;
    } catch (error) {
      console.log('club_players table not available, falling back to team-based lookup');
      return [];
    }
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