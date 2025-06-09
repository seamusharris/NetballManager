import { pgTable, text, serial, integer, boolean, timestamp, json, unique, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Valid netball positions

// Game status model
export const gameStatuses = pgTable("game_statuses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // Internal status name (e.g., 'forfeit-win', 'bye', 'completed')
  displayName: text("display_name").notNull(), // User-friendly display name (e.g., 'Forfeit Win', 'BYE', 'Completed')
  points: integer("points").notNull().default(0), // Points awarded for this status
  opponentPoints: integer("opponent_points").notNull().default(0), // Points awarded to opponent
  teamGoals: integer("team_goals"), // Fixed score for team (null if score comes from statistics)
  opponentGoals: integer("opponent_goals"), // Fixed score for opponent (null if score comes from statistics)
  isCompleted: boolean("is_completed").notNull().default(false), // Whether this status marks a game as finished
  allowsStatistics: boolean("allows_statistics").notNull().default(true), // Whether stats can be recorded
  requiresOpponent: boolean("requires_opponent").notNull().default(true), // Whether this status requires an opponent
  colorClass: text("color_class"), // CSS class for status badge colors
  sortOrder: integer("sort_order").notNull().default(0), // Order for dropdown displays
  isActive: boolean("is_active").notNull().default(true), // Whether this status is currently available
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertGameStatusSchema = createInsertSchema(gameStatuses).omit({ id: true });
export const importGameStatusSchema = createInsertSchema(gameStatuses);
export type InsertGameStatus = z.infer<typeof insertGameStatusSchema>;
export type GameStatus = typeof gameStatuses.$inferSelect;


export const POSITIONS = ["GS", "GA", "WA", "C", "WD", "GD", "GK"] as const;
export type Position = typeof POSITIONS[number];
export const allPositions = [...POSITIONS];

// Season model
export const seasons = pgTable("seasons", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  isActive: boolean("is_active").default(false).notNull(),
  type: text("type"), // Spring, Autumn, etc.
  year: integer("year").notNull(),
  displayOrder: integer("display_order").default(0).notNull()
});

// Default schema without ID for normal creation
export const insertSeasonSchema = createInsertSchema(seasons).omit({ id: true });
// Schema with ID for import operations
export const importSeasonSchema = createInsertSchema(seasons);
export type InsertSeason = z.infer<typeof insertSeasonSchema>;
export type Season = typeof seasons.$inferSelect;

// Legacy game status types are now managed in the game_statuses table
// All game status constants have been moved to the database-driven system

// Player model
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  displayName: text("display_name").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: text("date_of_birth"),
  positionPreferences: json("position_preferences").notNull().$type<Position[]>(),
  active: boolean("active").notNull().default(true),
  avatarColor: text("avatar_color").notNull().default('bg-blue-600'),
});

// Default schema without ID for normal creation
export const insertPlayerSchema = createInsertSchema(players).omit({ id: true });
// Schema with ID for import operations
export const importPlayerSchema = createInsertSchema(players);
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;



// Game model
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  // Team-based system
  homeTeamId: integer("home_team_id").references(() => teams.id),
  awayTeamId: integer("away_team_id").references(() => teams.id),
  venue: text("venue"),
  isInterClub: boolean("is_inter_club").notNull().default(false), // Cross-club games
  statusId: integer("status_id").references(() => gameStatuses.id), // References game_statuses table
  round: text("round"), // Round number in the season or special values like "SF" or "GF"
  seasonId: integer("season_id").references(() => seasons.id), // Reference to season
  notes: text("notes"), // Game notes for recording observations, player performance, etc.
  awardWinnerId: integer("award_winner_id").references(() => players.id), // Player of the match/award winner
});

// Default schema without ID for normal creation
export const insertGameSchema = createInsertSchema(games).omit({ id: true });
// Schema with ID for import operations
export const importGameSchema = createInsertSchema(games);
export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;

// Roster model (positions by quarter)
export const rosters = pgTable("rosters", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull(),
  quarter: integer("quarter").notNull(), // 1-4
  position: text("position").notNull().$type<Position>(),
  playerId: integer("player_id").notNull(),
});

// Default schema without ID for normal creation
export const insertRosterSchema = createInsertSchema(rosters).omit({ id: true });
// Schema with ID for import operations
export const importRosterSchema = createInsertSchema(rosters);
export type InsertRoster = z.infer<typeof insertRosterSchema>;
export type Roster = typeof rosters.$inferSelect;

// Game statistics model - fully position-based with team context
export const gameStats = pgTable("game_stats", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull().references(() => games.id),
  teamId: integer("team_id").notNull().references(() => teams.id),
  position: text("position").$type<Position>().notNull(),
  quarter: integer("quarter").notNull(),
  goalsFor: integer("goals_for").notNull().default(0),
  goalsAgainst: integer("goals_against").notNull().default(0),
  missedGoals: integer("missed_goals").notNull().default(0),
  rebounds: integer("rebounds").notNull().default(0),
  intercepts: integer("intercepts").notNull().default(0),
  badPass: integer("bad_pass").notNull().default(0),
  handlingError: integer("handling_error").notNull().default(0),
  pickUp: integer("pick_up").notNull().default(0),
  infringement: integer("infringement").notNull().default(0),
  rating: integer("rating"), // Position performance rating from 0-10
}, 
// Add unique constraint to ensure we have exactly one stat record per team/position/quarter combo
(table) => {
  return {
    teamPositionQuarterUnique: unique().on(table.gameId, table.teamId, table.position, table.quarter)
  };
});

// Default schema without ID for normal creation
export const insertGameStatSchema = createInsertSchema(gameStats).omit({ id: true });
// Schema with ID for import operations
export const importGameStatSchema = createInsertSchema(gameStats);
export type InsertGameStat = z.infer<typeof insertGameStatSchema>;
export type GameStat = typeof gameStats.$inferSelect;

// Multi-club architecture tables

// Clubs table - organizations that contain teams
export const clubs = pgTable("clubs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  code: text("code").notNull().unique(),
  description: text("description"),
  address: text("address"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").notNull().default('#1f2937'),
  secondaryColor: text("secondary_color").notNull().default('#ffffff'),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertClubSchema = createInsertSchema(clubs).omit({ id: true });
export type InsertClub = z.infer<typeof insertClubSchema>;
export type Club = typeof clubs.$inferSelect;

// Team model (replaces single-team concept)
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  clubId: integer("club_id").notNull().references(() => clubs.id, { onDelete: "cascade" }),
  seasonId: integer("season_id").notNull().references(() => seasons.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // e.g., "Emeralds A"
  division: text("division"), // e.g., "Division 1"
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    clubSeasonNameUnique: unique().on(table.clubId, table.seasonId, table.name)
  };
});

export const insertTeamSchema = createInsertSchema(teams).omit({ id: true });
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teams.$inferSelect;

// Team-player relationships (replaces player_seasons)
export const teamPlayers = pgTable("team_players", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  playerId: integer("player_id").notNull().references(() => players.id, { onDelete: "cascade" }),
  isRegular: boolean("is_regular").notNull().default(true),
  positionPreferences: json("position_preferences").$type<Position[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    teamPlayerUnique: unique().on(table.teamId, table.playerId)
  };
});

export const insertTeamPlayerSchema = createInsertSchema(teamPlayers).omit({ id: true });
export type InsertTeamPlayer = z.infer<typeof insertTeamPlayerSchema>;
export type TeamPlayer = typeof teamPlayers.$inferSelect;

// Club user access control
export const clubUsers = pgTable("club_users", {
  id: serial("id").primaryKey(),
  clubId: integer("club_id").notNull().references(() => clubs.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'admin', 'manager', 'coach', 'viewer'
  canManagePlayers: boolean("can_manage_players").notNull().default(false),
  canManageGames: boolean("can_manage_games").notNull().default(false),
  canManageStats: boolean("can_manage_stats").notNull().default(false),
  canViewOtherTeams: boolean("can_view_other_teams").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    clubUserUnique: unique().on(table.clubId, table.userId)
  };
});

export const insertClubUserSchema = createInsertSchema(clubUsers).omit({ id: true });
export type InsertClubUser = z.infer<typeof insertClubUserSchema>;
export type ClubUser = typeof clubUsers.$inferSelect;

// Player borrowing between teams within the same club
export const playerBorrowing = pgTable("player_borrowing", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull().references(() => games.id, { onDelete: "cascade" }),
  playerId: integer("player_id").notNull().references(() => players.id, { onDelete: "cascade" }),
  borrowingTeamId: integer("borrowing_team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  lendingTeamId: integer("lending_team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  approvedByLendingClub: boolean("approved_by_lending_club").notNull().default(true), // Auto-approved within same club
  approvedByBorrowingClub: boolean("approved_by_borrowing_club").notNull().default(true), // Auto-approved within same club
  jerseyNumber: integer("jersey_number"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    gamePlayerUnique: unique().on(table.gameId, table.playerId)
  };
});

export const insertPlayerBorrowingSchema = createInsertSchema(playerBorrowing).omit({ id: true });
export type InsertPlayerBorrowing = z.infer<typeof insertPlayerBorrowingSchema>;
export type PlayerBorrowing = typeof playerBorrowing.$inferSelect;

// Game permissions for cross-club access
export const gamePermissions = pgTable("game_permissions", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull().references(() => games.id, { onDelete: "cascade" }),
  clubId: integer("club_id").notNull().references(() => clubs.id, { onDelete: "cascade" }),
  canEditStats: boolean("can_edit_stats").notNull().default(false),
  canViewDetailedStats: boolean("can_view_detailed_stats").notNull().default(true),
}, (table) => {
  return {
    gameClubUnique: unique().on(table.gameId, table.clubId)
  };
});

export const insertGamePermissionSchema = createInsertSchema(gamePermissions).omit({ id: true });
export type InsertGamePermission = z.infer<typeof insertGamePermissionSchema>;
export type GamePermission = typeof gamePermissions.$inferSelect;

// Official game scores table - authoritative scoring system
export const gameScores = pgTable("game_scores", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull().references(() => games.id, { onDelete: "cascade" }),
  homeTeamQ1: integer("home_team_q1").notNull().default(0),
  homeTeamQ2: integer("home_team_q2").notNull().default(0),
  homeTeamQ3: integer("home_team_q3").notNull().default(0),
  homeTeamQ4: integer("home_team_q4").notNull().default(0),
  awayTeamQ1: integer("away_team_q1").notNull().default(0),
  awayTeamQ2: integer("away_team_q2").notNull().default(0),
  awayTeamQ3: integer("away_team_q3").notNull().default(0),
  awayTeamQ4: integer("away_team_q4").notNull().default(0),
  homeTeamTotal: integer("home_team_total").notNull().default(0),
  awayTeamTotal: integer("away_team_total").notNull().default(0),
  enteredBy: integer("entered_by").references(() => users.id), // Who entered the official scores
  enteredAt: timestamp("entered_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  notes: text("notes"), // Any notes about the official scoring
}, (table) => {
  return {
    gameUnique: unique().on(table.gameId) // One official score per game
  };
});

export const insertGameScoreSchema = createInsertSchema(gameScores).omit({ id: true });
export type InsertGameScore = z.infer<typeof insertGameScoreSchema>;
export type GameScore = typeof gameScores.$inferSelect;

// Club-player direct relationships
export const clubPlayers = pgTable("club_players", {
  id: serial("id").primaryKey(),
  clubId: integer("club_id").notNull().references(() => clubs.id, { onDelete: "cascade" }),
  playerId: integer("player_id").notNull().references(() => players.id, { onDelete: "cascade" }),
  joinedDate: date("joined_date").defaultNow(),
  leftDate: date("left_date"),
  isActive: boolean("is_active").notNull().default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    clubPlayerUnique: unique().on(table.clubId, table.playerId)
  };
});

export const insertClubPlayerSchema = createInsertSchema(clubPlayers).omit({ id: true });
export type InsertClubPlayer = z.infer<typeof insertClubPlayerSchema>;
export type ClubPlayer = typeof clubPlayers.$inferSelect;

// User model (extending from existing model)
// Player-season relationship (DEPRECATED - replaced by team_players)
export const playerSeasons = pgTable("player_seasons", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().references(() => players.id, { onDelete: "cascade" }),
  seasonId: integer("season_id").notNull().references(() => seasons.id, { onDelete: "cascade" }),
}, (table) => {
  return {
    playerSeasonUnique: unique().on(table.playerId, table.seasonId)
  };
});

export const insertPlayerSeasonSchema = createInsertSchema(playerSeasons).omit({ id: true });
export const importPlayerSeasonSchema = createInsertSchema(playerSeasons);
export type InsertPlayerSeason = z.infer<typeof insertPlayerSeasonSchema>;
export type PlayerSeason = typeof playerSeasons.$inferSelect;

// Player availability table for storing which players are available for each game
export const playerAvailability = pgTable("player_availability", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull().references(() => games.id, { onDelete: "cascade" }),
  playerId: integer("player_id").notNull().references(() => players.id, { onDelete: "cascade" }),
  isAvailable: boolean("is_available").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    gamePlayerUnique: unique().on(table.gameId, table.playerId)
  };
});

export const insertPlayerAvailabilitySchema = createInsertSchema(playerAvailability).omit({ id: true });
export const importPlayerAvailabilitySchema = createInsertSchema(playerAvailability);
export type InsertPlayerAvailability = z.infer<typeof insertPlayerAvailabilitySchema>;
export type PlayerAvailability = typeof playerAvailability.$inferSelect;

// Define relations
export const gameStatusesRelations = relations(gameStatuses, ({ many }) => ({
  games: many(games)
}));

export const seasonsRelations = relations(seasons, ({ many }) => ({
  games: many(games),
  playerSeasons: many(playerSeasons)
}));

export const playersRelations = relations(players, ({ many }) => ({
  playerSeasons: many(playerSeasons)
}));

export const playerSeasonsRelations = relations(playerSeasons, ({ one }) => ({
  player: one(players, {
    fields: [playerSeasons.playerId],
    references: [players.id],
  }),
  season: one(seasons, {
    fields: [playerSeasons.seasonId],
    references: [seasons.id],
  }),
}));

export const gamesRelations = relations(games, ({ one }) => ({
  gameStatus: one(gameStatuses, {
    fields: [games.statusId],
    references: [gameStatuses.id],
  }),
}));

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;


// Official game scores table - independent of statistics
export const gameScores = pgTable("game_scores", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull().references(() => games.id, { onDelete: "cascade" }),
  quarter: integer("quarter").notNull(), // 1-4
  homeScore: integer("home_score").notNull().default(0),
  awayScore: integer("away_score").notNull().default(0),
  isOfficial: boolean("is_official").notNull().default(true), // Mark as official vs calculated
  enteredBy: integer("entered_by").references(() => users.id), // Who entered these scores
  enteredAt: timestamp("entered_at").defaultNow().notNull(),
  notes: text("notes"), // Optional notes about the quarter
}, (table) => {
  return {
    gameQuarterUnique: unique().on(table.gameId, table.quarter)
  };
});

export const insertGameScoreSchema = createInsertSchema(gameScores).omit({ id: true });
export type InsertGameScore = z.infer<typeof insertGameScoreSchema>;
export type GameScore = typeof gameScores.$inferSelect;
