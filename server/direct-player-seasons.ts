/**
 * Direct handler for player-season relationships
 * This bypasses the normal API flow and provides a direct endpoint for updating
 * player-season relationships when the regular flow is experiencing issues
 */

import { Request, Response } from 'express';
import { Pool } from '@neondatabase/serverless';

// Database connection
let pool: Pool | null = null;

function getPool() {
  if (!pool) {
    const { Pool } = require('@neondatabase/serverless');
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

/**
 * Direct endpoint for updating player-season relationships
 */
export async function directUpdatePlayerSeasons(req: Request, res: Response) {
  const playerId = parseInt(req.params.id);
  const seasonIds = req.body.seasonIds || [];
  
  console.log("=== DIRECT PLAYER-SEASON UPDATE ===");
  console.log("Player ID:", playerId);
  console.log("Season IDs:", seasonIds);
  
  if (isNaN(playerId) || playerId <= 0) {
    return res.status(400).json({ message: "Invalid player ID" });
  }
  
  // Filter out invalid season IDs
  const validSeasonIds = seasonIds.filter((id: any) => {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    return !isNaN(numId) && numId > 0;
  });
  
  console.log("Valid season IDs:", validSeasonIds);
  
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    // Start transaction
    await client.query('BEGIN');
    
    // Check if player exists
    const playerCheck = await client.query(
      'SELECT id FROM players WHERE id = $1',
      [playerId]
    );
    
    if (playerCheck.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Player not found" });
    }
    
    // Delete existing relationships
    await client.query(
      'DELETE FROM player_seasons WHERE player_id = $1',
      [playerId]
    );
    
    // Insert new relationships if any exist
    if (validSeasonIds.length > 0) {
      // Create placeholders for all values
      const placeholders = validSeasonIds.map((_, i) => 
        `($1, $${i + 2})`
      ).join(', ');
      
      // Create parameters array
      const params = [playerId, ...validSeasonIds];
      
      // Insert all relationships in one query
      await client.query(
        `INSERT INTO player_seasons (player_id, season_id) 
         VALUES ${placeholders}`,
        params
      );
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    // Get updated seasons for response
    const result = await client.query(
      `SELECT s.* 
       FROM seasons s
       JOIN player_seasons ps ON s.id = ps.season_id
       WHERE ps.player_id = $1
       ORDER BY s.start_date DESC`,
      [playerId]
    );
    
    // Format the response
    const updatedSeasons = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      startDate: row.start_date,
      endDate: row.end_date,
      isActive: row.is_active,
      type: row.type,
      year: row.year,
      displayOrder: row.display_order
    }));
    
    return res.json({
      success: true,
      message: `Updated player ${playerId} with ${validSeasonIds.length} seasons`,
      seasons: updatedSeasons
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error updating player-season relationships:", error);
    return res.status(500).json({
      message: "Failed to update player-season relationships",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  } finally {
    client.release();
  }
}