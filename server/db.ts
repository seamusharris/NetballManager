import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Enhanced connection pool configuration to prevent ECONNREFUSED errors
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  // Connection pool settings - optimized for performance
  max: 10, // Reduced from 20 to prevent too many connections
  min: 1,  // Reduced from 2 to minimize idle connections
  connectionTimeoutMillis: 5000, // Reduced timeout for faster failure detection
  idleTimeoutMillis: 60000, // Increased idle time to reduce churn
  // Retry settings
  maxUses: 10000, // Increased to reduce connection recycling
  // SSL settings for production
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Handle connect events - only log on errors or significant events
pool.on('connect', (client) => {
  // Only log if we're in debug mode
  if (process.env.DEBUG_DB_CONNECTIONS === 'true') {
    console.log('New database client connected');
  }
});

// Handle acquire events - only log if there are issues
pool.on('acquire', (client) => {
  // Only log if we're in debug mode or if there are too many connections
  if (process.env.DEBUG_DB_CONNECTIONS === 'true') {
    console.log('Database client acquired from pool');
  }
});

// Handle release events - only log if there are issues
pool.on('release', (client) => {
  // Only log if we're in debug mode
  if (process.env.DEBUG_DB_CONNECTIONS === 'true') {
    console.log('Database client released back to pool');
  }
});

export const db = drizzle(pool, { schema });

// Helper function to update player-season relationships
export async function updatePlayerSeasons(playerId: number, seasonIds: number[]) {
  console.log(`DB updatePlayerSeasons: Updating player ${playerId} with seasons:`, seasonIds);

  // Validate inputs
  if (!playerId || isNaN(playerId) || playerId <= 0) {
    console.error(`Invalid player ID: ${playerId}`);
    return false;
  }

  if (!Array.isArray(seasonIds)) {
    console.error(`Season IDs must be an array, received:`, seasonIds);
    seasonIds = [];
  }

  // Filter out any invalid season IDs
  const validSeasonIds = seasonIds.filter(id => 
    typeof id === 'number' && !isNaN(id) && id > 0
  );

  console.log(`DB updatePlayerSeasons: Valid season IDs:`, validSeasonIds);

  const client = await pool.connect();
  try {
    // First check if player exists
    const playerResult = await client.query(
      'SELECT id FROM players WHERE id = $1', 
      [playerId]
    );

    if (playerResult.rowCount === 0) {
      console.error(`Player with ID ${playerId} not found`);
      return false;
    }

    // Start transaction
    await client.query('BEGIN');

    // Delete existing relationships
    await client.query('DELETE FROM player_seasons WHERE player_id = $1', [playerId]);
    console.log(`Deleted existing season relationships for player ${playerId}`);

    // Insert new relationships if any exist
    if (validSeasonIds.length > 0) {
      // Prepare placeholders for bulk insert
      const placeholders = validSeasonIds.map((_, i) => 
        `($1, $${i + 2})`
      ).join(', ');

      // Parameters array with player ID as first param
      const params = [playerId, ...validSeasonIds];

      try {
        await client.query(
          `INSERT INTO player_seasons (player_id, season_id) VALUES ${placeholders}`,
          params
        );
        console.log(`Added player ${playerId} to seasons: ${validSeasonIds.join(', ')}`);
      } catch (insertError) {
        console.error(`Error adding player ${playerId} to seasons:`, insertError);
        await client.query('ROLLBACK');
        return false;
      }
    } else {
      console.log(`No valid seasons provided for player ${playerId}, all associations removed`);
    }

    // Commit transaction
    await client.query('COMMIT');
    console.log(`Successfully committed player-season relationships for player ${playerId}`);
    return true;
  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error('Error updating player seasons:', error);
    return false;
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
    // Set a shorter timeout for health checks
    client = await pool.connect();
    
    // Simple query with timeout
    const result = await Promise.race([
      client.query('SELECT 1'),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Health check timeout')), 3000)
      )
    ]);
    
    return true;
  } catch (error: any) {
    console.error('Database connection check failed:', {
      message: error.message,
      code: error.code,
      severity: error.severity
    });
    
    // Check if it's a connection termination error
    if (error.code === '57P01' || error.code === 'ECONNRESET') {
      console.log('Database connection was terminated, will attempt reconnection on next request');
    }
    
    return false;
  } finally {
    if (client) {
      try {
        client.release();
      } catch (releaseError) {
        console.warn('Error releasing client:', releaseError);
      }
    }
  }
}

// Future migrations can be added here when needed