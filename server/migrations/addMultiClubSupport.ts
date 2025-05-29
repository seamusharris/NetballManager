
import { db } from '../db';
import { sql } from 'drizzle-orm';

/**
 * Migration to add multi-club support with teams, access controls, and player borrowing
 */
export async function addMultiClubSupport() {
  console.log('Starting multi-club migration...');

  try {
    // 1. Create clubs table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "clubs" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL UNIQUE,
        "code" TEXT NOT NULL UNIQUE, -- Short code like "EMFC", "DCEC"
        "address" TEXT,
        "contact_email" TEXT,
        "contact_phone" TEXT,
        "logo_url" TEXT,
        "primary_color" TEXT DEFAULT '#1f2937',
        "secondary_color" TEXT DEFAULT '#ffffff',
        "is_active" BOOLEAN DEFAULT true,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Create teams table (replaces the concept of "your team")
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "teams" (
        "id" SERIAL PRIMARY KEY,
        "club_id" INTEGER NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
        "season_id" INTEGER NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
        "name" TEXT NOT NULL, -- e.g., "Emeralds A", "Emeralds B"
        "division" TEXT, -- e.g., "Division 1", "Premier"
        "is_active" BOOLEAN DEFAULT true,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(club_id, season_id, name)
      );
    `);

    // 3. Create team_players junction (replaces player_seasons)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "team_players" (
        "id" SERIAL PRIMARY KEY,
        "team_id" INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        "player_id" INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
        "is_regular" BOOLEAN DEFAULT true, -- false for borrowed players
        "jersey_number" INTEGER,
        "position_preferences" JSON, -- Can override player's global preferences
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(team_id, player_id)
      );
    `);

    // 4. Create club_users for access control
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "club_users" (
        "id" SERIAL PRIMARY KEY,
        "club_id" INTEGER NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
        "user_id" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "role" TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'coach', 'viewer')),
        "can_manage_players" BOOLEAN DEFAULT false,
        "can_manage_games" BOOLEAN DEFAULT false,
        "can_manage_stats" BOOLEAN DEFAULT false,
        "can_view_other_teams" BOOLEAN DEFAULT false, -- Within same club
        "is_active" BOOLEAN DEFAULT true,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(club_id, user_id)
      );
    `);

    // 5. Update games table to support team vs team
    await db.execute(sql`
      ALTER TABLE games 
      ADD COLUMN IF NOT EXISTS "home_team_id" INTEGER REFERENCES teams(id),
      ADD COLUMN IF NOT EXISTS "away_team_id" INTEGER REFERENCES teams(id),
      ADD COLUMN IF NOT EXISTS "venue" TEXT,
      ADD COLUMN IF NOT EXISTS "is_inter_club" BOOLEAN DEFAULT false;
    `);

    // 6. Create game_permissions for cross-club access
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "game_permissions" (
        "id" SERIAL PRIMARY KEY,
        "game_id" INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
        "club_id" INTEGER NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
        "can_edit_stats" BOOLEAN DEFAULT false,
        "can_view_detailed_stats" BOOLEAN DEFAULT true,
        UNIQUE(game_id, club_id)
      );
    `);

    // 7. Create player_borrowing for temporary assignments
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "player_borrowing" (
        "id" SERIAL PRIMARY KEY,
        "game_id" INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
        "player_id" INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
        "borrowing_team_id" INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        "lending_team_id" INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        "approved_by_lending_club" BOOLEAN DEFAULT false,
        "approved_by_borrowing_club" BOOLEAN DEFAULT false,
        "jersey_number" INTEGER,
        "notes" TEXT,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(game_id, player_id)
      );
    `);

    // 8. Add indexes for performance
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_teams_club_season ON teams(club_id, season_id);
      CREATE INDEX IF NOT EXISTS idx_team_players_team ON team_players(team_id);
      CREATE INDEX IF NOT EXISTS idx_team_players_player ON team_players(player_id);
      CREATE INDEX IF NOT EXISTS idx_club_users_club ON club_users(club_id);
      CREATE INDEX IF NOT EXISTS idx_club_users_user ON club_users(user_id);
      CREATE INDEX IF NOT EXISTS idx_games_teams ON games(home_team_id, away_team_id);
      CREATE INDEX IF NOT EXISTS idx_player_borrowing_game ON player_borrowing(game_id);
    `);

    console.log('Multi-club schema created successfully!');
    return true;
  } catch (error) {
    console.error('Error in multi-club migration:', error);
    return false;
  }
}
