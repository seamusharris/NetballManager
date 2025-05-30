
/**
 * Migration to convert existing isBye boolean field to status-based system
 * This will set status='bye' for games where isBye=true
 */
import { db } from "../db";
import { log } from "../vite";
import { sql } from "drizzle-orm";

export async function migrateByesToStatus(): Promise<void> {
  try {
    log("Beginning migration to convert BYE games to status-based system", "migration");

    // Check if there are any games with isBye=true
    const byeGamesResult = await db.execute(
      sql`SELECT id, date, time FROM games WHERE is_bye = true`
    );

    if (byeGamesResult.length === 0) {
      log("No BYE games found to migrate", "migration");
      return;
    }

    log(`Found ${byeGamesResult.length} BYE games to migrate`, "migration");

    // Update BYE games to have status='bye' and set completed=true
    const updateResult = await db.execute(
      sql`
        UPDATE games 
        SET status = 'bye', completed = true 
        WHERE is_bye = true AND (status IS NULL OR status = 'upcoming')
      `
    );

    log(`Successfully migrated ${byeGamesResult.length} BYE games to status-based system`, "migration");

    // Report on the migrated games
    for (const game of byeGamesResult.rows) {
      log(`Migrated BYE game: ID ${game.id}, Date ${game.date}`, "migration");
    }

    log("BYE to status migration completed successfully!", "migration");

  } catch (error) {
    log(`Error during BYE to status migration: ${error}`, "migration");
    throw error;
  }
}
