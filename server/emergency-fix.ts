/**
 * Emergency fix for player-season relationships
 * 
 * This module provides a direct database operation endpoint to bypass all
 * ORM and abstraction layers to directly manage player-season relationships.
 */

import { Request, Response } from 'express';
import { Pool } from '@neondatabase/serverless';

// Create a database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Direct database endpoint to fix player-season relationships
 */
export async function fixPlayerSeasons(req: Request, res: Response) {
  const playerId = parseInt(req.params.id, 10);
  let seasonIds = req.body.seasonIds || [];

  console.log("==== EMERGENCY FIX: PLAYER-SEASONS ====");
  console.log(`Player ID: ${playerId}`);
  console.log(`Raw seasonIds: ${JSON.stringify(seasonIds)}`);
  console.log(`Request body: ${JSON.stringify(req.body)}`);
  
  // Validate playerId
  if (isNaN(playerId) || playerId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid player ID"
    });
  }

  // Ensure seasonIds is an array
  if (!Array.isArray(seasonIds)) {
    seasonIds = [];
  }
  
  // Convert and validate seasonIds
  const validSeasonIds = seasonIds
    .map((id: any) => typeof id === 'string' ? parseInt(id, 10) : id)
    .filter((id: number) => !isNaN(id) && id > 0);
  
  console.log(`Valid season IDs: ${validSeasonIds.join(', ')}`);
  
  // Get a client from the pool
  const client = await pool.connect();
  
  try {
    // Start transaction
    await client.query('BEGIN');
    
    // Check if player exists
    const playerResult = await client.query(
      'SELECT id FROM players WHERE id = $1',
      [playerId]
    );
    
    if (playerResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: "Player not found"
      });
    }
    
    // Delete existing relationships
    await client.query(
      'DELETE FROM player_seasons WHERE player_id = $1',
      [playerId]
    );
    
    console.log(`Deleted existing player-season relationships for player ${playerId}`);
    
    // Insert new relationships if any
    if (validSeasonIds.length > 0) {
      // Create placeholders for all values in one query
      const placeholders = validSeasonIds.map((_, i) => 
        `($1, $${i + 2})`
      ).join(', ');
      
      // Create parameters array
      const params = [playerId, ...validSeasonIds];
      
      console.log(`SQL: INSERT INTO player_seasons (player_id, season_id) VALUES ${placeholders}`);
      console.log(`Params: ${params.join(', ')}`);
      
      // Insert all relationships in one query
      await client.query(
        `INSERT INTO player_seasons (player_id, season_id) VALUES ${placeholders}`,
        params
      );
      
      console.log(`Added player ${playerId} to seasons: ${validSeasonIds.join(', ')}`);
    } else {
      console.log(`No seasons provided for player ${playerId}, all associations removed`);
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    // Get updated seasons for response
    const seasonsResult = await client.query(
      `SELECT s.* 
       FROM seasons s
       JOIN player_seasons ps ON s.id = ps.season_id
       WHERE ps.player_id = $1
       ORDER BY s.start_date DESC`,
      [playerId]
    );
    
    const updatedSeasons = seasonsResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      startDate: row.start_date,
      endDate: row.end_date,
      isActive: row.is_active,
      type: row.type,
      year: row.year,
      displayOrder: row.display_order
    }));
    
    console.log(`Successfully updated player-season relationships for player ${playerId}`);
    
    return res.json({
      success: true,
      message: `Player ${playerId} updated with ${validSeasonIds.length} seasons`,
      seasons: updatedSeasons
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error in emergency player-season fix:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update player-season relationships",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  } finally {
    client.release();
  }
}