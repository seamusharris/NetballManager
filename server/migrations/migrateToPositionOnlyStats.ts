import { db } from "../db";
import { sql } from "drizzle-orm";

/**
 * This migration changes the game_stats table to be fully position-based
 * by mapping all stats to positions and removing player dependencies
 */
export async function migrateToPositionOnlyStats() {
  console.log("Starting migration to position-only stats model...");
  
  try {
    // First make sure the position column is populated from roster data
    const existingStats = await db.execute(sql`
      SELECT gs.id, gs.game_id, gs.player_id, gs.position, gs.quarter 
      FROM game_stats gs
      WHERE gs.position IS NULL
    `);
    
    console.log(`Found ${existingStats.rows.length} stats without position data`);
    
    // For any stats that don't have a position, get it from the roster
    for (const stat of existingStats.rows) {
      // Find the position from roster
      const rosterData = await db.execute(sql`
        SELECT position FROM rosters 
        WHERE game_id = ${stat.game_id} AND player_id = ${stat.player_id} AND quarter = ${stat.quarter}
      `);
      
      if (rosterData.rows.length > 0) {
        const position = rosterData.rows[0].position;
        console.log(`Updating stat ID ${stat.id} with position ${position}`);
        
        // Update the position field
        await db.execute(sql`
          UPDATE game_stats 
          SET position = ${position} 
          WHERE id = ${stat.id}
        `);
      } else {
        console.warn(`No roster entry found for game ${stat.game_id}, player ${stat.player_id}, quarter ${stat.quarter}`);
      }
    }
    
    // Ensure all stats have a position now by removing any that don't
    await db.execute(sql`
      DELETE FROM game_stats 
      WHERE position IS NULL
    `);
    
    console.log("Migration completed successfully!");
    return "Migration to position-only stats model completed successfully";
  } catch (error) {
    console.error("Error during migration:", error);
    throw error;
  }
}