import { db } from "./db";
import { sql } from "drizzle-orm";

/**
 * This function updates the seasons for a player using direct SQL queries
 * to ensure reliable operation even when the ORM approach might fail
 */
export async function updatePlayerSeasons(playerId: number, seasonIds: number[]): Promise<boolean> {
  try {
    // Verify the player exists
    const playerExists = await db.execute(sql`
      SELECT id FROM players WHERE id = ${playerId} LIMIT 1
    `);
    
    if (!playerExists.rows?.length) {
      console.error(`Player ${playerId} not found`);
      return false;
    }
    
    console.log(`Starting direct update of seasons for player ${playerId}`);
    console.log(`Current season IDs: ${seasonIds.join(', ')}`);
    
    // First, delete all existing relationships for this player
    await db.execute(sql`
      DELETE FROM player_seasons WHERE player_id = ${playerId}
    `);
    console.log(`Deleted existing season relationships for player ${playerId}`);
    
    // Skip insert if no seasons provided
    if (!seasonIds || seasonIds.length === 0) {
      console.log(`No seasons to add for player ${playerId}`);
      return true;
    }
    
    // Then insert the new relationships one by one
    for (const seasonId of seasonIds) {
      try {
        // Verify the season exists before inserting
        const seasonExists = await db.execute(sql`
          SELECT id FROM seasons WHERE id = ${seasonId} LIMIT 1
        `);
        
        if (!seasonExists.rows?.length) {
          console.warn(`Season ${seasonId} not found, skipping`);
          continue;
        }
        
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
    
    // Verify the changes
    const updatedSeasons = await db.execute(sql`
      SELECT season_id FROM player_seasons WHERE player_id = ${playerId}
    `);
    
    const updatedSeasonIds = updatedSeasons.rows?.map((row: any) => row.season_id) || [];
    console.log(`Updated seasons for player ${playerId}: ${updatedSeasonIds.join(', ')}`);
    
    return true;
  } catch (error) {
    console.error(`Failed to update seasons for player ${playerId}:`, error);
    return false;
  }
}