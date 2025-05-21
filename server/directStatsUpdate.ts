/**
 * Direct database operations for game stats
 * A specialized module to handle position-based statistics updates
 */
import { eq, and } from 'drizzle-orm';
import { db } from './db';
import { gameStats, type GameStat, type InsertGameStat } from '@shared/schema';

/**
 * Update a specific position's stats for a given game and quarter
 */
export async function updatePositionStats(
  gameId: number,
  position: string,
  quarter: number,
  statValues: Partial<GameStat>
): Promise<boolean> {
  try {
    console.log(`Directly updating ${position} Q${quarter} stats for game ${gameId}:`, statValues);
    
    // Find the existing stat record
    const existingStats = await db.select()
      .from(gameStats)
      .where(
        and(
          eq(gameStats.gameId, gameId),
          eq(gameStats.position, position),
          eq(gameStats.quarter, quarter)
        )
      );
    
    if (existingStats.length > 0) {
      // Update existing stat
      const existingStat = existingStats[0];
      await db.update(gameStats)
        .set(statValues)
        .where(eq(gameStats.id, existingStat.id));
      
      console.log(`✓ Updated stat ID ${existingStat.id} for ${position} Q${quarter}`);
      return true;
    } else {
      // Create new stat
      const newStat: InsertGameStat = {
        gameId,
        position,
        quarter,
        goalsFor: 0,
        goalsAgainst: 0,
        missedGoals: 0,
        rebounds: 0,
        intercepts: 0,
        badPass: 0,
        handlingError: 0,
        pickUp: 0,
        infringement: 0,
        rating: null,
        ...statValues
      };
      
      await db.insert(gameStats).values(newStat);
      console.log(`✓ Created new stat for ${position} Q${quarter}`);
      return true;
    }
  } catch (error) {
    console.error(`Error directly updating stats for ${position} Q${quarter}:`, error);
    return false;
  }
}