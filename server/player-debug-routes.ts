/**
 * Debug routes for player-season relationships
 * This provides direct methods for troubleshooting issues with player creation and updates
 */

import { Request, Response } from 'express';
import { db } from './db';
import { sql } from 'drizzle-orm';
import { Position } from '@shared/schema';

/**
 * Create a player with direct SQL and detailed error reporting
 */
export async function createPlayerDebug(req: Request, res: Response) {
  try {
    const { displayName, firstName, lastName, dateOfBirth, positionPreferences, active, avatarColor, seasonIds } = req.body;
    
    console.log('Debug create player with data:', req.body);
    
    // Validate required fields
    if (!displayName || !firstName || !lastName || !positionPreferences) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Create player with step-by-step error checking
    let playerId: number | undefined;
    
    // Step 1: Insert player record
    try {
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
          ${displayName}, 
          ${firstName}, 
          ${lastName}, 
          ${dateOfBirth || null}, 
          ${JSON.stringify(positionPreferences)}::jsonb, 
          ${active === undefined ? true : active}, 
          ${avatarColor || null}
        ) RETURNING id`
      );
      
      if (!insertResult.rows || insertResult.rows.length === 0) {
        return res.status(500).json({
          success: false,
          message: 'Player created but no ID returned',
          stage: 'player_insert'
        });
      }
      
      playerId = Number(insertResult.rows[0].id);
      console.log(`Debug: Player created with ID ${playerId}`);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        stage: 'player_insert',
        error
      });
    }
    
    // Step 2: Create season relationships if provided
    if (Array.isArray(seasonIds) && seasonIds.length > 0 && playerId) {
      try {
        for (const seasonId of seasonIds) {
          await db.execute(
            sql`INSERT INTO player_seasons (player_id, season_id) VALUES (${playerId}, ${seasonId})`
          );
          console.log(`Debug: Added player ${playerId} to season ${seasonId}`);
        }
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error',
          stage: 'season_insert',
          error,
          playerId // Return playerId since the player was created
        });
      }
    } else if (playerId) {
      // If no seasons provided, add to active season
      try {
        const activeSeasonResult = await db.execute(
          sql`SELECT id FROM seasons WHERE is_active = true LIMIT 1`
        );
        
        if (activeSeasonResult.rows && activeSeasonResult.rows.length > 0) {
          const activeSeasonId = Number(activeSeasonResult.rows[0].id);
          await db.execute(
            sql`INSERT INTO player_seasons (player_id, season_id) VALUES (${playerId}, ${activeSeasonId})`
          );
          console.log(`Debug: Added player ${playerId} to active season ${activeSeasonId}`);
        }
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error',
          stage: 'active_season_insert',
          error,
          playerId // Return playerId since the player was created
        });
      }
    }
    
    // Step 3: Return the created player
    try {
      const playerResult = await db.execute(
        sql`SELECT * FROM players WHERE id = ${playerId}`
      );
      
      if (!playerResult.rows || playerResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Player created but could not be retrieved',
          playerId
        });
      }
      
      // Get seasons for player
      const seasonsResult = await db.execute(
        sql`SELECT season_id FROM player_seasons WHERE player_id = ${playerId}`
      );
      
      const player = playerResult.rows[0];
      const playerSeasons = seasonsResult.rows ? seasonsResult.rows.map(row => Number(row.season_id)) : [];
      
      return res.status(201).json({
        success: true,
        player: {
          ...player,
          seasonIds: playerSeasons
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: true, // Still return success as player was created
        message: 'Player created but error retrieving details',
        error: error instanceof Error ? error.message : 'Unknown error',
        playerId
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error in player creation',
      error
    });
  }
}

/**
 * Update a player with direct SQL and detailed error reporting
 */
export async function updatePlayerDebug(req: Request, res: Response) {
  try {
    const playerId = Number(req.params.id);
    
    // Get update data
    const { displayName, firstName, lastName, dateOfBirth, positionPreferences, active, avatarColor, seasonIds } = req.body;
    
    console.log(`Debug update player ${playerId} with data:`, req.body);
    
    // Validate player exists
    const playerCheck = await db.execute(
      sql`SELECT id FROM players WHERE id = ${playerId}`
    );
    
    if (!playerCheck.rows || playerCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Player with ID ${playerId} not found`
      });
    }
    
    // Step 1: Update player record fields
    try {
      const updateFields = [];
      const values = [];
      
      if (displayName !== undefined) {
        await db.execute(
          sql`UPDATE players SET display_name = ${displayName} WHERE id = ${playerId}`
        );
      }
      
      if (firstName !== undefined) {
        await db.execute(
          sql`UPDATE players SET first_name = ${firstName} WHERE id = ${playerId}`
        );
      }
      
      if (lastName !== undefined) {
        await db.execute(
          sql`UPDATE players SET last_name = ${lastName} WHERE id = ${playerId}`
        );
      }
      
      if (dateOfBirth !== undefined) {
        await db.execute(
          sql`UPDATE players SET date_of_birth = ${dateOfBirth === null ? null : dateOfBirth} WHERE id = ${playerId}`
        );
      }
      
      if (active !== undefined) {
        await db.execute(
          sql`UPDATE players SET active = ${active} WHERE id = ${playerId}`
        );
      }
      
      if (avatarColor !== undefined) {
        await db.execute(
          sql`UPDATE players SET avatar_color = ${avatarColor} WHERE id = ${playerId}`
        );
      }
      
      if (positionPreferences !== undefined) {
        const positionsJson = JSON.stringify(positionPreferences);
        await db.execute(
          sql`UPDATE players SET position_preferences = ${positionsJson}::jsonb WHERE id = ${playerId}`
        );
      }
      
      console.log(`Debug: Updated player ${playerId} base fields`);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        stage: 'player_update',
        error
      });
    }
    
    // Step 2: Update season relationships if provided
    if (seasonIds !== undefined) {
      try {
        // Delete existing relationships
        await db.execute(
          sql`DELETE FROM player_seasons WHERE player_id = ${playerId}`
        );
        console.log(`Debug: Deleted existing seasons for player ${playerId}`);
        
        // Add new relationships
        if (Array.isArray(seasonIds) && seasonIds.length > 0) {
          for (const seasonId of seasonIds) {
            await db.execute(
              sql`INSERT INTO player_seasons (player_id, season_id) VALUES (${playerId}, ${seasonId})`
            );
            console.log(`Debug: Added player ${playerId} to season ${seasonId}`);
          }
        }
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error',
          stage: 'season_update',
          error
        });
      }
    }
    
    // Step 3: Return the updated player
    try {
      const playerResult = await db.execute(
        sql`SELECT * FROM players WHERE id = ${playerId}`
      );
      
      if (!playerResult.rows || playerResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Player updated but could not be retrieved'
        });
      }
      
      // Get seasons for player
      const seasonsResult = await db.execute(
        sql`SELECT season_id FROM player_seasons WHERE player_id = ${playerId}`
      );
      
      const player = playerResult.rows[0];
      const playerSeasons = seasonsResult.rows ? seasonsResult.rows.map(row => Number(row.season_id)) : [];
      
      return res.status(200).json({
        success: true,
        player: {
          ...player,
          seasonIds: playerSeasons
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: true, // Still return success as player was updated
        message: 'Player updated but error retrieving details',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error in player update',
      error
    });
  }
}

/**
 * Get player seasons with detailed error reporting
 */
export async function getPlayerSeasonsDebug(req: Request, res: Response) {
  try {
    const playerId = Number(req.params.id);
    
    // Check if player exists
    const playerCheck = await db.execute(
      sql`SELECT id FROM players WHERE id = ${playerId}`
    );
    
    if (!playerCheck.rows || playerCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Player with ID ${playerId} not found`
      });
    }
    
    // Get seasons for player
    const seasonsResult = await db.execute(
      sql`SELECT season_id FROM player_seasons WHERE player_id = ${playerId}`
    );
    
    const seasonIds = seasonsResult.rows ? seasonsResult.rows.map(row => Number(row.season_id)) : [];
    
    // Get season details
    const seasonDetails = [];
    if (seasonIds.length > 0) {
      for (const seasonId of seasonIds) {
        const seasonResult = await db.execute(
          sql`SELECT * FROM seasons WHERE id = ${seasonId}`
        );
        
        if (seasonResult.rows && seasonResult.rows.length > 0) {
          seasonDetails.push(seasonResult.rows[0]);
        }
      }
    }
    
    return res.status(200).json({
      success: true,
      seasonIds,
      seasons: seasonDetails
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error getting player seasons',
      error
    });
  }
}