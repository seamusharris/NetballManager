/**
 * Direct SQL test for player-season relationships
 */

import { Request, Response } from 'express';
import { Pool } from '@neondatabase/serverless';
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';

// Configure Neon to use websockets
neonConfig.webSocketConstructor = ws;

// Create a database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Test direct player-season operations
 */
export async function testPlayerSeasons(req: Request, res: Response) {
  try {
    // Get parameters from request
    const playerId = parseInt(req.params.id);
    const seasonIds = req.body.seasonIds || [];
    
    // Basic validation
    if (isNaN(playerId) || playerId <= 0) {
      return res.status(400).send("Invalid player ID");
    }
    
    // Log exact data received
    console.log('TEST ENDPOINT - Raw request parameters:');
    console.log('- playerId:', playerId);
    console.log('- seasonIds (raw):', JSON.stringify(seasonIds));
    console.log('- Full request body:', JSON.stringify(req.body));
    
    // Execute a simple database query
    const client = await pool.connect();
    try {
      // Check if player exists
      const playerQuery = await client.query('SELECT id, display_name FROM players WHERE id = $1', [playerId]);
      
      // Log query results
      console.log('Player query result:', playerQuery.rows);
      
      if (playerQuery.rowCount === 0) {
        return res.status(404).send("Player not found");
      }
      
      // Convert and validate seasonIds
      const validSeasonIds = seasonIds
        .map((id: any) => typeof id === 'string' ? parseInt(id, 10) : id)
        .filter((id: number) => !isNaN(id) && id > 0);
      
      console.log('Parsed season IDs:', validSeasonIds);
      
      // Check if seasons exist
      const seasonQuery = await client.query(
        'SELECT id, name FROM seasons WHERE id = ANY($1::int[])',
        [validSeasonIds]
      );
      
      console.log('Season query result:', seasonQuery.rows);
      
      // Return diagnostic info
      return res.json({
        success: true,
        message: "Test completed successfully",
        player: playerQuery.rows[0],
        requestedSeasons: seasonIds,
        validSeasons: validSeasonIds,
        foundSeasons: seasonQuery.rows,
        summary: "This is a diagnostic endpoint to test database connection and query parsing"
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("TEST ERROR:", error);
    // Return detailed error info
    return res.status(500).json({
      success: false,
      message: "Test failed with error",
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : String(error)
    });
  }
}