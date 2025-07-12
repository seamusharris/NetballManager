
/**
 * Migration to create the team_game_notes table for team-specific coaching notes
 */

import { db } from '../db';
import { sql } from 'drizzle-orm';
import { log } from '../vite';

export async function createTeamGameNotesTable(): Promise<boolean> {
  try {
    log("Starting team_game_notes table creation migration", "migration");

    // Check if the table already exists
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'team_game_notes'
      );
    `);

    if (tableExists.rows[0].exists) {
      log("team_game_notes table already exists", "migration");
      return true;
    }

    // Create the team_game_notes table
    await db.execute(sql`
      CREATE TABLE team_game_notes (
        id SERIAL PRIMARY KEY,
        game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
        team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        notes TEXT,
        entered_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        UNIQUE(game_id, team_id)
      );
    `);

    log("Created team_game_notes table", "migration");

    // Create indexes for performance
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_team_game_notes_game_id ON team_game_notes(game_id);
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_team_game_notes_team_id ON team_game_notes(team_id);
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_team_game_notes_entered_by ON team_game_notes(entered_by);
    `);

    log("Created indexes on team_game_notes table", "migration");
    log("Completed team_game_notes table migration", "migration");
    return true;

  } catch (error) {
    log(`Error in team_game_notes migration: ${error}`, "migration");
    return false;
  }
}
