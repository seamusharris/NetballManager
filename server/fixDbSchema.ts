import { db } from "./db";
import { sql } from "drizzle-orm";
import { log } from "./vite";

/**
 * This function ensures the game_stats table has the correct schema.
 * It's needed to fix any issues that may have occurred during schema changes.
 */
export async function fixGameStatsSchema() {
  try {
    // Check if the position column exists
    const columnCheck = await db.execute(sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'game_stats' AND column_name = 'position'
    `);
    
    // If the position column exists, drop it
    if (columnCheck.rows.length > 0) {
      log("Removing position column from game_stats table", "migration");
      await db.execute(sql`ALTER TABLE game_stats DROP COLUMN IF EXISTS position`);
    }
    
    // Check if player_id column exists (it should always exist, but just in case)
    const playerIdCheck = await db.execute(sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'game_stats' AND column_name = 'player_id'
    `);
    
    // If player_id column doesn't exist, add it
    if (playerIdCheck.rows.length === 0) {
      log("Adding player_id column to game_stats table", "migration");
      await db.execute(sql`ALTER TABLE game_stats ADD COLUMN player_id INTEGER NOT NULL`);
    }
    
    return { 
      success: true, 
      message: "Game stats schema has been fixed" 
    };
  } catch (error) {
    log(`Error fixing game stats schema: ${error}`, "migration");
    return { 
      success: false, 
      message: `Failed to fix schema: ${error}` 
    };
  }
}