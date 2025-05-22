import { pgTable, text, serial, integer, boolean, timestamp, json, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Valid netball positions
export const POSITIONS = ["GS", "GA", "WA", "C", "WD", "GD", "GK"] as const;
export type Position = typeof POSITIONS[number];
export const allPositions = [...POSITIONS];

// Game status types
export const GAME_STATUSES = ["upcoming", "in-progress", "completed", "forfeit-win", "forfeit-loss"] as const;
export type GameStatus = typeof GAME_STATUSES[number];
export const allGameStatuses = [...GAME_STATUSES];

// Player model
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  displayName: text("display_name").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: text("date_of_birth"),
  positionPreferences: json("position_preferences").notNull().$type<Position[]>(),
  active: boolean("active").notNull().default(true),
  avatarColor: text("avatar_color"),
});

// Default schema without ID for normal creation
export const insertPlayerSchema = createInsertSchema(players).omit({ id: true });
// Schema with ID for import operations
export const importPlayerSchema = createInsertSchema(players);
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;

// Opponent model
export const opponents = pgTable("opponents", {
  id: serial("id").primaryKey(),
  teamName: text("team_name").notNull().unique(),
  primaryContact: text("primary_contact"),
  contactInfo: text("contact_info"),
});

// Default schema without ID for normal creation
export const insertOpponentSchema = createInsertSchema(opponents).omit({ id: true });
// Schema with ID for import operations
export const importOpponentSchema = createInsertSchema(opponents);
export type InsertOpponent = z.infer<typeof insertOpponentSchema>;
export type Opponent = typeof opponents.$inferSelect;

// Game model
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  opponentId: integer("opponent_id"), // Nullable for BYE games
  completed: boolean("completed").notNull().default(false), // Legacy field, kept for backward compatibility
  status: text("status").$type<GameStatus>().default("upcoming"), // New field for more detailed game status
  isBye: boolean("is_bye").notNull().default(false),
  round: text("round"), // Round number in the season or special values like "SF" or "GF"
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

// Game statistics model - fully position-based
export const gameStats = pgTable("game_stats", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull(),
  position: text("position").$type<Position>().notNull(), // Position is the primary organizing concept
  quarter: integer("quarter").notNull(), // 1-4
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
// Add unique constraint to ensure we have exactly one stat record per position/quarter combo
(table) => {
  return {
    positionQuarterUnique: unique().on(table.gameId, table.position, table.quarter)
  };
});

// Default schema without ID for normal creation
export const insertGameStatSchema = createInsertSchema(gameStats).omit({ id: true });
// Schema with ID for import operations
export const importGameStatSchema = createInsertSchema(gameStats);
export type InsertGameStat = z.infer<typeof insertGameStatSchema>;
export type GameStat = typeof gameStats.$inferSelect;

// User model (extending from existing model)
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
