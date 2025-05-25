/**
 * Direct player update handler with simplified error handling
 * This provides a simplified, direct approach for updating players with seasons
 */
import { Request, Response } from 'express';
import { db } from './db';
import { eq } from 'drizzle-orm';
import { players, playerSeasons } from '@shared/schema';
import { Pool } from '@neondatabase/serverless';

/**
 * A simplified endpoint for updating player with seasons in a single transaction
 */
export async function directUpdatePlayer(req: Request, res: Response) {
  console.log("\n=== DIRECT PLAYER UPDATE ===");
  console.log("Request params:", req.params);
  console.log("Request body:", JSON.stringify(req.body));
  
  const playerId = parseInt(req.params.id);
  const { 
    displayName, 
    firstName, 
    lastName, 
    dateOfBirth = null, 
    positionPreferences = [], 
    active = true,
    seasonIds = []
  } = req.body;
  
  // Input validation
  if (isNaN(playerId)) {
    console.log("❌ Invalid player ID");
    return res.status(400).json({ 
      success: false, 
      message: "Invalid player ID"
    });
  }
  
  // Ensure seasonIds is an array of numbers
  const validSeasonIds = Array.isArray(seasonIds) 
    ? seasonIds.filter(id => !isNaN(parseInt(String(id))))
    : [];
  
  console.log("✅ Validated inputs");
  console.log("Player ID:", playerId);
  console.log("Season IDs:", validSeasonIds);
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  
  try {
    // Start a transaction
    await client.query('BEGIN');
    
    // Step 1: Check if player exists
    const playerCheck = await client.query(
      'SELECT id FROM players WHERE id = $1',
      [playerId]
    );
    
    if (playerCheck.rowCount === 0) {
      await client.query('ROLLBACK');
      console.log("❌ Player not found");
      return res.status(404).json({ 
        success: false,
        message: "Player not found" 
      });
    }
    
    // Step 2: Update basic player data
    const playerUpdateResult = await client.query(
      `UPDATE players
       SET display_name = $1,
           first_name = $2,
           last_name = $3,
           date_of_birth = $4,
           position_preferences = $5::jsonb,
           active = $6
       WHERE id = $7
       RETURNING *`,
      [
        displayName,
        firstName,
        lastName,
        dateOfBirth,
        JSON.stringify(positionPreferences),
        active,
        playerId
      ]
    );
    
    if (playerUpdateResult.rowCount === 0) {
      await client.query('ROLLBACK');
      console.log("❌ Player update failed");
      return res.status(500).json({ 
        success: false,
        message: "Failed to update player" 
      });
    }
    
    console.log("✅ Player basic data updated");
    
    // Step 3: Clear existing player-season relationships
    await client.query(
      'DELETE FROM player_seasons WHERE player_id = $1',
      [playerId]
    );
    
    console.log("✅ Cleared existing player-season relationships");
    
    // Step 4: Insert new player-season relationships if any
    if (validSeasonIds.length > 0) {
      // Create placeholders for all values in one query
      const placeholders = validSeasonIds.map((_, i) => 
        `($1, $${i + 2})`
      ).join(', ');
      
      // Create parameters array
      const params = [playerId, ...validSeasonIds];
      
      await client.query(
        `INSERT INTO player_seasons (player_id, season_id) 
         VALUES ${placeholders}`,
        params
      );
      
      console.log(`✅ Added player to ${validSeasonIds.length} seasons`);
    } else {
      console.log("ℹ️ No seasons to associate with player");
    }
    
    // Commit the transaction
    await client.query('COMMIT');
    
    // Get the updated player with seasons for response
    const updatedPlayer = await client.query(
      `SELECT p.*, 
              ARRAY(
                SELECT s.id 
                FROM seasons s
                JOIN player_seasons ps ON s.id = ps.season_id
                WHERE ps.player_id = p.id
              ) as season_ids
       FROM players p
       WHERE p.id = $1`,
      [playerId]
    );
    
    console.log("✅ Transaction committed successfully");
    
    return res.json({
      success: true,
      message: "Player updated successfully",
      player: {
        ...updatedPlayer.rows[0],
        positionPreferences: updatedPlayer.rows[0].position_preferences,
        seasonIds: updatedPlayer.rows[0].season_ids
      }
    });
    
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error("❌ Error in direct player update:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update player",
      error: error instanceof Error ? error.message : String(error)
    });
  } finally {
    client.release();
  }
}