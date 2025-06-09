
import express from 'express';
import { db } from './db';
import { gameScores, games } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';
import { authMiddleware } from './auth-middleware';

const router = express.Router();

// Get official scores for a game
router.get('/api/games/:gameId/scores', authMiddleware, async (req, res) => {
  try {
    const gameId = parseInt(req.params.gameId);
    
    const scores = await db.select()
      .from(gameScores)
      .where(eq(gameScores.gameId, gameId))
      .limit(1);
    
    if (scores.length === 0) {
      return res.json(null); // No official scores entered yet
    }
    
    res.json(scores[0]);
  } catch (error) {
    console.error('Error fetching game scores:', error);
    res.status(500).json({ error: 'Failed to fetch game scores' });
  }
});

// Create or update official scores for a game
router.post('/api/games/:gameId/scores', authMiddleware, async (req, res) => {
  try {
    const gameId = parseInt(req.params.gameId);
    const {
      homeTeamQ1, homeTeamQ2, homeTeamQ3, homeTeamQ4,
      awayTeamQ1, awayTeamQ2, awayTeamQ3, awayTeamQ4,
      notes
    } = req.body;

    // Calculate totals
    const homeTeamTotal = homeTeamQ1 + homeTeamQ2 + homeTeamQ3 + homeTeamQ4;
    const awayTeamTotal = awayTeamQ1 + awayTeamQ2 + awayTeamQ3 + awayTeamQ4;

    // Check if scores already exist
    const existingScores = await db.select()
      .from(gameScores)
      .where(eq(gameScores.gameId, gameId))
      .limit(1);

    if (existingScores.length > 0) {
      // Update existing scores
      const updatedScores = await db.update(gameScores)
        .set({
          homeTeamQ1,
          homeTeamQ2,
          homeTeamQ3,
          homeTeamQ4,
          awayTeamQ1,
          awayTeamQ2,
          awayTeamQ3,
          awayTeamQ4,
          homeTeamTotal,
          awayTeamTotal,
          notes,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(gameScores.gameId, gameId))
        .returning();

      res.json(updatedScores[0]);
    } else {
      // Create new scores
      const newScores = await db.insert(gameScores)
        .values({
          gameId,
          homeTeamQ1,
          homeTeamQ2,
          homeTeamQ3,
          homeTeamQ4,
          awayTeamQ1,
          awayTeamQ2,
          awayTeamQ3,
          awayTeamQ4,
          homeTeamTotal,
          awayTeamTotal,
          enteredBy: req.user?.id,
          notes,
        })
        .returning();

      res.json(newScores[0]);
    }
  } catch (error) {
    console.error('Error saving game scores:', error);
    res.status(500).json({ error: 'Failed to save game scores' });
  }
});

// Delete official scores
router.delete('/api/games/:gameId/scores', authMiddleware, async (req, res) => {
  try {
    const gameId = parseInt(req.params.gameId);
    
    await db.delete(gameScores)
      .where(eq(gameScores.gameId, gameId));
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting game scores:', error);
    res.status(500).json({ error: 'Failed to delete game scores' });
  }
});

export default router;
