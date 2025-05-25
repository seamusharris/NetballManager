import { sql } from "drizzle-orm";
import { db } from "./db";
import { playerSeasons } from "@shared/schema";

/**
 * This function updates the seasons for a player using direct SQL queries
 * to ensure reliable operation even when the ORM approach might fail
 */
export async function updatePlayerSeasons(playerId: number, seasonIds: number[]): Promise<boolean> {
  try {
    // Log the current state for debugging
    console.log(`Updating player ${playerId} seasons to:`, seasonIds);
    
    // Use a direct SQL query to delete existing associations for maximum reliability
    await db.execute(sql`DELETE FROM player_seasons WHERE player_id = ${playerId}`);
    
    // Add new season associations one by one with detailed logging
    if (Array.isArray(seasonIds) && seasonIds.length > 0) {
      for (const seasonId of seasonIds) {
        console.log(`Adding player ${playerId} to season ${seasonId}`);
        // Use a direct SQL query for insertion
        await db.execute(sql`
          INSERT INTO player_seasons (player_id, season_id)
          VALUES (${playerId}, ${seasonId})
          ON CONFLICT DO NOTHING
        `);
      }
      console.log(`Successfully added player ${playerId} to ${seasonIds.length} seasons`);
    } else {
      console.log(`Player ${playerId} has no seasons assigned`);
    }
    
    return true;
  } catch (error) {
    console.error(`Failed to update seasons for player ${playerId}:`, error);
    return false;
  }
}