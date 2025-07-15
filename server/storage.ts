import {
  users, type User, type InsertUser,
  players, type Player, type InsertPlayer,
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

      // Return empty array if no players found for this club
      console.log(`No players found for club ${clubId}, returning empty array`);
      return [];
    }
  }

  async getPlayer(id: number): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.id, id));
    return player || undefined;
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    console.log("DatabaseStorage.createPlayer: Starting with data:", JSON.stringify(insertPlayer, null, 2));

    // Get existing player colors to avoid duplicates
    const existingPlayers = await this.getPlayers();
    const usedColors = existingPlayers.map(p => p.avatarColor).filter(Boolean);

    // Define our expanded color palette for players (40 colors)
    const avatarColors = [
      // Original palette (weight 600)
      'bg-blue-600',    'bg-purple-600',  'bg-pink-600',    'bg-green-600',   
      'bg-teal-600',    'bg-indigo-600',  'bg-orange-600',  'bg-red-600',     
      'bg-yellow-600',  'bg-cyan-600',    'bg-amber-600',   'bg-lime-600',    
      'bg-emerald-600', 'bg-violet-600',  'bg-fuchsia-600', 'bg-rose-600',    

      // Darker variants (weight 700) 
      'bg-blue-700',    'bg-purple-700',  'bg-pink-700',    'bg-green-700',   
      'bg-teal-700',    'bg-indigo-700',  'bg-orange-700',  'bg-red-700',     
      'bg-yellow-700',  'bg-cyan-700',    'bg-amber-700',   'bg-lime-700',    
      'bg-emerald-700', 'bg-violet-700',  'bg-fuchsia-700', 'bg-rose-700',    

      // Medium variants (weight 500) for lighter options
      'bg-blue-500',    'bg-purple-500',  'bg-green-500',   'bg-red-500',     
      'bg-orange-500',  'bg-sky-500',     'bg-slate-600',   'bg-stone-600'
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

    console.log("DatabaseStorage.createPlayer: Using avatar color:", avatarColor);

    // Prepare the player data with guaranteed avatar color
    const playerData = {
      displayName: insertPlayer.displayName,
      firstName: insertPlayer.firstName,
      lastName: insertPlayer.lastName,
      dateOfBirth: insertPlayer.dateOfBirth || null,
      positionPreferences: insertPlayer.positionPreferences,
      active: insertPlayer.active !== undefined ? insertPlayer.active : true,
      avatarColor // Always include avatar color
    };

    console.log("DatabaseStorage.createPlayer: Final player data:", JSON.stringify(playerData, null, 2));

    try {
      // Create the player with all properties including avatar color
      const [player] = await db
        .insert(players)
        .values(playerData)
        .returning();

      console.log("DatabaseStorage.createPlayer: Successfully created player:", player);
      return player;
    } catch (error) {
      console.error("DatabaseStorage.createPlayer: Database error:", error);
      throw new Error(`Failed to create player in database: ${error.message}`);
    }
  }

  async updatePlayer(id: number, updatePlayer: Partial<InsertPlayer>): Promise<Player | undefined> {
    try {
      console.log("Storage: Updating player with ID:", id);
      console.log("Storage: Update data received:", JSON.stringify(updatePlayer, null, 2));

      // Handle type-safe update to avoid TS errors
      const updateData: Record<string, any> = {};

      if (updatePlayer.displayName !== undefined) updateData.display_name = updatePlayer.displayName;
      if (updatePlayer.firstName !== undefined) updateData.first_name = updatePlayer.firstName;
      if (updatePlayer.lastName !== undefined) updateData.last_name = updatePlayer.lastName;
      if (updatePlayer.dateOfBirth !== undefined) updateData.date_of_birth = updatePlayer.dateOfBirth;
      if (updatePlayer.active !== undefined) updateData.active = updatePlayer.active === true;

      // Ensure position preferences is always an array
      if (updatePlayer.positionPreferences !== undefined) {
        if (Array.isArray(updatePlayer.positionPreferences)) {
          updateData.position_preferences = updatePlayer.positionPreferences;
        } else if (typeof updatePlayer.positionPreferences === 'string') {
          // Handle case where it might come as a string
          updateData.position_preferences = [updatePlayer.positionPreferences];
        } else {
          // Default to empty array if invalid
          updateData.position_preferences = [];
        }
      }

      if (updatePlayer.avatarColor !== undefined) updateData.avatar_color = updatePlayer.avatarColor;

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
        // Game Status fields
        statusName: row['gameStatus.name'],
        statusDisplayName: row['gameStatus.displayName'],
        statusPoints: row['gameStatus.points'],
        statusOpponentPoints: row['gameStatus.opponentPoints'],
        statusIsCompleted: row['gameStatus.isCompleted'],
        statusAllowsStatistics: row['gameStatus.allowsStatistics'],
        statusRequiresOpponent: row['gameStatus.requiresOpponent'],
        statusColorClass: row['gameStatus.colorClass'],
        statusSortOrder: row['gameStatus.sortOrder'],
        statusIsActive: row['gameStatus.isActive'],
        statusCreatedAt: row['gameStatus.createdAt'],
        statusUpdatedAt: row['gameStatus.updatedAt'],

        // Season fields
        seasonName: row['season.name'],
        seasonStartDate: row['season.startDate'],
        seasonEndDate: row['season.endDate'],
        seasonIsActive: row['season.isActive'],
        seasonType: row['season.type'],
        seasonYear: row['season.year'],
        seasonDisplayOrder: row['season.displayOrder'],
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
        // Game Status fields
        statusName: row['gameStatus.name'],
        statusDisplayName: row['gameStatus.displayName'],
        statusPoints: row['gameStatus.points'],
        statusOpponentPoints: row['gameStatus.opponentPoints'],
        statusIsCompleted: row['gameStatus.isCompleted'],
        statusAllowsStatistics: row['gameStatus.allowsStatistics'],
        statusRequiresOpponent: row['gameStatus.requiresOpponent'],
        statusColorClass: row['gameStatus.colorClass'],
        statusSortOrder: row['gameStatus.sortOrder'],
        statusIsActive: row['gameStatus.isActive'],
        statusCreatedAt: row['gameStatus.createdAt'],
        statusUpdatedAt: row['gameStatus.updatedAt'],

        // Season fields
        seasonName: row['season.name'],
        seasonStartDate: row['season.startDate'],
        seasonEndDate: row['season.endDate'],
        seasonIsActive: row['season.isActive'],
        seasonType: row['season.type'],
        seasonYear: row['season.year'],
        seasonDisplayOrder: row['season.displayOrder'],
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
    console.log('ENTER getRostersByGame with gameId:', gameId);
    return await db.select().from(rosters).where(eq(rosters.game_id, gameId));
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
        game_id: insertRoster.game_id,
        quarter: insertRoster.quarter,
        position: position,
        player_id: insertRoster.player_id
      })
      .returning();
    return roster;
  }

  async updateRoster(id: number, updateRoster: Partial<InsertRoster>): Promise<Roster | undefined> {
    // Handle type-safe update to avoid TS errors
    const updateData: Record<string, any> = {};

    if (updateRoster.game_id !== undefined) updateData.game_id = updateRoster.game_id;
    if (updateRoster.quarter !== undefined) updateData.quarter = updateRoster.quarter;
    if (updateRoster.player_id !== undefined) updateData.player_id = updateRoster.player_id;

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
      .where(eq(rosters.game_id, gameId))
      .returning({ id: rosters.id });
    return result.length > 0;
  }

  async createRostersBulk(rosterData: Array<{
    game_id: number;
    quarter: number;
    position: string;
    player_id: number;
  }>): Promise<any[]> {
    if (rosterData.length === 0) return [];

    return await db
      .insert(rosters)
      .values(rosterData)
      .returning();
  }

  // Game Stats methods
  async getGameStatsByGame(gameId: number, teamId?: number): Promise<GameStat[]> {
    try {
      if (teamId) {
        return await db.select().from(gameStats).where(
          and(eq(gameStats.game_id, gameId), eq(gameStats.team_id, teamId))
        );
      }
      return await db.select().from(gameStats).where(eq(gameStats.game_id, gameId));
    } catch (error) {
      // Handle case where team_id column doesn't exist yet
      if (error.message?.includes('column "team_id" does not exist')) {
        console.log(`team_id column missing for game ${gameId}, returning all stats`);
        return await db.select().from(gameStats).where(eq(gameStats.game_id, gameId));
      }
      throw error;
    }
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
      .where(eq(gameStats.game_id, gameId))
      .returning({ id: gameStats.id });
    return result.length > 0;
  }

  // Season methods
  async getSeasons(): Promise<Season[]> {
    // Order by year descending, then display_order ascending
    return await db.select().from(seasons).orderBy(desc(seasons.year), asc(seasons.display_order));
  }

  async getSeason(id: number): Promise<Season | undefined> {
    const [season] = await db.select().from(seasons).where(eq(seasons.id, id));
    return season || undefined;
  }

  async getActiveSeason(): Promise<Season | undefined> {
    // Fix: Use correct column name for is_active
    const [season] = await db.select().from(seasons).where(eq(seasons.is_active, true));
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
    await db.update(seasons).set({ is_active: false });

    // Then activate the specified season
    const [season] = await db
      .update(seasons)
      .set({ is_active: true })
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
    return await db.select().from(games).where(eq(games.season_id, seasonId));
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

      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        code: row.code,
        address: row.address,
        contactInfo: row.contact_info,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        joinedDate: row.joined_date,
        leftDate: row.left_date,
        isActive: row.is_active,
        notes: row.notes
      }));
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
    } catch (error){
      console.error('Error adding player to club:', error);
      return false;
    }
  }

  async removePlayerFromClub(playerId: number, clubId: number): Promise<boolean> {
    try {      await db.execute(sql`
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
          p.id,
          p.display_name,
          p.first_name, 
          p.last_name,
          p.date_of_birth,
          p.position_preferences,
          p.active,
          p.avatar_color,
          cp.joined_date,
          cp.notes as club_notes,
          cp.is_active as is_active_in_club
        FROM players p
        JOIN club_players cp ON p.id = cp.player_id  
        WHERE cp.club_id = ${clubId} AND cp.is_active = true
        ORDER BY p.display_name, p.first_name, p.last_name
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
        avatarColor: row.avatar_color,
        joinedDate: row.joined_date,
        clubNotes: row.club_notes,
        isActiveInClub: row.is_active_in_club
      }));

      return players;
    } catch (error) {
      console.error('Error fetching club players:', error);
      return [];
    }
  }
}

// Create a singleton instance
export const storage = new DatabaseStorage();