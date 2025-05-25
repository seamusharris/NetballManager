/**
 * Direct player update handler with simplified error handling
 * This provides a simplified, direct approach for updating players with seasons
 */
import { Request, Response } from 'express';
import { db } from './db';
import { players, playerSeasons } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';
import { Pool } from '@neondatabase/serverless';

/**
 * A simplified endpoint for updating player with seasons in a single transaction
 */
export async function directUpdatePlayer(req: Request, res: Response) {
  const playerId = parseInt(req.params.id, 10);
  if (isNaN(playerId)) {
    return res.status(400).json({ message: "Invalid player ID" });
  }

  const { seasonIds, ...playerData } = req.body;

  console.log("========== DIRECT PLAYER UPDATE ==========");
  console.log("Player ID:", playerId);
  console.log("Player data:", JSON.stringify(playerData));
  console.log("Season IDs:", JSON.stringify(seasonIds));

  // Process season IDs to ensure they are valid numbers
  let processedSeasonIds: number[] = [];
  if (Array.isArray(seasonIds)) {
    processedSeasonIds = seasonIds
      .map((id: any) => typeof id === 'string' ? parseInt(id, 10) : id)
      .filter((id: number) => !isNaN(id) && id > 0);
  }
  
  console.log("Processed season IDs:", processedSeasonIds);

  try {
    // 1. First use raw SQL for the player update to ensure proper JSON handling
    const { pool } = await import('./db');
    
    // Validate player exists
    const checkResult = await pool.query(
      'SELECT id FROM players WHERE id = $1',
      [playerId]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: "Player not found" });
    }

    // Start a raw SQL transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update the player record
      let updateSql = `
        UPDATE players 
        SET 
          display_name = $1,
          first_name = $2,
          last_name = $3,
          active = $4
      `;
      
      const params = [
        playerData.displayName || '',
        playerData.firstName || '',
        playerData.lastName || '',
        playerData.active === true || playerData.active === 'true'
      ];
      
      // Handle position preferences carefully
      if (playerData.positionPreferences) {
        updateSql += `, position_preferences = $5::jsonb`;
        const jsonPositions = Array.isArray(playerData.positionPreferences) 
          ? JSON.stringify(playerData.positionPreferences)
          : JSON.stringify([]);
        params.push(jsonPositions);
      }
      
      updateSql += ` WHERE id = $${params.length + 1}`;
      params.push(playerId);
      
      console.log("Executing SQL:", updateSql);
      console.log("With params:", params);
      
      await client.query(updateSql, params);
      
      // Handle seasons if provided
      if (processedSeasonIds.length > 0) {
        // Delete existing relationships
        await client.query(
          'DELETE FROM player_seasons WHERE player_id = $1',
          [playerId]
        );
        
        // Insert new relationships
        for (const seasonId of processedSeasonIds) {
          await client.query(
            'INSERT INTO player_seasons (player_id, season_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [playerId, seasonId]
          );
        }
      }
      
      await client.query('COMMIT');
      
      console.log("Transaction completed successfully");
      return res.json({ 
        success: true, 
        message: "Player updated successfully with seasons" 
      });
    } catch (txError) {
      await client.query('ROLLBACK');
      console.error("Transaction error:", txError);
      return res.status(500).json({ 
        message: "Failed to update player in transaction",
        error: txError instanceof Error ? txError.message : "Unknown transaction error"
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error in directUpdatePlayer:", error);
    return res.status(500).json({ 
      message: "Failed to update player",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}