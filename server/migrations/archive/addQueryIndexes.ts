/**
 * Migration to add database indexes to frequently queried columns
 * This will improve query performance for common operations
 */
import { db } from "../db";
import { log } from "../vite";
import { sql } from "drizzle-orm";

/**
 * Add indexes to frequently queried columns
 * - gameId in game_stats table
 * - gameId in rosters table
 * - playerId in rosters table
 * - position in game_stats table
 */
export async function addQueryIndexes(): Promise<void> {
  try {
    log("Beginning migration to add query indexes", "migration");

    // Add index to gameId in game_stats table
    log("Adding index to gameId in game_stats table", "migration");
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS idx_game_stats_game_id ON game_stats (game_id)`
    );

    // Add index to position in game_stats table
    log("Adding index to position in game_stats table", "migration");
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS idx_game_stats_position ON game_stats (position)`
    );

    // Add index to quarter in game_stats table
    log("Adding index to quarter in game_stats table", "migration");
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS idx_game_stats_quarter ON game_stats (quarter)`
    );
    
    // Add combined index on gameId, position, and quarter
    log("Adding combined index on gameId, position, and quarter in game_stats table", "migration");
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS idx_game_stats_game_pos_quarter ON game_stats (game_id, position, quarter)`
    );

    // Add index to gameId in rosters table
    log("Adding index to gameId in rosters table", "migration");
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS idx_rosters_game_id ON rosters (game_id)`
    );

    // Add index to playerId in rosters table
    log("Adding index to playerId in rosters table", "migration");
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS idx_rosters_player_id ON rosters (player_id)`
    );

    // Add combined index on gameId and quarter in rosters table
    log("Adding combined index on gameId and quarter in rosters table", "migration");
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS idx_rosters_game_quarter ON rosters (game_id, quarter)`
    );

    log("Successfully added all query indexes", "migration");
  } catch (error) {
    log(`Error adding query indexes: ${error}`, "migration-error");
    throw error;
  }
}

/**
 * Run the migration
 */
export async function runAddQueryIndexesMigration(): Promise<void> {
  try {
    await addQueryIndexes();
    log("Successfully completed index migration", "migration");
  } catch (error) {
    log(`Failed to complete index migration: ${error}`, "migration-error");
    process.exit(1);
  }
}

// This will be called by our migration runner script
// No need for a direct module check in ES modules