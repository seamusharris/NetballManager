import { 
  users, type User, type InsertUser,
  players, type Player, type InsertPlayer, 
  opponents, type Opponent, type InsertOpponent,
  games, type Game, type InsertGame,
  rosters, type Roster, type InsertRoster,
  gameStats, type GameStat, type InsertGameStat,
  type Position
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private players: Map<number, Player>;
  private opponents: Map<number, Opponent>;
  private games: Map<number, Game>;
  private rosters: Map<number, Roster>;
  private gameStats: Map<number, GameStat>;
  
  private currentUserId: number;
  private currentPlayerId: number;
  private currentOpponentId: number;
  private currentGameId: number;
  private currentRosterId: number;
  private currentGameStatId: number;

  constructor() {
    this.users = new Map();
    this.players = new Map();
    this.opponents = new Map();
    this.games = new Map();
    this.rosters = new Map();
    this.gameStats = new Map();
    
    this.currentUserId = 1;
    this.currentPlayerId = 1;
    this.currentOpponentId = 1;
    this.currentGameId = 1;
    this.currentRosterId = 1;
    this.currentGameStatId = 1;

    // Add sample opponents data
    this.createOpponent({
      teamName: "Thunder Netball",
      primaryContact: "Jane Smith",
      contactInfo: "coach@thundernetball.com"
    });
    
    this.createOpponent({
      teamName: "Lightning Strikers",
      primaryContact: "Mike Johnson",
      contactInfo: "mike@lightningstrikers.com"
    });
    
    this.createOpponent({
      teamName: "Phoenix Jets",
      primaryContact: "Sarah Williams",
      contactInfo: "coach@phoenixjets.com"
    });
    
    this.createOpponent({
      teamName: "Elite Stars",
      primaryContact: "Tom Davis",
      contactInfo: "coach@elitestars.com"
    });
    
    this.createOpponent({
      teamName: "Blaze Netball",
      primaryContact: "Lucy Brown",
      contactInfo: "lucy@blazenetball.com"
    });
    
    this.createOpponent({
      teamName: "Swift Arrows",
      primaryContact: "Kevin Wilson",
      contactInfo: "coach@swiftarrows.com"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Player methods
  async getPlayers(): Promise<Player[]> {
    return Array.from(this.players.values());
  }

  async getPlayer(id: number): Promise<Player | undefined> {
    return this.players.get(id);
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const id = this.currentPlayerId++;
    // Ensure we have the correct types for positionPreferences
    const player: Player = { 
      ...insertPlayer, 
      id,
      active: insertPlayer.active ?? true,
      positionPreferences: insertPlayer.positionPreferences as Position[]
    };
    this.players.set(id, player);
    return player;
  }

  async updatePlayer(id: number, updatePlayer: Partial<InsertPlayer>): Promise<Player | undefined> {
    const player = this.players.get(id);
    if (!player) return undefined;
    
    // Type cast to ensure we maintain proper typing
    const updatedPlayer: Player = { 
      ...player, 
      ...updatePlayer,
      positionPreferences: (updatePlayer.positionPreferences as Position[]) || player.positionPreferences
    };
    this.players.set(id, updatedPlayer);
    return updatedPlayer;
  }

  async deletePlayer(id: number): Promise<boolean> {
    return this.players.delete(id);
  }

  // Opponent methods
  async getOpponents(): Promise<Opponent[]> {
    return Array.from(this.opponents.values());
  }

  async getOpponent(id: number): Promise<Opponent | undefined> {
    return this.opponents.get(id);
  }

  async createOpponent(insertOpponent: InsertOpponent): Promise<Opponent> {
    const id = this.currentOpponentId++;
    const opponent: Opponent = { 
      ...insertOpponent, 
      id,
      primaryContact: insertOpponent.primaryContact || null,
      contactInfo: insertOpponent.contactInfo || null
    };
    this.opponents.set(id, opponent);
    return opponent;
  }

  async updateOpponent(id: number, updateOpponent: Partial<InsertOpponent>): Promise<Opponent | undefined> {
    const opponent = this.opponents.get(id);
    if (!opponent) return undefined;
    
    const updatedOpponent = { ...opponent, ...updateOpponent };
    this.opponents.set(id, updatedOpponent);
    return updatedOpponent;
  }

  async deleteOpponent(id: number): Promise<boolean> {
    return this.opponents.delete(id);
  }

  // Game methods
  async getGames(): Promise<Game[]> {
    return Array.from(this.games.values());
  }

  async getGame(id: number): Promise<Game | undefined> {
    return this.games.get(id);
  }

  async createGame(insertGame: InsertGame): Promise<Game> {
    const id = this.currentGameId++;
    const game: Game = { 
      ...insertGame, 
      id,
      completed: insertGame.completed ?? false 
    };
    this.games.set(id, game);
    return game;
  }

  async updateGame(id: number, updateGame: Partial<InsertGame>): Promise<Game | undefined> {
    const game = this.games.get(id);
    if (!game) return undefined;
    
    const updatedGame = { ...game, ...updateGame };
    this.games.set(id, updatedGame);
    return updatedGame;
  }

  async deleteGame(id: number): Promise<boolean> {
    return this.games.delete(id);
  }

  // Roster methods
  async getRostersByGame(gameId: number): Promise<Roster[]> {
    return Array.from(this.rosters.values()).filter(roster => roster.gameId === gameId);
  }

  async getRoster(id: number): Promise<Roster | undefined> {
    return this.rosters.get(id);
  }

  async createRoster(insertRoster: InsertRoster): Promise<Roster> {
    const id = this.currentRosterId++;
    const roster: Roster = { 
      ...insertRoster, 
      id,
      position: insertRoster.position as Position 
    };
    this.rosters.set(id, roster);
    return roster;
  }

  async updateRoster(id: number, updateRoster: Partial<InsertRoster>): Promise<Roster | undefined> {
    const roster = this.rosters.get(id);
    if (!roster) return undefined;
    
    const updatedRoster: Roster = { 
      ...roster, 
      ...updateRoster,
      position: (updateRoster.position as Position) || roster.position
    };
    this.rosters.set(id, updatedRoster);
    return updatedRoster;
  }

  async deleteRoster(id: number): Promise<boolean> {
    return this.rosters.delete(id);
  }

  async deleteRostersByGame(gameId: number): Promise<boolean> {
    let success = true;
    
    for (const [id, roster] of this.rosters.entries()) {
      if (roster.gameId === gameId) {
        const deleted = this.rosters.delete(id);
        if (!deleted) success = false;
      }
    }
    
    return success;
  }

  // Game Stats methods
  async getGameStatsByGame(gameId: number): Promise<GameStat[]> {
    return Array.from(this.gameStats.values()).filter(stat => stat.gameId === gameId);
  }

  async getGameStat(id: number): Promise<GameStat | undefined> {
    return this.gameStats.get(id);
  }

  async createGameStat(insertGameStat: InsertGameStat): Promise<GameStat> {
    const id = this.currentGameStatId++;
    const gameStat: GameStat = { 
      ...insertGameStat, 
      id,
      goalsFor: insertGameStat.goalsFor ?? 0,
      goalsAgainst: insertGameStat.goalsAgainst ?? 0,
      missedGoals: insertGameStat.missedGoals ?? 0,
      rebounds: insertGameStat.rebounds ?? 0,
      intercepts: insertGameStat.intercepts ?? 0,
      badPass: insertGameStat.badPass ?? 0,
      handlingError: insertGameStat.handlingError ?? 0,
      pickUp: insertGameStat.pickUp ?? 0,
      infringement: insertGameStat.infringement ?? 0
    };
    this.gameStats.set(id, gameStat);
    return gameStat;
  }

  async updateGameStat(id: number, updateGameStat: Partial<InsertGameStat>): Promise<GameStat | undefined> {
    const gameStat = this.gameStats.get(id);
    if (!gameStat) return undefined;
    
    const updatedGameStat = { ...gameStat, ...updateGameStat };
    this.gameStats.set(id, updatedGameStat);
    return updatedGameStat;
  }

  async deleteGameStat(id: number): Promise<boolean> {
    return this.gameStats.delete(id);
  }

  async deleteGameStatsByGame(gameId: number): Promise<boolean> {
    let success = true;
    
    for (const [id, stat] of this.gameStats.entries()) {
      if (stat.gameId === gameId) {
        const deleted = this.gameStats.delete(id);
        if (!deleted) success = false;
      }
    }
    
    return success;
  }
}

export const storage = new MemStorage();
