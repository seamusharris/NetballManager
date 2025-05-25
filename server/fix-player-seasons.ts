/**
 * Direct SQL operation to fix player-season relationships
 * This file contains direct SQL operations to debug and fix player-season relationships
 * when the standard ORM approach isn't working properly
 */

import { Pool } from '@neondatabase/serverless';
import { Request, Response } from 'express';

// Set up database connection
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

/**
 * Direct endpoint for debugging player-season relationships
 */
export async function debugPlayerSeasons(req: Request, res: Response) {
  try {
    // Get all players with their seasons
    const result = await pool.query(`
      SELECT 
        p.id as player_id, 
        p.display_name,
        ARRAY_AGG(ps.season_id) as season_ids
      FROM 
        players p
      LEFT JOIN 
        player_seasons ps ON p.id = ps.player_id
      GROUP BY 
        p.id, p.display_name
      ORDER BY 
        p.display_name
    `);
    
    return res.json({
      success: true,
      count: result.rowCount,
      playerSeasons: result.rows
    });
  } catch (error) {
    console.error("Error debugging player seasons:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

/**
 * Direct SQL implementation to assign seasons to a player
 */
export async function assignPlayerSeasons(req: Request, res: Response) {
  const playerId = parseInt(req.params.id);
  const seasonIds = Array.isArray(req.body.seasonIds) ? req.body.seasonIds : [];
  
  console.log("Direct SQL player-season update", { playerId, seasonIds });
  console.log("Request body raw:", req.body);
  
  if (isNaN(playerId) || playerId <= 0) {
    return res.status(400).json({ 
      success: false,
      message: "Invalid player ID"
    });
  }
  
  const client = await pool.connect();
  
  try {
    // Start transaction
    await client.query('BEGIN');
    
    // First check if player exists
    const playerCheck = await client.query(
      'SELECT id FROM players WHERE id = $1',
      [playerId]
    );
    
    if (playerCheck.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        success: false, 
        message: "Player not found" 
      });
    }
    
    // Filter out invalid season IDs and convert strings to numbers
    const validSeasonIds = seasonIds
      .map((id: any) => typeof id === 'string' ? parseInt(id, 10) : id)
      .filter((id: number) => !isNaN(id) && id > 0);
    
    console.log("Valid season IDs for assignment:", validSeasonIds);
    
    // Delete existing relationships
    await client.query(
      'DELETE FROM player_seasons WHERE player_id = $1',
      [playerId]
    );
    
    // If we have seasons to assign, insert them
    if (validSeasonIds.length > 0) {
      const values = validSeasonIds.map((_, i) => `($1, $${i + 2})`).join(', ');
      const params = [playerId, ...validSeasonIds];
      
      await client.query(
        `INSERT INTO player_seasons (player_id, season_id) VALUES ${values}`,
        params
      );
    }
    
    // Commit the transaction
    await client.query('COMMIT');
    
    // Get updated seasons to return in response
    const updatedSeasons = await client.query(
      `SELECT s.*
       FROM seasons s
       JOIN player_seasons ps ON s.id = ps.season_id
       WHERE ps.player_id = $1
       ORDER BY s.start_date`,
      [playerId]
    );
    
    return res.json({
      success: true,
      message: `Player ${playerId} assigned to ${validSeasonIds.length} seasons`,
      seasons: updatedSeasons.rows.map(row => ({
        id: row.id,
        name: row.name,
        startDate: row.start_date,
        endDate: row.end_date,
        isActive: row.is_active,
        type: row.type,
        year: row.year,
        displayOrder: row.display_order
      }))
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error assigning seasons to player:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to assign seasons to player",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  } finally {
    client.release();
  }
}