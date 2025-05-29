
/**
 * Migration to ensure all required columns exist in the games table
 * This handles cases where previous migrations may have failed partially
 */

import { db } from '../db';
import { sql } from 'drizzle-orm';
import { log } from '../vite';

export async function ensureRequiredColumns(): Promise<boolean> {
  try {
    log("Starting required columns check migration", "migration");

    // Check and add venue column
    const venueExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'games'
        AND column_name = 'venue'
      );
    `);

    if (!venueExists.rows[0].exists) {
      await db.execute(sql`ALTER TABLE games ADD COLUMN venue TEXT;`);
      log("Added missing venue column to games table", "migration");
    } else {
      log("venue column already exists", "migration");
    }

    // Check and add team_score column
    const teamScoreExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'games'
        AND column_name = 'team_score'
      );
    `);

    if (!teamScoreExists.rows[0].exists) {
      await db.execute(sql`ALTER TABLE games ADD COLUMN team_score INTEGER DEFAULT 0;`);
      log("Added missing team_score column to games table", "migration");
    } else {
      log("team_score column already exists", "migration");
    }

    // Check and add opponent_score column
    const opponentScoreExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'games'
        AND column_name = 'opponent_score'
      );
    `);

    if (!opponentScoreExists.rows[0].exists) {
      await db.execute(sql`ALTER TABLE games ADD COLUMN opponent_score INTEGER DEFAULT 0;`);
      log("Added missing opponent_score column to games table", "migration");
    } else {
      log("opponent_score column already exists", "migration");
    }

    // Check and add notes column
    const notesExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'games'
        AND column_name = 'notes'
      );
    `);

    if (!notesExists.rows[0].exists) {
      await db.execute(sql`ALTER TABLE games ADD COLUMN notes TEXT;`);
      log("Added missing notes column to games table", "migration");
    } else {
      log("notes column already exists", "migration");
    }

    log("Required columns check migration completed successfully", "migration");
    return true;

  } catch (error) {
    log(`Error in required columns migration: ${error}`, "migration");
    return false;
  }
}
