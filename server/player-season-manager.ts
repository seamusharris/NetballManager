import { db } from "./db";
import { sql } from "drizzle-orm";

/**
 * A specialized utility to handle player-season relationships
 * This uses direct SQL queries for maximum reliability
 */
export async function setPlayerSeasons(playerId: number, seasonIds: number[]): Promise<boolean> {
  try {
    // First, verify the player exists
    const playerCheck = await db.execute(sql`
      SELECT id FROM players WHERE id = ${playerId} LIMIT 1
    `);
    
    if (!playerCheck.rows?.length) {
      console.error(`Player ${playerId} not found in database`);
      return false;
    }
    
    // Log current seasons for debugging
    const currentSeasons = await db.execute(sql`
      SELECT season_id FROM player_seasons WHERE player_id = ${playerId}
    `);
    
    const currentSeasonIds = currentSeasons.rows?.map((row: any) => row.season_id) || [];
    console.log(`Current seasons for player ${playerId}:`, currentSeasonIds);
    console.log(`Setting new seasons for player ${playerId}:`, seasonIds);
    
    // Always delete existing relationships first
    await db.execute(sql`
      DELETE FROM player_seasons 
      WHERE player_id = ${playerId}
    `);
    console.log(`Deleted existing season relationships for player ${playerId}`);
    
    // If no seasons to add, we're done
    if (!seasonIds || seasonIds.length === 0) {
      console.log(`No seasons to add for player ${playerId}`);
      return true;
    }
    
    // Insert each season relationship individually for better error handling
    for (const seasonId of seasonIds) {
      try {
        // Verify the season exists
        const seasonCheck = await db.execute(sql`
          SELECT id FROM seasons WHERE id = ${seasonId} LIMIT 1
        `);
        
        if (!seasonCheck.rows?.length) {
          console.warn(`Season ${seasonId} not found, skipping`);
          continue;
        }
        
        // Insert the relationship
        await db.execute(sql`
          INSERT INTO player_seasons (player_id, season_id)
          VALUES (${playerId}, ${seasonId})
          ON CONFLICT DO NOTHING
        `);
        console.log(`Added player ${playerId} to season ${seasonId}`);
      } catch (error) {
        console.error(`Error adding player ${playerId} to season ${seasonId}:`, error);
        // Continue with other seasons
      }
    }
    
    // Verify the changes were made
    const updatedSeasons = await db.execute(sql`
      SELECT season_id FROM player_seasons WHERE player_id = ${playerId}
    `);
    
    const updatedSeasonIds = updatedSeasons.rows?.map((row: any) => row.season_id) || [];
    console.log(`Updated seasons for player ${playerId}:`, updatedSeasonIds);
    
    return true;
  } catch (error) {
    console.error(`Failed to set seasons for player ${playerId}:`, error);
    return false;
  }
}