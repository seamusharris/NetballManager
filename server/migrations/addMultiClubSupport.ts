/**
 * Migration to add multi-club support tables and columns
 * This will add the new tables for clubs, teams, team_players, etc.
 */

import { db } from '../db';
import { sql } from 'drizzle-orm';
import { log } from '../vite';

export async function addMultiClubSupport(): Promise<void> {
  try {
    log("Starting multi-club support migration", "migration");

    // Check if home_team_id column already exists
    const homeTeamIdExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'games'
        AND column_name = 'home_team_id'
      );
    `);

    if (homeTeamIdExists.rows[0].exists) {
      log("Multi-club columns already exist, skipping migration", "migration");
      return;
    }

    // Create clubs table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS clubs (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        code TEXT NOT NULL UNIQUE,
        address TEXT,
        contact_email TEXT,
        contact_phone TEXT,
        logo_url TEXT,
        primary_color TEXT NOT NULL DEFAULT '#1f2937',
        secondary_color TEXT NOT NULL DEFAULT '#ffffff',
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    log("Created clubs table", "migration");

    // Create teams table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        club_id INTEGER NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
        season_id INTEGER NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        division TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        UNIQUE(club_id, season_id, name)
      )
    `);
    log("Created teams table", "migration");

    // Create team_players table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS team_players (
        id SERIAL PRIMARY KEY,
        team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
        is_regular BOOLEAN NOT NULL DEFAULT true,
        jersey_number INTEGER,
        position_preferences JSON,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        UNIQUE(team_id, player_id)
      )
    `);
    log("Created team_players table", "migration");

    // Create club_users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS club_users (
        id SERIAL PRIMARY KEY,
        club_id INTEGER NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role TEXT NOT NULL,
        can_manage_players BOOLEAN NOT NULL DEFAULT false,
        can_manage_games BOOLEAN NOT NULL DEFAULT false,
        can_manage_stats BOOLEAN NOT NULL DEFAULT false,
        can_view_other_teams BOOLEAN NOT NULL DEFAULT false,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        UNIQUE(club_id, user_id)
      )
    `);
    log("Created club_users table", "migration");

    // Create player_borrowing table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS player_borrowing (
        id SERIAL PRIMARY KEY,
        game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
        player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
        borrowing_team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        lending_team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        approved_by_lending_club BOOLEAN NOT NULL DEFAULT false,
        approved_by_borrowing_club BOOLEAN NOT NULL DEFAULT false,
        jersey_number INTEGER,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        UNIQUE(game_id, player_id)
      )
    `);
    log("Created player_borrowing table", "migration");

    // Create game_permissions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS game_permissions (
        id SERIAL PRIMARY KEY,
        game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
        club_id INTEGER NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
        can_edit_stats BOOLEAN NOT NULL DEFAULT false,
        can_view_detailed_stats BOOLEAN NOT NULL DEFAULT true,
        UNIQUE(game_id, club_id)
      )
    `);
    log("Created game_permissions table", "migration");

    // Add team references to games table
    await db.execute(sql`
      ALTER TABLE games 
      ADD COLUMN home_team_id INTEGER REFERENCES teams(id),
      ADD COLUMN away_team_id INTEGER REFERENCES teams(id),
      ADD COLUMN is_inter_club BOOLEAN NOT NULL DEFAULT false
    `);
    log("Added team columns to games table", "migration");

    log("Multi-club support migration completed successfully", "migration");
  } catch (error) {
    log(`Error in multi-club support migration: ${error}`, "migration");
    throw error;
  }
}