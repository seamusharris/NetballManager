/**
 * Emergency stats update route
 * This is a specialized route dedicated to ensuring position-based stats can be reliably saved
 */
import { Router } from 'express';
import { db } from './db';
import { gameStats } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

const emergencyRouter = Router();

/**
 * Save position-based stats for a game
 * This bypasses the normal API flow and directly updates the database
 */
emergencyRouter.post('/save-position-stats', async (req, res) => {
  try {
    const { gameId, position, quarter, statValues } = req.body;
    
    if (!gameId || !position || !quarter || !statValues) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: gameId, position, quarter, statValues'
      });
    }
    
    // Find if the stat exists
    const existingStats = await db.select()
      .from(gameStats)
      .where(
        and(
          eq(gameStats.gameId, gameId),
          eq(gameStats.position, position),
          eq(gameStats.quarter, quarter)
        )
      );
    
    let result;
    
    if (existingStats.length > 0) {
      // Update existing stat
      const existingStat = existingStats[0];
      result = await db.update(gameStats)
        .set(statValues)
        .where(eq(gameStats.id, existingStat.id));
      
      console.log(`Emergency update for ${position} Q${quarter} stat ID ${existingStat.id}`);
    } else {
      // Create new stat
      const newStat = {
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
      
      result = await db.insert(gameStats).values(newStat);
      console.log(`Emergency create for ${position} Q${quarter}`);
    }
    
    return res.json({
      success: true,
      message: `Successfully saved ${position} Q${quarter} stats`,
      result
    });
  } catch (error) {
    console.error('Emergency stats update failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update stats'
    });
  }
});

export default emergencyRouter;