import { db } from "../db";
import { eq, and } from "drizzle-orm";
import { gameStats, rosters } from "../../shared/schema";
import { log } from "../vite";

/**
 * This script populates the position field in game_stats table based on roster data.
 * With our transitional schema, we retain both player_id and position fields to allow
 * for a gradual migration to a position-based stats model.
 */
export async function migrateStatsToPositionBased() {
  try {
    log("Starting migration to add position data to stats", "migration");
    
    // Get all existing game stats
    const allStats = await db.select().from(gameStats);
    log(`Found ${allStats.length} stat records to migrate`, "migration");
    
    // Process each stat record
    for (const stat of allStats) {
      try {
        // Find what position this player was playing in this game/quarter
        const rosterEntries = await db.select().from(rosters).where(
          and(
            eq(rosters.gameId, stat.gameId),
            eq(rosters.playerId, stat.playerId),
            eq(rosters.quarter, stat.quarter)
          )
        );

        // If we found a position assignment for this player in this game/quarter
        if (rosterEntries.length > 0) {
          // If multiple positions are found (should be rare), we'll use the first one
          // and log a warning
          if (rosterEntries.length > 1) {
            log(`Warning: Player ${stat.playerId} found in multiple positions in game ${stat.gameId}, quarter ${stat.quarter}. Using ${rosterEntries[0].position}`, "migration");
          }

          const position = rosterEntries[0].position;
          
          // Update the record to add the position field
          await db.update(gameStats)
            .set({ position: position })
            .where(eq(gameStats.id, stat.id));
            
          log(`Added position ${position} to stat ID ${stat.id} for player ${stat.playerId}`, "migration");
        } else {
          log(`Could not find position for player ${stat.playerId} in game ${stat.gameId}, quarter ${stat.quarter}. Stat ID: ${stat.id}`, "migration");
        }
      } catch (err) {
        log(`Error processing stat ID ${stat.id}: ${err}`, "migration");
      }
    }
    
    log("Position data migration completed", "migration");
    
    return {
      success: true,
      message: `Successfully added position data to ${allStats.length} stat records`,
      totalRecords: allStats.length
    };
  } catch (err) {
    log(`Migration failed: ${err}`, "migration");
    return {
      success: false, 
      message: `Migration failed: ${err}`,
      totalRecords: 0
    };
  }
}