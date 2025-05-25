/**
 * Emergency player fix - a direct SQL approach to address critical issues
 * with player creation and updating
 */

import { db } from './db';
import { sql } from 'drizzle-orm';
import { Position } from '@shared/schema';

/**
 * Create a player with seasons directly using SQL
 */
export async function createPlayerEmergency(playerData: {
  displayName: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string | null;
  positionPreferences: Position[];
  active: boolean;
  avatarColor?: string;
}, seasonIds: number[] = []): Promise<{ success: boolean; playerId?: number; message: string }> {
  
  try {
    // Use a transaction to ensure atomicity
    return await db.transaction(async (tx) => {
      // First, insert the player
      const positionsJson = JSON.stringify(playerData.positionPreferences);
      
      const insertResult = await tx.execute(
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
          ${positionsJson}::jsonb, 
          ${playerData.active}, 
          ${playerData.avatarColor || null}
        ) RETURNING id`
      );
      
      if (!insertResult.rows || insertResult.rows.length === 0) {
        throw new Error('Failed to insert player');
      }
      
      const newPlayerId = Number(insertResult.rows[0].id);
      console.log(`Created player with ID ${newPlayerId}`);
      
      // Then, create player-season relationships if provided
      if (seasonIds.length > 0) {
        for (const seasonId of seasonIds) {
          await tx.execute(
            sql`INSERT INTO player_seasons (player_id, season_id) VALUES (${newPlayerId}, ${seasonId})`
          );
        }
        console.log(`Associated player ${newPlayerId} with ${seasonIds.length} seasons`);
      }
      
      return {
        success: true,
        playerId: newPlayerId,
        message: 'Player created successfully'
      };
    });
  } catch (error) {
    console.error('Error in emergency player creation:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Update a player with seasons directly using SQL
 */
export async function updatePlayerEmergency(
  playerId: number,
  playerData: {
    displayName?: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string | null;
    positionPreferences?: Position[];
    active?: boolean;
    avatarColor?: string;
  },
  seasonIds?: number[] | null
): Promise<{ success: boolean; message: string }> {
  
  try {
    // Direct SQL execution approach to bypass ORM issues
    console.log(`Emergency update for player ID ${playerId}`);
    
    // First, check if player exists
    const playerCheck = await db.execute(
      sql`SELECT id FROM players WHERE id = ${playerId} LIMIT 1`
    );
    
    if (!playerCheck.rows || playerCheck.rows.length === 0) {
      return {
        success: false,
        message: `Player with ID ${playerId} not found`
      };
    }
    
    // Start with player data update if needed
    const updateFields: string[] = [];
    const values: any[] = [];
    
    if (playerData.displayName !== undefined) {
      await db.execute(
        sql`UPDATE players SET display_name = ${playerData.displayName} WHERE id = ${playerId}`
      );
      console.log(`Updated display name for player ${playerId}`);
    }
    
    if (playerData.firstName !== undefined) {
      await db.execute(
        sql`UPDATE players SET first_name = ${playerData.firstName} WHERE id = ${playerId}`
      );
      console.log(`Updated first name for player ${playerId}`);
    }
    
    if (playerData.lastName !== undefined) {
      await db.execute(
        sql`UPDATE players SET last_name = ${playerData.lastName} WHERE id = ${playerId}`
      );
      console.log(`Updated last name for player ${playerId}`);
    }
    
    if (playerData.dateOfBirth !== undefined) {
      await db.execute(
        sql`UPDATE players SET date_of_birth = ${playerData.dateOfBirth} WHERE id = ${playerId}`
      );
      console.log(`Updated date of birth for player ${playerId}`);
    }
    
    if (playerData.active !== undefined) {
      await db.execute(
        sql`UPDATE players SET active = ${playerData.active} WHERE id = ${playerId}`
      );
      console.log(`Updated active status for player ${playerId}`);
    }
    
    if (playerData.avatarColor !== undefined) {
      await db.execute(
        sql`UPDATE players SET avatar_color = ${playerData.avatarColor} WHERE id = ${playerId}`
      );
      console.log(`Updated avatar color for player ${playerId}`);
    }
    
    if (playerData.positionPreferences !== undefined) {
      const positionsJson = JSON.stringify(playerData.positionPreferences);
      await db.execute(
        sql`UPDATE players SET position_preferences = ${positionsJson}::jsonb WHERE id = ${playerId}`
      );
      console.log(`Updated position preferences for player ${playerId}`);
    }
    
    // Handle seasons if provided
    if (seasonIds !== undefined) {
      // First, delete all existing relationships
      await db.execute(
        sql`DELETE FROM player_seasons WHERE player_id = ${playerId}`
      );
      console.log(`Deleted all existing seasons for player ${playerId}`);
      
      // Then add new seasons if any
      if (seasonIds && seasonIds.length > 0) {
        for (const seasonId of seasonIds) {
          try {
            await db.execute(
              sql`INSERT INTO player_seasons (player_id, season_id) VALUES (${playerId}, ${seasonId})`
            );
            console.log(`Added player ${playerId} to season ${seasonId}`);
          } catch (err) {
            console.error(`Error adding player ${playerId} to season ${seasonId}:`, err);
          }
        }
      }
    }
    
    return {
      success: true,
      message: `Player ${playerId} updated successfully with direct SQL approach`
    };
  } catch (error) {
    console.error('Error in emergency player update:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Specifically fix Lucia's record (player ID 56)
 */
export async function fixLuciaRecord(
  newPositions?: Position[],
  seasonIds?: number[]
): Promise<{ success: boolean; message: string }> {
  try {
    return await db.transaction(async (tx) => {
      // Update positions if provided
      if (newPositions && newPositions.length > 0) {
        await tx.execute(
          sql`UPDATE players SET position_preferences = ${JSON.stringify(newPositions)}::jsonb WHERE id = 56`
        );
        console.log("Updated Lucia's positions to:", newPositions);
      }
      
      // Update seasons if provided
      if (seasonIds !== undefined) {
        // First delete all existing relationships
        await tx.execute(sql`DELETE FROM player_seasons WHERE player_id = 56`);
        
        // Then create new ones if provided
        if (seasonIds && seasonIds.length > 0) {
          for (const seasonId of seasonIds) {
            await tx.execute(
              sql`INSERT INTO player_seasons (player_id, season_id) VALUES (56, ${seasonId})`
            );
          }
          console.log("Updated Lucia's seasons to:", seasonIds);
        }
      }
      
      return {
        success: true,
        message: "Successfully fixed Lucia's record"
      };
    });
  } catch (error) {
    console.error("Error fixing Lucia's record:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}