import { migrateToPositionOnlyStats } from "./migrations/migrateToPositionOnlyStats";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

/**
 * Function to run database migrations for conversion to position-based stats
 */
export async function runDatabaseMigrations() {
  try {
    console.log("Starting database migration to position-based stats...");

    // 1. Ensure position data is populated and duplicates are merged
    await migrateToPositionOnlyStats();
    
    // 2. Remove the player_id column if it exists
    try {
      const columnsResult = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'game_stats' AND column_name = 'player_id'
      `);
      
      if (columnsResult.rows.length > 0) {
        console.log("Removing player_id column from game_stats table...");
        await db.execute(sql`ALTER TABLE game_stats DROP COLUMN player_id`);
        console.log("player_id column removed successfully");
      } else {
        console.log("player_id column does not exist, no need to remove");
      }
    } catch (error) {
      console.error("Error checking or removing player_id column:", error);
      throw error;
    }
    
    // 3. Create unique constraint on game_id + position + quarter
    try {
      // First check if constraint already exists
      const constraintResult = await db.execute(sql`
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_name = 'game_stats' 
          AND constraint_type = 'UNIQUE'
          AND constraint_name = 'game_stats_position_quarter_unique'
      `);
      
      if (constraintResult.rows.length === 0) {
        console.log("Adding unique constraint for position and quarter...");
        await db.execute(sql`
          ALTER TABLE game_stats 
          ADD CONSTRAINT game_stats_position_quarter_unique 
          UNIQUE (game_id, position, quarter)
        `);
        console.log("Unique constraint added successfully");
      } else {
        console.log("Unique constraint already exists");
      }
    } catch (error) {
      console.error("Error adding unique constraint:", error);
      throw error;
    }
    
    console.log("Migration to position-based stats completed successfully");
    return "Migration completed successfully";
  } catch (error) {
    console.error("Error during migration:", error);
    throw error;
  }
}