import { db } from "../db";
import { eq, and } from "drizzle-orm";
import { gameStats, rosters } from "../../shared/schema";
import { log } from "../vite";

/**
 * This script migrates existing player-based game stats to the new position-based model.
 * For each stat record, it finds what position the player was playing in that game/quarter
 * and stores that position instead of the player ID.
 */
export async function migrateStatsToPositionBased() {
  try {
    log("Starting migration to position-based stats", "migration");
    
    // Get all existing game stats
    const allStats = await db.query.gameStats.findMany();
    log(`Found ${allStats.length} stat records to migrate`, "migration");
    
    // Process each stat record
    for (const stat of allStats) {
      try {
        // Find what position this player was playing in this game/quarter
        const rosterEntries = await db.query.rosters.findMany({
          where: and(
            eq(rosters.gameId, stat.gameId),
            eq(rosters.playerId, stat.playerId),
            eq(rosters.quarter, stat.quarter)
          )
        });

        // If we found a position assignment for this player in this game/quarter
        if (rosterEntries.length > 0) {
          // If multiple positions are found (should be rare), we'll use the first one
          // and log a warning
          if (rosterEntries.length > 1) {
            log(`Warning: Player ${stat.playerId} found in multiple positions in game ${stat.gameId}, quarter ${stat.quarter}. Using ${rosterEntries[0].position}`, "migration");
          }

          const position = rosterEntries[0].position;
          
          // Update the record with the position instead of player ID
          await db.update(gameStats)
            .set({ position: position })
            .where(eq(gameStats.id, stat.id));
            
          log(`Migrated stat ID ${stat.id} from player ${stat.playerId} to position ${position}`, "migration");
        } else {
          log(`Could not find position for player ${stat.playerId} in game ${stat.gameId}, quarter ${stat.quarter}. Stat ID: ${stat.id}`, "migration");
        }
      } catch (err) {
        log(`Error processing stat ID ${stat.id}: ${err}`, "migration");
      }
    }
    
    log("Migration to position-based stats completed", "migration");
    
    return {
      success: true,
      message: `Successfully migrated ${allStats.length} stat records to position-based model`,
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