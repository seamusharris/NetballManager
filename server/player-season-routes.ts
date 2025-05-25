/**
 * Dedicated module for handling player-season relationships
 */
import { Request, Response } from 'express';
import { players, playerSeasons } from '@shared/schema';
import { db } from './db';
import { eq } from 'drizzle-orm';
import { Pool } from '@neondatabase/serverless';

/**
 * Dedicated route handler for managing player-season relationships
 * @param req Express request object 
 * @param res Express response object
 */
export async function updatePlayerSeasonRelationships(req: Request, res: Response) {
  const playerId = parseInt(req.params.id, 10);
  let seasonIds = req.body.seasonIds || [];

  console.log("\n === DIRECT PLAYER-SEASON UPDATE ===");
  console.log("Player ID:", playerId);
  console.log("Raw season IDs:", JSON.stringify(seasonIds));

  if (isNaN(playerId)) {
    return res.status(400).json({ message: "Invalid player ID" });
  }

  try {
    // Validate that player exists
    const player = await db.query.players.findFirst({
      where: eq(players.id, playerId)
    });

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    // Convert seasonIds to an array if it's not already
    if (!Array.isArray(seasonIds)) {
      seasonIds = [seasonIds].filter(Boolean);
      console.log("Converted non-array seasonIds to:", seasonIds);
    }

    // Filter and convert season IDs to ensure they are valid numbers
    const processedSeasonIds = seasonIds
      .map((id: any) => typeof id === 'string' ? parseInt(id, 10) : id)
      .filter((id: number) => !isNaN(id) && id > 0);

    console.log("Processed season IDs:", processedSeasonIds);

    // Update the player-season relationships
    const success = await updatePlayerSeasons(playerId, processedSeasonIds);

    if (success) {
      return res.json({ 
        success: true, 
        message: `Updated player ${playerId} seasons to ${processedSeasonIds.join(', ')}` 
      });
    } else {
      return res.status(500).json({ 
        message: "Failed to update player-season relationships" 
      });
    }
  } catch (error) {
    console.error(`Error updating player-season relationships for player ${playerId}:`, error);
    return res.status(500).json({ 
      message: "Failed to update player-season relationships",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

/**
 * Get all seasons for a specific player
 */
export async function getPlayerSeasons(req: Request, res: Response) {
  const playerId = parseInt(req.params.id, 10);
  
  if (isNaN(playerId)) {
    return res.status(400).json({ message: "Invalid player ID" });
  }

  try {
    // Validate that player exists
    const player = await db.query.players.findFirst({
      where: eq(players.id, playerId)
    });

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    // Get player's seasons using raw SQL for greater flexibility
    const { pool } = await import('./db');
    const { rows } = await pool.query(
      `SELECT 
        s.id,
        s.name,
        s.start_date,
        s.end_date,
        s.is_active,
        s.type,
        s.year,
        s.display_order
       FROM seasons s
       JOIN player_seasons ps ON s.id = ps.season_id
       WHERE ps.player_id = $1
       ORDER BY s.start_date DESC`,
      [playerId]
    );
    
    // Convert snake_case from database to camelCase for frontend
    const formattedSeasons = rows.map(row => ({
      id: row.id,
      name: row.name,
      startDate: row.start_date,
      endDate: row.end_date,
      isActive: row.is_active,
      type: row.type,
      year: row.year,
      displayOrder: row.display_order
    }));

    return res.json(formattedSeasons);
  } catch (error) {
    console.error(`Error getting seasons for player ${playerId}:`, error);
    return res.status(500).json({ 
      message: "Failed to get player seasons",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

/**
 * Update the seasons associated with a player
 * @param playerId The player ID
 * @param seasonIds Array of season IDs to associate with the player
 */
export async function updatePlayerSeasons(playerId: number, seasonIds: number[]): Promise<boolean> {
  try {
    console.log("\n==== UPDATE PLAYER SEASONS ====");
    console.log(`Player ID: ${playerId}`);
    console.log(`Season IDs: ${seasonIds.join(', ')}`);
    
    // Use db for Drizzle ORM operations whenever possible
    // Check if player exists
    const player = await db.query.players.findFirst({
      where: eq(players.id, playerId)
    });
    
    if (!player) {
      console.error(`Player with ID ${playerId} does not exist`);
      return false;
    }
    
    // Skip excessive validation - we trust the seasons passed in
    let validSeasonIds = seasonIds;
    console.log(`Using provided season IDs: ${validSeasonIds.join(', ')}`);
    
    // Only perform basic validation if needed in the future
    
    // Get a client from the pool for transaction
    const { pool } = await import('./db');
    const client = await pool.connect();
    
    try {
      // Start transaction
      await client.query('BEGIN');
      
      // 1. Delete existing relationships
      console.log(`Deleting existing player-season relationships for player ${playerId}`);
      await client.query(
        'DELETE FROM player_seasons WHERE player_id = $1', 
        [playerId]
      );
      
      // 2. Insert new relationships as a batch if we have any
      if (validSeasonIds.length > 0) {
        // Create values string for bulk insert
        const values = validSeasonIds.map((_, index) => 
          `($1, $${index + 2})`
        ).join(', ');
        
        // Create parameters array with player ID as first param
        const params = [playerId, ...validSeasonIds];
        
        console.log(`Inserting ${validSeasonIds.length} player-season relationships`);
        await client.query(
          `INSERT INTO player_seasons (player_id, season_id) 
           VALUES ${values} 
           ON CONFLICT (player_id, season_id) DO NOTHING`,
          params
        );
      }
      
      // Commit transaction
      await client.query('COMMIT');
      console.log(`Successfully updated player-season relationships for player ${playerId}`);
      return true;
    } catch (txError) {
      // Rollback transaction on error
      await client.query('ROLLBACK');
      console.error("Transaction error:", txError);
      return false;
    } finally {
      // Always release client
      client.release();
    }
  } catch (error) {
    console.error("Error in updatePlayerSeasons:", error);
    return false;
  }
}