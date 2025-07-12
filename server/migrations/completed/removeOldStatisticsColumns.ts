
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { log } from '../vite';

export async function removeOldStatisticsColumns(): Promise<boolean> {
  try {
    log("Starting removal of old statistics columns", "migration");

    // Remove the old columns
    await db.execute(sql`
      ALTER TABLE game_stats 
      DROP COLUMN IF EXISTS bad_pass,
      DROP COLUMN IF EXISTS handling_error,
      DROP COLUMN IF EXISTS pick_up,
      DROP COLUMN IF EXISTS infringement
    `);

    log("Removed old statistics columns successfully", "migration");
    return true;

  } catch (error) {
    log(`Error removing old statistics columns: ${error}`, "migration");
    return false;
  }
}
