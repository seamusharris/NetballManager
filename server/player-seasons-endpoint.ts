import { Request, Response } from "express";
import { db } from "./db";
import { sql } from "drizzle-orm";
import { storage } from "./storage";

/**
 * Dedicated endpoint handler for updating player-season relationships
 * This can be imported and used in routes.ts
 */
export async function updatePlayerSeasons(req: Request, res: Response) {
  try {
    const playerId = parseInt(req.params.id);
    if (isNaN(playerId)) {
      return res.status(400).json({ message: "Invalid player ID" });
    }
    
    // Check if player exists
    const player = await storage.getPlayer(playerId);
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }
    
    const { seasonIds } = req.body;
    if (!Array.isArray(seasonIds)) {
      return res.status(400).json({ message: "seasonIds must be an array" });
    }
    
    console.log(`Updating seasons for player ${playerId}:`, seasonIds);
    
    // Use direct SQL for maximum reliability
    try {
      // First remove all existing associations
      await db.execute(sql`DELETE FROM player_seasons WHERE player_id = ${playerId}`);
      
      // Then add new associations if provided
      if (seasonIds.length > 0) {
        for (const seasonId of seasonIds) {
          console.log(`Adding player ${playerId} to season ${seasonId}`);
          
          // Check if season exists
          const seasonCheck = await db.execute(sql`SELECT id FROM seasons WHERE id = ${seasonId} LIMIT 1`);
          if (seasonCheck.rows && seasonCheck.rows.length > 0) {
            await db.execute(sql`
              INSERT INTO player_seasons (player_id, season_id)
              VALUES (${playerId}, ${seasonId})
              ON CONFLICT DO NOTHING
            `);
          } else {
            console.warn(`Season ${seasonId} not found, skipping`);
          }
        }
      }
      
      // Get updated season IDs for response
      const updatedSeasons = await storage.getPlayerSeasons(playerId);
      
      return res.json({
        message: "Player seasons updated successfully",
        playerId,
        seasonIds: updatedSeasons
      });
    } catch (error) {
      console.error("Error in SQL operations:", error);
      return res.status(500).json({ 
        message: "Database error while updating player seasons",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  } catch (error) {
    console.error("Error in updatePlayerSeasons handler:", error);
    return res.status(500).json({ 
      message: "Failed to update player seasons",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}