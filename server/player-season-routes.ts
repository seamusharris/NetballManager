import { Request, Response } from 'express';
import { z } from 'zod';
import { db } from './db';
import { sql } from 'drizzle-orm';
import { storage } from './storage';

// Schema for validating player-season update requests
const updatePlayerSeasonSchema = z.object({
  playerId: z.number().int().positive(),
  seasonIds: z.array(z.number().int().positive())
});

/**
 * Dedicated route handler for managing player-season relationships
 * @param req Express request object 
 * @param res Express response object
 */
export async function updatePlayerSeasonRelationships(req: Request, res: Response) {
  try {
    // Validate the request body
    const validation = updatePlayerSeasonSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid request format",
        errors: validation.error.errors
      });
    }
    
    const { playerId, seasonIds } = validation.data;
    
    // Log the validated data
    console.log(`Player-Season API: Updating player ${playerId} with seasons:`, seasonIds);
    
    // Verify the player exists
    const player = await storage.getPlayer(playerId);
    if (!player) {
      return res.status(404).json({
        success: false,
        message: `Player with ID ${playerId} not found`
      });
    }
    
    try {
      // Use direct SQL execution to handle the relationship updates
      
      // 1. Delete existing relationships
      await db.execute(sql`DELETE FROM player_seasons WHERE player_id = ${playerId}`);
      console.log(`Player-Season API: Deleted existing relationships for player ${playerId}`);
      
      // 2. Insert new relationships if there are any
      if (seasonIds.length > 0) {
        // Create a multi-row insert statement
        const values = seasonIds
          .map(seasonId => `(${playerId}, ${seasonId})`)
          .join(', ');
        
        const insertQuery = sql`
          INSERT INTO player_seasons (player_id, season_id)
          VALUES ${sql.raw(values)}
          ON CONFLICT (player_id, season_id) DO NOTHING
        `;
        
        await db.execute(insertQuery);
        console.log(`Player-Season API: Added player ${playerId} to seasons:`, seasonIds);
      }
      
      // Return success response
      return res.status(200).json({
        success: true,
        message: "Player-season relationships updated successfully",
        player: {
          id: playerId,
          name: player.displayName
        },
        seasonCount: seasonIds.length,
        seasonIds
      });
    } catch (dbError) {
      console.error(`Player-Season API: Database error:`, dbError);
      return res.status(500).json({
        success: false,
        message: "Database error occurred while updating player-season relationships",
        error: dbError.message
      });
    }
  } catch (error) {
    console.error(`Player-Season API: Unexpected error:`, error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred",
      error: error.message
    });
  }
}

/**
 * Get all seasons for a specific player
 */
export async function getPlayerSeasons(req: Request, res: Response) {
  try {
    const playerId = parseInt(req.params.playerId, 10);
    
    if (isNaN(playerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid player ID"
      });
    }
    
    // Verify the player exists
    const player = await storage.getPlayer(playerId);
    if (!player) {
      return res.status(404).json({
        success: false,
        message: `Player with ID ${playerId} not found`
      });
    }
    
    // Get all seasons for the player
    const result = await db.execute(sql`
      SELECT s.* 
      FROM seasons s
      JOIN player_seasons ps ON s.id = ps.season_id
      WHERE ps.player_id = ${playerId}
      ORDER BY s.year DESC, s.display_order DESC
    `);
    
    return res.status(200).json({
      success: true,
      player: {
        id: playerId,
        name: player.displayName
      },
      seasons: result.rows
    });
  } catch (error) {
    console.error(`Player-Season API: Error fetching player seasons:`, error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching player seasons",
      error: error.message
    });
  }
}