/**
 * Direct SQL utility to fix issues with a specific player
 * This is a troubleshooting utility for addressing problems with player #56 (Lucia)
 */

import { db } from './db';
import { playerSeasons } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';

/**
 * Reset and reassign seasons for Lucia's player record
 */
export async function fixLuciaPlayerSeasons(seasonIds: number[]): Promise<{success: boolean, message: string}> {
  try {
    // Use a transaction to ensure atomicity
    return await db.transaction(async (tx) => {
      // First, delete all existing player-season relationships for player 56
      await tx.execute(
        sql`DELETE FROM player_seasons WHERE player_id = 56`
      );
      
      console.log(`Deleted all season relationships for player 56`);
      
      // Now create new relationships for each season ID provided
      if (seasonIds.length > 0) {
        const insertValues = seasonIds.map(seasonId => ({
          playerId: 56,
          seasonId
        }));
        
        const result = await tx.insert(playerSeasons).values(insertValues);
        console.log(`Added player 56 to ${seasonIds.length} seasons:`, seasonIds);
      } else {
        console.log(`No seasons to add for player 56`);
      }
      
      return {
        success: true,
        message: `Successfully reset seasons for player 56 (Lucia)`
      };
    });
  } catch (error) {
    console.error('Error fixing Lucia player seasons:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown database error'
    };
  }
}

/**
 * Update Lucia's position preferences
 */
export async function updateLuciaPositions(positions: string[]): Promise<{success: boolean, message: string}> {
  try {
    // Use direct SQL for maximum reliability
    await db.execute(
      sql`UPDATE players SET position_preferences = ${JSON.stringify(positions)} WHERE id = 56`
    );
    
    console.log(`Updated position preferences for player 56:`, positions);
    
    return {
      success: true,
      message: `Successfully updated positions for player 56 (Lucia)`
    };
  } catch (error) {
    console.error('Error updating Lucia positions:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown database error'
    };
  }
}