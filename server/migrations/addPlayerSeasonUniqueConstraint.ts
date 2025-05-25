import { db } from "../db";
import { sql } from "drizzle-orm";

/**
 * Migration to ensure the player_seasons table has a unique constraint on player_id and season_id
 * This prevents a player from being assigned to the same season multiple times
 */
export async function addPlayerSeasonUniqueConstraint() {
  try {
    console.log("Running migration: Adding unique constraint to player_seasons table");
    
    // Check if constraint already exists
    const constraintCheck = await db.execute(sql`
      SELECT COUNT(*) FROM pg_constraint 
      WHERE conname = 'player_seasons_player_id_season_id_unique' 
      AND conrelid = 'player_seasons'::regclass;
    `);
    
    const constraintExists = parseInt(constraintCheck.rows[0].count, 10) > 0;
    
    if (!constraintExists) {
      // First, remove any duplicates that might exist
      console.log("Removing potential duplicate player-season relationships...");
      
      await db.execute(sql`
        WITH duplicates AS (
          SELECT player_id, season_id, MIN(id) as keep_id
          FROM player_seasons
          GROUP BY player_id, season_id
          HAVING COUNT(*) > 1
        )
        DELETE FROM player_seasons ps
        USING duplicates d
        WHERE ps.player_id = d.player_id 
          AND ps.season_id = d.season_id 
          AND ps.id != d.keep_id;
      `);
      
      // Add the unique constraint
      console.log("Adding unique constraint to player_seasons table");
      await db.execute(sql`
        ALTER TABLE player_seasons 
        ADD CONSTRAINT player_seasons_player_id_season_id_unique 
        UNIQUE (player_id, season_id);
      `);
      
      console.log("Unique constraint added successfully");
    } else {
      console.log("Unique constraint already exists on player_seasons table");
    }
    
    return { success: true, message: "Player-season unique constraint ensured" };
  } catch (error) {
    console.error("Error adding unique constraint to player_seasons:", error);
    return { success: false, error: String(error) };
  }
}