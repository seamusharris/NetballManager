import { pgTable, text, serial, integer, boolean, timestamp, json, unique, date, varchar, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// --- Accurate interfaces based on DB schema ---
// NOTE: Use a case translation utility to convert between camelCase (frontend) and snake_case (backend API)

export interface Division {
  id: number;
  ageGroupId: number;
  seasonId: number;
  displayName: string;
  isActive: boolean;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface Section {
  id: number;
  seasonId: number;
  ageGroup: string;
  sectionName: string;
  displayName: string;
  isActive: boolean;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  teamCount?: number; // Optional, for endpoints that include it
}

export interface AgeGroup {
  id: number;
  seasonId: number;
  name: string;
  displayName: string;
  isActive: boolean;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

// Valid netball positions

// Game status model
export const gameStatuses = pgTable("game_statuses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // Internal status name (e.g., 'forfeit-win', 'bye', 'completed')
  display_name: text("display_name").notNull(), // User-friendly display name (e.g., 'Forfeit Win', 'BYE', 'Completed')
  points: integer("points").notNull().default(0), // Points awarded for this status
  opponent_points: integer("opponent_points").notNull().default(0), // Points awarded to opponent
  home_team_goals: integer("home_team_goals"), // Fixed score for home team (null if score comes from statistics)
  away_team_goals: integer("away_team_goals"), // Fixed score for away team (null if score comes from statistics)
  is_completed: boolean("is_completed").notNull().default(false), // Whether this status marks a game as finished
  allows_statistics: boolean("allows_statistics").notNull().default(true), // Whether stats can be recorded
  requires_opponent: boolean("requires_opponent").notNull().default(true), // Whether this status requires an opponent
  color_class: text("color_class"), // CSS class for status badge colors
  sort_order: integer("sort_order").notNull().default(0), // Order for dropdown displays
  is_active: boolean("is_active").notNull().default(true), // Whether this status is currently available
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const insertGameStatusSchema = createInsertSchema(gameStatuses).omit({ id: true });
export type GameStatus = typeof gameStatuses.$inferSelect;


export const POSITIONS = ["GS", "GA", "WA", "C", "WD", "GD", "GK"] as const;
export type Position = typeof POSITIONS[number];
export const allPositions = [...POSITIONS];

// Season model
export const seasons = pgTable("seasons", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  start_date: date("start_date").notNull(),
  end_date: date("end_date").notNull(),
  is_active: boolean("is_active").default(false).notNull(),
  type: text("type"), // Spring, Autumn, etc.
  year: integer("year").notNull(),
  display_order: integer("display_order").default(0).notNull()
});

// Default schema without ID for normal creation
export const insertSeasonSchema = createInsertSchema(seasons).omit({ id: true });
export type InsertSeason = z.infer<typeof insertSeasonSchema>;
export type Season = typeof seasons.$inferSelect;

// Legacy game status types are now managed in the game_statuses table
// All game status constants have been moved to the database-driven system

// Player model
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  display_name: text("display_name").notNull(),
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
  date_of_birth: text("date_of_birth"),
  position_preferences: json("position_preferences").notNull().$type<Position[]>(),
  active: boolean("active").notNull().default(true),
  avatar_color: text("avatar_color").notNull().default('bg-blue-600'),
});

// Default schema without ID for normal creation
export const insertPlayerSchema = createInsertSchema(players).omit({ id: true }).refine(
  (data) => {
    // Validate position preferences are valid positions
    if (data.position_preferences && Array.isArray(data.position_preferences)) {
      return data.position_preferences.every(pos => POSITIONS.includes(pos as Position));
    }
    return true;
  },
  {
    message: "Invalid position preferences. Must be valid netball positions.",
    path: ["position_preferences"]
  }
);
// Schema with ID for import operations
export const importPlayerSchema = createInsertSchema(players).refine(
  (data) => {
    // Validate position preferences are valid positions
    if (data.position_preferences && Array.isArray(data.position_preferences)) {
      return data.position_preferences.every(pos => POSITIONS.includes(pos as Position));
    }
    return true;
  },
  {
    message: "Invalid position preferences. Must be valid netball positions.",
    path: ["position_preferences"]
  }
);
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;



// Game model
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  // Team-based system
  home_team_id: integer("home_team_id").references(() => teams.id),
  away_team_id: integer("away_team_id").references(() => teams.id),
  venue: text("venue"),
  is_inter_club: boolean("is_inter_club").notNull().default(false), // Cross-club games
  status_id: integer("status_id").references(() => gameStatuses.id), // References game_statuses table
  round: text("round"), // Round number in the season or special values like "SF" or "GF"
  season_id: integer("season_id").references(() => seasons.id), // Reference to season
  notes: text("notes"), // Game notes for recording observations, player performance, etc.
  award_winner_id: integer("award_winner_id").references(() => players.id), // Player of the match/award winner
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
  game_id: integer("game_id").notNull(),
  quarter: integer("quarter").notNull(), // 1-4
  position: text("position").notNull().$type<Position>(),
  player_id: integer("player_id").notNull(),
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
  game_id: integer("game_id").notNull().references(() => games.id),
  team_id: integer("team_id").notNull().references(() => teams.id),
  position: text("position").$type<Position>().notNull(),
  quarter: integer("quarter").notNull(),
  goals_for: integer("goals_for").notNull().default(0),
  goals_against: integer("goals_against").notNull().default(0),
  missed_goals: integer("missed_goals").notNull().default(0),
  rebounds: integer("rebounds").notNull().default(0),
  intercepts: integer("intercepts").notNull().default(0),
  // New statistics columns
  deflections: integer("deflections").notNull().default(0),
  turnovers: integer("turnovers").notNull().default(0),
  gains: integer("gains").notNull().default(0),
  receives: integer("receives").notNull().default(0),
  penalties: integer("penalties").notNull().default(0),
  rating: integer("rating"), // Position performance rating from 0-10
}, 
// Add unique constraint to ensure we have exactly one stat record per team/position/quarter combo
(table) => {
  return {
    team_position_quarter_unique: unique().on(table.game_id, table.team_id, table.position, table.quarter)
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
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const clubs = pgTable("clubs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  code: text("code").notNull().unique(),
  address: text("address"),
  contact_email: text("contact_email"),
  contact_phone: text("contact_phone"),
  logo_url: text("logo_url"),
  primary_color: text("primary_color").notNull().default('#1f2937'),
  secondary_color: text("secondary_color").notNull().default('#ffffff'),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const insertClubSchema = createInsertSchema(clubs).omit({ id: true });
export type Club = typeof clubs.$inferSelect;

// Age groups table - reusable age categories across seasons
export const ageGroups = pgTable("age_groups", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(), // e.g., "15U", "13U", "Open"
  display_name: varchar("display_name", { length: 20 }).notNull(), // e.g., "15 & Under", "13 & Under", "Open"
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Divisions table - combines age_group + season (no section)
export const divisions = pgTable("divisions", {
  id: serial("id").primaryKey(),
  age_group_id: integer("age_group_id").notNull().references(() => ageGroups.id, { onDelete: "cascade" }),
  section_id: integer("section_id").notNull().references(() => sections.id, { onDelete: "cascade" }), // <-- Added
  season_id: integer("season_id").notNull().references(() => seasons.id, { onDelete: "cascade" }),
  display_name: varchar("display_name", { length: 50 }).notNull(), // e.g., "15U/1", "13U/2"
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    age_group_season_unique: unique().on(table.age_group_id, table.season_id)
  };
});

// Team model (replaces single-team concept)
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  club_id: integer("club_id").notNull().references(() => clubs.id, { onDelete: "cascade" }),
  season_id: integer("season_id").notNull().references(() => seasons.id, { onDelete: "cascade" }),
  division_id: integer("division_id").references(() => divisions.id, { onDelete: "set null" }), // References the new divisions table
  name: text("name").notNull(), // e.g., "Emeralds A"
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    club_season_name_unique: unique().on(table.club_id, table.season_id, table.name)
  };
});

export const insertAgeGroupSchema = createInsertSchema(ageGroups).omit({ id: true });
// export type AgeGroup = typeof ageGroups.$inferSelect;

export const insertDivisionSchema = createInsertSchema(divisions).omit({ id: true });
// export type Division = typeof divisions.$inferSelect;

export const insertTeamSchema = createInsertSchema(teams).omit({ id: true });
export type Team = typeof teams.$inferSelect;

// Team-player relationships (replaces player_seasons)
export const teamPlayers = pgTable("team_players", {
  id: serial("id").primaryKey(),
  team_id: integer("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  player_id: integer("player_id").notNull().references(() => players.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    team_player_unique: unique().on(table.team_id, table.player_id)
  };
});

export const insertTeamPlayerSchema = createInsertSchema(teamPlayers).omit({ id: true });


// Club user access control
export const clubUsers = pgTable("club_users", {
  id: serial("id").primaryKey(),
  club_id: integer("club_id").notNull().references(() => clubs.id, { onDelete: "cascade" }),
  user_id: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'admin', 'manager', 'coach', 'viewer'
  can_manage_players: boolean("can_manage_players").notNull().default(false),
  can_manage_games: boolean("can_manage_games").notNull().default(false),
  can_manage_stats: boolean("can_manage_stats").notNull().default(false),
  can_view_other_teams: boolean("can_view_other_teams").notNull().default(false),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    club_user_unique: unique().on(table.club_id, table.user_id)
  };
});

export const insertClubUserSchema = createInsertSchema(clubUsers).omit({ id: true });


// Player borrowing between teams within the same club
export const playerBorrowing = pgTable("player_borrowing", {
  id: serial("id").primaryKey(),
  game_id: integer("game_id").notNull().references(() => games.id, { onDelete: "cascade" }),
  player_id: integer("player_id").notNull().references(() => players.id, { onDelete: "cascade" }),
  borrowing_team_id: integer("borrowing_team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  lending_team_id: integer("lending_team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  approved_by_lending_club: boolean("approved_by_lending_club").notNull().default(true), // Auto-approved within same club
  approved_by_borrowing_club: boolean("approved_by_borrowing_club").notNull().default(true), // Auto-approved within same club
  jersey_number: integer("jersey_number"),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    game_player_unique: unique().on(table.game_id, table.player_id)
  };
});

export const insertPlayerBorrowingSchema = createInsertSchema(playerBorrowing).omit({ id: true });
export type InsertPlayerBorrowing = z.infer<typeof insertPlayerBorrowingSchema>;
export type PlayerBorrowing = typeof playerBorrowing.$inferSelect;

// Game permissions for cross-club access
export const gamePermissions = pgTable("game_permissions", {
  id: serial("id").primaryKey(),
  game_id: integer("game_id").notNull().references(() => games.id, { onDelete: "cascade" }),
  club_id: integer("club_id").notNull().references(() => clubs.id, { onDelete: "cascade" }),
  can_edit_stats: boolean("can_edit_stats").notNull().default(false),
  can_view_detailed_stats: boolean("can_view_detailed_stats").notNull().default(true),
}, (table) => {
  return {
    game_club_unique: unique().on(table.game_id, table.club_id)
  };
});

export const insertGamePermissionSchema = createInsertSchema(gamePermissions).omit({ id: true });
export type InsertGamePermission = z.infer<typeof insertGamePermissionSchema>;
export type GamePermission = typeof gamePermissions.$inferSelect;

// Official game scores table - team-based scoring system
export const gameScores = pgTable("game_scores", {
  id: serial("id").primaryKey(),
  game_id: integer("game_id").notNull().references(() => games.id, { onDelete: "cascade" }),
  team_id: integer("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  quarter: integer("quarter").notNull(), // 1-4
  score: integer("score").notNull().default(0),
  entered_by: integer("entered_by").references(() => users.id), // Who entered the official scores
  entered_at: timestamp("entered_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  notes: text("notes"), // Any notes about the quarter scoring
}, (table) => {
  return {
    game_team_quarter_unique: unique().on(table.game_id, table.team_id, table.quarter) // One score per game/team/quarter
  };
});

export const insertGameScoreSchema = createInsertSchema(gameScores).omit({ id: true });
export type InsertGameScore = z.infer<typeof insertGameScoreSchema>;
export type GameScore = typeof gameScores.$inferSelect;

// Club-player direct relationships
export const clubPlayers = pgTable("club_players", {
  id: serial("id").primaryKey(),
  club_id: integer("club_id").notNull().references(() => clubs.id, { onDelete: "cascade" }),
  player_id: integer("player_id").notNull().references(() => players.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    club_player_unique: unique().on(table.club_id, table.player_id)
  };
});

export const insertClubPlayerSchema = createInsertSchema(clubPlayers).omit({ id: true });
export type InsertClubPlayer = z.infer<typeof insertClubPlayerSchema>;
export type ClubPlayer = typeof clubPlayers.$inferSelect;

// User model (extending from existing model)
// Player-season relationship (DEPRECATED - replaced by team_players)
export const playerSeasons = pgTable("player_seasons", {
  id: serial("id").primaryKey(),
  player_id: integer("player_id").notNull().references(() => players.id, { onDelete: "cascade" }),
  season_id: integer("season_id").notNull().references(() => seasons.id, { onDelete: "cascade" }),
}, (table) => {
  return {
    player_season_unique: unique().on(table.player_id, table.season_id)
  };
});

export const insertPlayerSeasonSchema = createInsertSchema(playerSeasons).omit({ id: true });
export const importPlayerSeasonSchema = createInsertSchema(playerSeasons);
export type InsertPlayerSeason = z.infer<typeof insertPlayerSeasonSchema>;
export type PlayerSeason = typeof playerSeasons.$inferSelect;

// Player availability table for storing which players are available for each game
export const playerAvailability = pgTable("player_availability", {
  id: serial("id").primaryKey(),
  game_id: integer("game_id").notNull().references(() => games.id, { onDelete: "cascade" }),
  player_id: integer("player_id").notNull().references(() => players.id, { onDelete: "cascade" }),
  is_available: boolean("is_available").notNull().default(true),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    game_player_unique: unique().on(table.game_id, table.player_id)
  };
});

export const insertPlayerAvailabilitySchema = createInsertSchema(playerAvailability).omit({ id: true });
export const importPlayerAvailabilitySchema = createInsertSchema(playerAvailability);
export type InsertPlayerAvailability = z.infer<typeof insertPlayerAvailabilitySchema>;
export type PlayerAvailability = typeof playerAvailability.$inferSelect;

export const byeTeam = pgTable('bye_team', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().default('BYE'),
  club_id: integer('club_id').references(() => clubs.id).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const teamGameNotes = pgTable('team_game_notes', {
  id: serial('id').primaryKey(),
  game_id: integer('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }),
  team_id: integer('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  notes: text('notes'),
  entered_by: integer('entered_by').default(1),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  unique_game_team: uniqueIndex('unique_game_team_notes').on(table.game_id, table.team_id),
}));

export const teamGameAwards = pgTable('team_game_awards', {
  id: serial('id').primaryKey(),
  game_id: integer('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }),
  team_id: integer('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  player_id: integer('player_id').notNull().references(() => players.id, { onDelete: 'cascade' }),
  award_type: varchar('award_type', { length: 50 }).default('player_of_match').notNull(),
  entered_by: integer('entered_by').default(1),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  unique_game_team_award: uniqueIndex('unique_game_team_award').on(table.game_id, table.team_id, table.award_type),
}));

export type ByeTeam = typeof byeTeam.$inferSelect;
export type NewByeTeam = typeof byeTeam.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type TeamGameNotes = typeof teamGameNotes.$inferSelect;
export type NewTeamGameNotes = typeof teamGameNotes.$inferInsert;

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
    fields: [playerSeasons.player_id],
    references: [players.id],
  }),
  season: one(seasons, {
    fields: [playerSeasons.season_id],
    references: [seasons.id],
  }),
}));

export const gamesRelations = relations(games, ({ one }) => ({
  gameStatus: one(gameStatuses, {
    fields: [games.status_id],
    references: [gameStatuses.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  name: true,
});






// Player playing times table for storing quarter-by-quarter time data
export const playerPlayingTimes = pgTable("player_playing_times", {
  id: serial("id").primaryKey(),
  game_id: integer("game_id").notNull().references(() => games.id, { onDelete: "cascade" }),
  player_id: integer("player_id").notNull().references(() => players.id, { onDelete: "cascade" }),
  quarter: integer("quarter").notNull(), // 1-4
  time_in_seconds: integer("time_in_seconds").notNull().default(0), // Playing time for this quarter
  position: text("position").$type<Position>(), // Position played in this quarter
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    game_player_quarter_unique: unique().on(table.game_id, table.player_id, table.quarter)
  };
});

export const insertPlayerPlayingTimeSchema = createInsertSchema(playerPlayingTimes).omit({ id: true });
export type InsertPlayerPlayingTime = z.infer<typeof insertPlayerPlayingTimeSchema>;
export type PlayerPlayingTime = typeof playerPlayingTimes.$inferSelect;

// Sections table - groups teams within a season and age group
export const sections = pgTable("sections", {
  id: serial("id").primaryKey(),
  season_id: integer("season_id").notNull().references(() => seasons.id, { onDelete: "cascade" }),
  age_group: varchar("age_group", { length: 10 }).notNull(), // e.g., "15U"
  section_name: varchar("section_name", { length: 20 }).notNull(), // e.g., "1", "2"
  display_name: varchar("display_name", { length: 50 }).notNull(), // e.g., "15U/1"
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSectionSchema = createInsertSchema(sections).omit({ id: true });
export type InsertSection = z.infer<typeof insertSectionSchema>;
export type SectionDb = typeof sections.$inferSelect;