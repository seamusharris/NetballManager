
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { log } from '../vite';

export async function addNewStatisticsColumns(): Promise<boolean> {
  try {
    log("Starting addition of new statistics columns", "migration");

    // Add the new columns
    await db.execute(sql`
      ALTER TABLE game_stats 
      ADD COLUMN IF NOT EXISTS deflections INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS turnovers INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS gains INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS receives INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS penalties INTEGER NOT NULL DEFAULT 0
    `);

    log("Added new statistics columns successfully", "migration");
    return true;

  } catch (error) {
    log(`Error adding new statistics columns: ${error}`, "migration");
    return false;
  }
}
