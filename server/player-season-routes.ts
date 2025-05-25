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
      `SELECT s.* 
       FROM seasons s
       JOIN player_seasons ps ON s.id = ps.season_id
       WHERE ps.player_id = $1
       ORDER BY s.start_date DESC`,
      [playerId]
    );

    return res.json(rows);
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
  // Import pool directly for raw SQL operations
  const { pool } = await import('./db');
  const client = await pool.connect();

  try {
    console.log("Starting transaction for player-season update");
    await client.query('BEGIN');

    // Delete existing relationships
    const deleteResult = await client.query(
      'DELETE FROM player_seasons WHERE player_id = $1', 
      [playerId]
    );
    console.log(`Deleted ${deleteResult.rowCount} existing player-season relationships`);

    // Insert new relationships
    for (const seasonId of seasonIds) {
      console.log(`Inserting player ${playerId} to season ${seasonId}`);
      
      try {
        await client.query(
          'INSERT INTO player_seasons (player_id, season_id) VALUES ($1, $2)',
          [playerId, seasonId]
        );
        console.log(`Successfully inserted player ${playerId} to season ${seasonId}`);
      } catch (insertError) {
        console.error(`Error inserting player ${playerId} to season ${seasonId}:`, insertError);
        throw insertError; // Propagate error to trigger rollback
      }
    }

    // Commit transaction
    await client.query('COMMIT');
    console.log("Transaction committed successfully");
    return true;
  } catch (error) {
    // Roll back on any error
    await client.query('ROLLBACK');
    console.error("Transaction rolled back due to error:", error);
    return false;
  } finally {
    // Always release the client
    client.release();
    console.log("Database client released");
  }
}