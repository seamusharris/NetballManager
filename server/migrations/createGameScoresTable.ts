
/**
 * Migration to create the game_scores table for official quarter-by-quarter scoring
 * This provides an authoritative scoring system independent of detailed statistics
 */

import { db } from '../db';
import { sql } from 'drizzle-orm';
import { log } from '../vite';

export async function createGameScoresTable(): Promise<boolean> {
  try {
    log("Starting game_scores table creation migration", "migration");

    // Check if the table already exists
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'game_scores'
      );
    `);

    if (tableExists.rows[0].exists) {
      log("game_scores table already exists, skipping creation", "migration");
      return true;
    }

    // Create the game_scores table
    await db.execute(sql`
      CREATE TABLE game_scores (
        id SERIAL PRIMARY KEY,
        game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
        team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        quarter INTEGER NOT NULL CHECK (quarter >= 1 AND quarter <= 4),
        score INTEGER NOT NULL DEFAULT 0,
        entered_by INTEGER REFERENCES users(id),
        entered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        notes TEXT,
        UNIQUE(game_id, team_id, quarter)
      );
    `);

    log("Created game_scores table", "migration");

    // Create indexes for performance
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_game_scores_game_id ON game_scores(game_id);
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_game_scores_team_id ON game_scores(team_id);
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_game_scores_entered_by ON game_scores(entered_by);
    `);

    log("Created indexes on game_scores table", "migration");
    log("Completed game_scores table migration", "migration");
    return true;

  } catch (error) {
    log(`Error in game_scores migration: ${error}`, "migration");
    return false;
  }
}
