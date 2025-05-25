import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

// Helper function to update player-season relationships
export async function updatePlayerSeasons(playerId: number, seasonIds: number[]) {
  const client = await pool.connect();
  try {
    // Start transaction
    await client.query('BEGIN');
    
    // Delete existing relationships
    await client.query('DELETE FROM player_seasons WHERE player_id = $1', [playerId]);
    console.log(`Deleted existing season relationships for player ${playerId}`);
    
    // Insert new relationships if any exist
    if (seasonIds && seasonIds.length > 0) {
      // Process each seasonId individually with error handling
      for (const seasonId of seasonIds) {
        try {
          await client.query(
            'INSERT INTO player_seasons (player_id, season_id) VALUES ($1, $2) ON CONFLICT (player_id, season_id) DO NOTHING',
            [playerId, seasonId]
          );
          console.log(`Added player ${playerId} to season ${seasonId}`);
        } catch (insertError) {
          console.error(`Error adding player ${playerId} to season ${seasonId}:`, insertError);
          // Continue with next season instead of failing completely
        }
      }
    } else {
      console.log(`No seasons provided for player ${playerId}, all associations removed`);
    }
    
    // Commit transaction
    await client.query('COMMIT');
    console.log(`Successfully committed player-season relationships for player ${playerId}`);
    return true;
  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error('Error updating player seasons:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Function to get all seasons for a player
export async function getPlayerSeasons(playerId: number) {
  try {
    const result = await pool.query(
      'SELECT s.* FROM seasons s JOIN player_seasons ps ON s.id = ps.season_id WHERE ps.player_id = $1',
      [playerId]
    );
    return result.rows;
  } catch (error) {
    console.error(`Error fetching seasons for player ${playerId}:`, error);
    throw error;
  }
}

export async function checkPoolHealth() {
  let client;
  try {
    client = await pool.connect();
    await client.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  } finally {
    if (client) client.release();
  }
}