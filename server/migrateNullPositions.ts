import { db } from "./db";
import { eq, and, isNull } from "drizzle-orm";
import { gameStats, rosters } from "../shared/schema";
import { log } from "./vite";

/**
 * This migration updates the legacy statistics with null position values
 * by looking up the corresponding position from the roster data.
 */
export async function migrateNullPositions() {
  try {
    log("Starting migration to update null position values in statistics", "migration");
    
    // Get all statistics with null position values
    const nullPositionStats = await db
      .select()
      .from(gameStats)
      .where(isNull(gameStats.position));
    
    log(`Found ${nullPositionStats.length} statistics with null position values`, "migration");
    
    // Group by game for easier processing
    const statsByGame: Record<number, typeof nullPositionStats> = {};
    
    nullPositionStats.forEach(stat => {
      if (!statsByGame[stat.gameId]) {
        statsByGame[stat.gameId] = [];
      }
      statsByGame[stat.gameId].push(stat);
    });
    
    // For each game, get the roster and update the position values
    for (const [gameIdStr, stats] of Object.entries(statsByGame)) {
      const gameId = parseInt(gameIdStr);
      log(`Processing game ${gameId} with ${stats.length} null position statistics`, "migration");
      
      // Get the roster for this game
      const gameRoster = await db
        .select()
        .from(rosters)
        .where(eq(rosters.gameId, gameId));
      
      if (gameRoster.length === 0) {
        log(`No roster found for game ${gameId}, skipping position update`, "migration");
        continue;
      }
      
      // Process each statistic and find the corresponding position from the roster
      for (const stat of stats) {
        try {
          // Find the corresponding roster entry that matches the quarter
          const rosterEntry = gameRoster.find(r => r.quarter === stat.quarter);
          
          if (!rosterEntry) {
            log(`No roster entry found for game ${gameId}, quarter ${stat.quarter}, skipping`, "migration");
            continue;
          }
          
          // Update the statistic with the position from the roster
          await db
            .update(gameStats)
            .set({ position: rosterEntry.position })
            .where(eq(gameStats.id, stat.id));
          
          log(`Updated statistic ${stat.id} for game ${gameId}, quarter ${stat.quarter} with position ${rosterEntry.position}`, "migration");
        } catch (error) {
          log(`Error updating statistic ${stat.id}: ${error}`, "migration");
        }
      }
    }
    
    // Check if there are any remaining null positions
    const remainingNullPositions = await db
      .select()
      .from(gameStats)
      .where(isNull(gameStats.position));
    
    log(`Migration completed. ${remainingNullPositions.length} statistics still have null positions.`, "migration");
    
    return {
      success: true,
      message: `Updated ${nullPositionStats.length - remainingNullPositions.length} statistics with proper position values`,
      totalRecords: nullPositionStats.length,
      remainingNulls: remainingNullPositions.length
    };
  } catch (error) {
    log(`Migration failed: ${error}`, "migration");
    return {
      success: false,
      message: `Migration failed: ${error}`,
      totalRecords: 0,
      remainingNulls: -1
    };
  }
}

// Run this function to execute the migration
export async function runMigrateNullPositions() {
  const result = await migrateNullPositions();
  console.log(result);
  return result;
}