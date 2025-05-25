/**
 * Direct player operations using SQL for debugging
 * This file provides reliable functions for creating and updating players
 * when normal methods may be failing
 */

import { db } from './db';
import { sql } from 'drizzle-orm';
import { Position } from '@shared/schema';

/**
 * Create a player with direct SQL
 */
export async function createPlayerDirect(playerData: {
  displayName: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string | null;
  positionPreferences: string[] | Position[];
  active?: boolean;
  avatarColor?: string;
}, seasonIds: number[] = []): Promise<{
  success: boolean;
  playerId?: number;
  message: string;
  error?: any;
}> {
  try {
    console.log("Direct player creation with data:", playerData, "seasons:", seasonIds);
    
    // Step 1: Insert player
    const insertResult = await db.execute(
      sql`INSERT INTO players (
        display_name, 
        first_name, 
        last_name, 
        date_of_birth, 
        position_preferences, 
        active, 
        avatar_color
      ) VALUES (
        ${playerData.displayName}, 
        ${playerData.firstName}, 
        ${playerData.lastName}, 
        ${playerData.dateOfBirth || null}, 
        ${JSON.stringify(playerData.positionPreferences)}::jsonb, 
        ${playerData.active !== undefined ? playerData.active : true}, 
        ${playerData.avatarColor || null}
      ) RETURNING id`
    );
    
    if (!insertResult.rows || insertResult.rows.length === 0) {
      return {
        success: false,
        message: "Failed to insert player"
      };
    }
    
    const playerId = Number(insertResult.rows[0].id);
    console.log(`Created player with ID ${playerId}`);
    
    // Step 2: Add to seasons
    const seasonIdsToAdd = [...seasonIds];
    
    // If no seasons provided, add to active season
    if (seasonIdsToAdd.length === 0) {
      try {
        const activeSeasonResult = await db.execute(
          sql`SELECT id FROM seasons WHERE is_active = true LIMIT 1`
        );
        
        if (activeSeasonResult.rows && activeSeasonResult.rows.length > 0) {
          seasonIdsToAdd.push(Number(activeSeasonResult.rows[0].id));
        }
      } catch (error) {
        console.error("Error getting active season:", error);
      }
    }
    
    // Add player to seasons
    if (seasonIdsToAdd.length > 0) {
      for (const seasonId of seasonIdsToAdd) {
        try {
          await db.execute(
            sql`INSERT INTO player_seasons (player_id, season_id) VALUES (${playerId}, ${seasonId})`
          );
          console.log(`Added player ${playerId} to season ${seasonId}`);
        } catch (error) {
          console.error(`Error adding player ${playerId} to season ${seasonId}:`, error);
        }
      }
    }
    
    return {
      success: true,
      playerId,
      message: "Player created successfully"
    };
  } catch (error) {
    console.error("Direct player creation error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      error
    };
  }
}

/**
 * Update a player with direct SQL
 */
export async function updatePlayerDirect(
  playerId: number,
  playerData: {
    displayName?: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string | null;
    positionPreferences?: string[] | Position[];
    active?: boolean;
    avatarColor?: string;
  },
  seasonIds?: number[]
): Promise<{
  success: boolean;
  message: string;
  error?: any;
}> {
  try {
    console.log(`Direct player update for ID ${playerId} with:`, playerData, "seasons:", seasonIds);
    
    // Check if player exists
    const playerCheck = await db.execute(
      sql`SELECT id FROM players WHERE id = ${playerId}`
    );
    
    if (!playerCheck.rows || playerCheck.rows.length === 0) {
      return {
        success: false,
        message: `Player with ID ${playerId} not found`
      };
    }
    
    // Update player fields
    if (playerData.displayName !== undefined) {
      await db.execute(
        sql`UPDATE players SET display_name = ${playerData.displayName} WHERE id = ${playerId}`
      );
    }
    
    if (playerData.firstName !== undefined) {
      await db.execute(
        sql`UPDATE players SET first_name = ${playerData.firstName} WHERE id = ${playerId}`
      );
    }
    
    if (playerData.lastName !== undefined) {
      await db.execute(
        sql`UPDATE players SET last_name = ${playerData.lastName} WHERE id = ${playerId}`
      );
    }
    
    if (playerData.dateOfBirth !== undefined) {
      await db.execute(
        sql`UPDATE players SET date_of_birth = ${playerData.dateOfBirth} WHERE id = ${playerId}`
      );
    }
    
    if (playerData.active !== undefined) {
      await db.execute(
        sql`UPDATE players SET active = ${playerData.active} WHERE id = ${playerId}`
      );
    }
    
    if (playerData.avatarColor !== undefined) {
      await db.execute(
        sql`UPDATE players SET avatar_color = ${playerData.avatarColor} WHERE id = ${playerId}`
      );
    }
    
    if (playerData.positionPreferences !== undefined) {
      await db.execute(
        sql`UPDATE players SET position_preferences = ${JSON.stringify(playerData.positionPreferences)}::jsonb WHERE id = ${playerId}`
      );
    }
    
    // Update seasons if provided
    if (seasonIds !== undefined) {
      // Delete existing relationships
      await db.execute(
        sql`DELETE FROM player_seasons WHERE player_id = ${playerId}`
      );
      
      // Add new relationships
      if (seasonIds.length > 0) {
        for (const seasonId of seasonIds) {
          try {
            await db.execute(
              sql`INSERT INTO player_seasons (player_id, season_id) VALUES (${playerId}, ${seasonId})`
            );
            console.log(`Added player ${playerId} to season ${seasonId}`);
          } catch (error) {
            console.error(`Error adding player ${playerId} to season ${seasonId}:`, error);
          }
        }
      }
    }
    
    return {
      success: true,
      message: "Player updated successfully"
    };
  } catch (error) {
    console.error("Direct player update error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      error
    };
  }
}