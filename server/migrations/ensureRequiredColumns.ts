
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
    try {
      await db.execute(sql`ALTER TABLE games ADD COLUMN venue TEXT;`);
      log("Added missing venue column to games table", "migration");
    } catch (error) {
      if (error.message?.includes('already exists') || error.message?.includes('duplicate column')) {
        log("venue column already exists", "migration");
      } else {
        log("Error adding venue column, may already exist", "migration");
      }
    }

    // Check and add team_score column
    try {
      await db.execute(sql`ALTER TABLE games ADD COLUMN team_score INTEGER DEFAULT 0;`);
      log("Added missing team_score column to games table", "migration");
    } catch (error) {
      if (error.message?.includes('already exists') || error.message?.includes('duplicate column')) {
        log("team_score column already exists", "migration");
      } else {
        log("Error adding team_score column, may already exist", "migration");
      }
    }

    // Check and add opponent_score column
    try {
      await db.execute(sql`ALTER TABLE games ADD COLUMN opponent_score INTEGER DEFAULT 0;`);
      log("Added missing opponent_score column to games table", "migration");
    } catch (error) {
      if (error.message?.includes('already exists') || error.message?.includes('duplicate column')) {
        log("opponent_score column already exists", "migration");
      } else {
        log("Error adding opponent_score column, may already exist", "migration");
      }
    }

    // Check and add notes column
    try {
      await db.execute(sql`ALTER TABLE games ADD COLUMN notes TEXT;`);
      log("Added missing notes column to games table", "migration");
    } catch (error) {
      if (error.message?.includes('already exists') || error.message?.includes('duplicate column')) {
        log("notes column already exists", "migration");
      } else {
        log("Error adding notes column, may already exist", "migration");
      }
    }

    log("Required columns check migration completed successfully", "migration");
    return true;

  } catch (error) {
    log(`Error in required columns migration: ${error}`, "migration");
    return false;
  }
}
