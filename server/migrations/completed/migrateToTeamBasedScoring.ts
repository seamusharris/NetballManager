
/**
 * Migration to convert game_scores table from home/away structure to team-based structure
 * This provides better data integrity when teams are assigned as home/away
 */

import { db } from '../db';
import { sql } from 'drizzle-orm';
import { log } from '../vite';

export async function migrateToTeamBasedScoring(): Promise<boolean> {
  try {
    log("Starting migration to team-based scoring system", "migration");

    // Check if the new structure already exists
    const teamIdExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'game_scores'
        AND column_name = 'team_id'
      );
    `);

    if (teamIdExists.rows[0].exists) {
      log("Team-based scoring structure already exists", "migration");
      return true;
    }

    // Step 1: Create backup table with existing data
    await db.execute(sql`
      CREATE TABLE game_scores_backup AS SELECT * FROM game_scores;
    `);
    log("Created backup of existing game_scores", "migration");

    // Step 2: Drop existing table and recreate with new structure
    await db.execute(sql`DROP TABLE game_scores CASCADE;`);

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

    // Step 3: Create indexes
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_game_scores_game_id ON game_scores(game_id);
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_game_scores_team_id ON game_scores(team_id);
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_game_scores_entered_by ON game_scores(entered_by);
    `);

    // Step 4: Migrate existing data from backup
    const backupData = await db.execute(sql`
      SELECT b.*, g.home_team_id, g.away_team_id
      FROM game_scores_backup b
      JOIN games g ON b.game_id = g.id
      WHERE g.home_team_id IS NOT NULL AND g.away_team_id IS NOT NULL;
    `);

    for (const row of backupData.rows) {
      // Insert home team scores
      for (let quarter = 1; quarter <= 4; quarter++) {
        const scoreKey = `home_team_q${quarter}`;
        const score = row[scoreKey] || 0;
        
        await db.execute(sql`
          INSERT INTO game_scores (game_id, team_id, quarter, score, entered_by, entered_at, updated_at, notes)
          VALUES (${row.game_id}, ${row.home_team_id}, ${quarter}, ${score}, ${row.entered_by}, ${row.entered_at}, ${row.updated_at}, ${row.notes})
          ON CONFLICT (game_id, team_id, quarter) DO NOTHING;
        `);
      }

      // Insert away team scores
      for (let quarter = 1; quarter <= 4; quarter++) {
        const scoreKey = `away_team_q${quarter}`;
        const score = row[scoreKey] || 0;
        
        await db.execute(sql`
          INSERT INTO game_scores (game_id, team_id, quarter, score, entered_by, entered_at, updated_at, notes)
          VALUES (${row.game_id}, ${row.away_team_id}, ${quarter}, ${score}, ${row.entered_by}, ${row.entered_at}, ${row.updated_at}, null)
          ON CONFLICT (game_id, team_id, quarter) DO NOTHING;
        `);
      }
    }

    log(`Migrated ${backupData.rows.length} game score records to team-based structure`, "migration");

    // Step 5: Clean up backup table
    await db.execute(sql`DROP TABLE game_scores_backup;`);

    log("Successfully completed team-based scoring migration", "migration");
    return true;

  } catch (error) {
    log(`Error in team-based scoring migration: ${error}`, "migration");
    return false;
  }
}
