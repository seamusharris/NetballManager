/**
 * Direct database access for emergency stat updates
 * This bypasses the normal API flow when we need reliable stat updates
 */

import { eq, and } from 'drizzle-orm';
import { db } from './db';
import { gameStats, type GameStat, type InsertGameStat } from '@shared/schema';

/**
 * Create or update stats directly in the database
 * This function takes complete stat objects and upserts them directly
 */
export async function upsertStats(stats: StatUpdate[]): Promise<boolean> {
  try {
    // Process each stat one at a time for reliability
    for (const stat of stats) {
      const { gameId, position, quarter, ...values } = stat;
      
      // First check if the stat exists
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
          .set(values)
          .where(eq(gameStats.id, existingStat.id));
          
        console.log(`Updated stat ID ${existingStat.id} for ${position} Q${quarter}`);
      } else {
        // Create new stat
        const newStat = {
          gameId,
          position,
          quarter,
          ...values
        };
        
        await db.insert(gameStats)
          .values(newStat);
          
        console.log(`Created new stat for ${position} Q${quarter}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error directly updating stats:`, error);
    return false;
  }
}

export interface StatUpdate {
  gameId: number;
  position: string;
  quarter: number;
  goalsFor?: number;
  goalsAgainst?: number;
  missedGoals?: number;
  rebounds?: number;
  intercepts?: number;
  badPass?: number;
  handlingError?: number;
  pickUp?: number;
  infringement?: number;
  rating?: number | null;
}