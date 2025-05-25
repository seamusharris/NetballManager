/**
 * Direct diagnostic tool for player-season relationships
 * This module provides dedicated debugging and diagnostics for the player-seasons functionality
 */
import { Request, Response } from 'express';
import { db } from './db';
import { eq } from 'drizzle-orm';
import { players, playerSeasons, seasons } from '@shared/schema';
import { Pool } from '@neondatabase/serverless';

// Direct diagnostic endpoint for player-season relationships
export async function diagnosePlayerSeasons(req: Request, res: Response) {
  console.log("\n=== PLAYER-SEASON DIAGNOSTIC ===");
  console.log("Starting player-season diagnostic");
  
  try {
    // 1. Check database connection
    console.log("Step 1: Checking database connection");
    try {
      const seasonCount = await db.select({ count: seasons.id }).from(seasons);
      console.log(`Database connection successful, found ${seasonCount[0]?.count || 0} seasons`);
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return res.status(500).json({
        success: false,
        step: "database_connection",
        error: dbError instanceof Error ? dbError.message : String(dbError)
      });
    }
    
    // 2. List all players
    console.log("Step 2: Listing all players");
    const allPlayers = await db.select().from(players);
    console.log(`Found ${allPlayers.length} players`);
    
    // 3. List all seasons
    console.log("Step 3: Listing all seasons");
    const allSeasons = await db.select().from(seasons);
    console.log(`Found ${allSeasons.length} seasons`);
    
    // 4. List all player-season relationships
    console.log("Step 4: Listing all player-season relationships");
    const allRelationships = await db.select().from(playerSeasons);
    console.log(`Found ${allRelationships.length} player-season relationships`);
    
    // 5. Try creating a test relationship using direct SQL
    const testPlayerId = allPlayers[0]?.id;
    const testSeasonId = allSeasons[0]?.id;
    
    if (testPlayerId && testSeasonId) {
      console.log(`Step 5: Testing player-season relationship for player ${testPlayerId} and season ${testSeasonId}`);
      
      // First, check if this relationship already exists
      const existingRelationship = await db.select().from(playerSeasons)
        .where(eq(playerSeasons.playerId, testPlayerId))
        .where(eq(playerSeasons.seasonId, testSeasonId));
      
      console.log(`Found ${existingRelationship.length} existing relationships for this player-season pair`);
      
      // Try direct insert using a client
      console.log("Step 6: Testing direct SQL insert");
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // Delete first to avoid duplicates
        await client.query(
          'DELETE FROM player_seasons WHERE player_id = $1 AND season_id = $2',
          [testPlayerId, testSeasonId]
        );
        
        // Then insert
        await client.query(
          'INSERT INTO player_seasons (player_id, season_id) VALUES ($1, $2)',
          [testPlayerId, testSeasonId]
        );
        
        await client.query('COMMIT');
        console.log("Direct SQL insert successful");
      } catch (sqlError) {
        await client.query('ROLLBACK');
        console.error("Direct SQL insert failed:", sqlError);
        return res.status(500).json({
          success: false,
          step: "direct_sql_insert",
          error: sqlError instanceof Error ? sqlError.message : String(sqlError)
        });
      } finally {
        client.release();
      }
      
      // Try direct ORM insert
      console.log("Step 7: Testing ORM insert");
      try {
        // Delete first using ORM
        await db.delete(playerSeasons)
          .where(eq(playerSeasons.playerId, testPlayerId))
          .where(eq(playerSeasons.seasonId, testSeasonId));
        
        // Then insert using ORM
        await db.insert(playerSeasons).values({
          playerId: testPlayerId,
          seasonId: testSeasonId
        });
        
        console.log("ORM insert successful");
      } catch (ormError) {
        console.error("ORM insert failed:", ormError);
        return res.status(500).json({
          success: false,
          step: "orm_insert",
          error: ormError instanceof Error ? ormError.message : String(ormError)
        });
      }
    } else {
      console.log("No players or seasons found for testing relationships");
    }
    
    // Success response
    return res.json({
      success: true,
      message: "Player-season diagnostic completed successfully",
      data: {
        playerCount: allPlayers.length,
        seasonCount: allSeasons.length,
        relationshipCount: allRelationships.length,
        testPlayerId,
        testSeasonId
      }
    });
  } catch (error) {
    console.error("Error in player-season diagnostic:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}