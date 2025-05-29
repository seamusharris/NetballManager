
import { db } from "./db";
import { sql } from "drizzle-orm";
import { Position, POSITIONS } from "@shared/schema";

/**
 * Create a fallback roster for games that don't have complete roster assignments
 * This ensures we can still track position-based stats even without knowing exact players
 */
export async function createFallbackRoster(gameId: number): Promise<void> {
  try {
    console.log(`Creating fallback roster for game ${gameId}`);
    
    // Check if game already has any roster entries
    const existingRoster = await db.execute(sql`
      SELECT COUNT(*) as count FROM rosters WHERE game_id = ${gameId}
    `);
    
    const rosterCount = existingRoster.rows[0]?.count || 0;
    
    // If game already has some roster entries, don't create fallback
    if (rosterCount > 0) {
      console.log(`Game ${gameId} already has ${rosterCount} roster entries, skipping fallback`);
      return;
    }
    
    // Get a list of active players to use for fallback assignments
    const activePlayers = await db.execute(sql`
      SELECT id FROM players WHERE active = true ORDER BY id LIMIT 7
    `);
    
    if (activePlayers.rows.length < 7) {
      console.warn(`Only ${activePlayers.rows.length} active players available for fallback roster`);
    }
    
    // Create basic roster assignments for Quarter 1 only
    // This gives us the minimum needed for position-based stats tracking
    const fallbackAssignments = [];
    
    for (let i = 0; i < POSITIONS.length; i++) {
      const position = POSITIONS[i];
      const playerId = activePlayers.rows[i % activePlayers.rows.length]?.id;
      
      if (playerId) {
        fallbackAssignments.push({
          gameId,
          quarter: 1,
          position,
          playerId
        });
      }
    }
    
    // Insert fallback roster entries
    for (const assignment of fallbackAssignments) {
      await db.execute(sql`
        INSERT INTO rosters (game_id, quarter, position, player_id)
        VALUES (${assignment.gameId}, ${assignment.quarter}, ${assignment.position}, ${assignment.playerId})
      `);
    }
    
    console.log(`Created ${fallbackAssignments.length} fallback roster entries for game ${gameId}`);
    
  } catch (error) {
    console.error(`Error creating fallback roster for game ${gameId}:`, error);
    // Don't throw - fallback roster creation is optional
  }
}

/**
 * Get or create roster context for position-based stats
 * This ensures we always have position assignments for stats tracking
 */
export async function ensurePositionContext(gameId: number, quarter: number, position: Position): Promise<number | null> {
  try {
    // First, try to find existing roster assignment
    const existingAssignment = await db.execute(sql`
      SELECT player_id FROM rosters 
      WHERE game_id = ${gameId} AND quarter = ${quarter} AND position = ${position}
      LIMIT 1
    `);
    
    if (existingAssignment.rows.length > 0) {
      return existingAssignment.rows[0].player_id;
    }
    
    // No existing assignment, try to find any assignment for this position in quarter 1
    const q1Assignment = await db.execute(sql`
      SELECT player_id FROM rosters 
      WHERE game_id = ${gameId} AND quarter = 1 AND position = ${position}
      LIMIT 1
    `);
    
    if (q1Assignment.rows.length > 0) {
      // Create assignment for this quarter using Q1 player
      const playerId = q1Assignment.rows[0].player_id;
      
      await db.execute(sql`
        INSERT INTO rosters (game_id, quarter, position, player_id)
        VALUES (${gameId}, ${quarter}, ${position}, ${playerId})
      `);
      
      console.log(`Extended Q1 roster assignment: Game ${gameId}, Q${quarter}, ${position} -> Player ${playerId}`);
      return playerId;
    }
    
    // Still no assignment, create a minimal one
    const activePlayers = await db.execute(sql`
      SELECT id FROM players WHERE active = true ORDER BY id LIMIT 1
    `);
    
    if (activePlayers.rows.length > 0) {
      const playerId = activePlayers.rows[0].id;
      
      await db.execute(sql`
        INSERT INTO rosters (game_id, quarter, position, player_id)
        VALUES (${gameId}, ${quarter}, ${position}, ${playerId})
      `);
      
      console.log(`Created minimal roster assignment: Game ${gameId}, Q${quarter}, ${position} -> Player ${playerId}`);
      return playerId;
    }
    
    console.warn(`No active players available for position context: Game ${gameId}, Q${quarter}, ${position}`);
    return null;
    
  } catch (error) {
    console.error(`Error ensuring position context: Game ${gameId}, Q${quarter}, ${position}:`, error);
    return null;
  }
}
