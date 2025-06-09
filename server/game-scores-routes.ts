
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
      .where(eq(gameScores.gameId, gameId));
    
    if (scores.length === 0) {
      return res.json([]); // No official scores entered yet - return empty array
    }
    
    res.json(scores);
  } catch (error) {
    console.error('Error fetching game scores:', error);
    res.status(500).json({ error: 'Failed to fetch game scores' });
  }
});

// Create or update official scores for a game
router.post('/api/games/:gameId/scores', authMiddleware, async (req, res) => {
  try {
    const gameId = parseInt(req.params.gameId);
    const { quarter, homeScore, awayScore, notes } = req.body;

    console.log('POST /api/games/scores - gameId:', gameId, 'quarter:', quarter, 'homeScore:', homeScore, 'awayScore:', awayScore);

    // Validate input
    if (!quarter || quarter < 1 || quarter > 4) {
      return res.status(400).json({ error: 'Invalid quarter number' });
    }

    if (homeScore === undefined || awayScore === undefined) {
      return res.status(400).json({ error: 'Both home and away scores are required' });
    }

    // First, get the game to know which teams are involved
    const game = await db.select()
      .from(games)
      .where(eq(games.id, gameId))
      .limit(1);

    if (game.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const { homeTeamId, awayTeamId } = game[0];

    // Insert or update home team score for this quarter
    await db.insert(gameScores)
      .values({
        gameId,
        teamId: homeTeamId,
        quarter,
        score: homeScore,
        enteredBy: req.user?.id,
        notes: notes || null,
      })
      .onConflictDoUpdate({
        target: [gameScores.gameId, gameScores.teamId, gameScores.quarter],
        set: {
          score: homeScore,
          updatedAt: sql`CURRENT_TIMESTAMP`,
          notes: notes || null,
        }
      });

    // Insert or update away team score for this quarter
    await db.insert(gameScores)
      .values({
        gameId,
        teamId: awayTeamId,
        quarter,
        score: awayScore,
        enteredBy: req.user?.id,
        notes: null, // Notes only on home team entry to avoid duplication
      })
      .onConflictDoUpdate({
        target: [gameScores.gameId, gameScores.teamId, gameScores.quarter],
        set: {
          score: awayScore,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        }
      });

    // Return the updated scores for this quarter
    const updatedScores = await db.select()
      .from(gameScores)
      .where(eq(gameScores.gameId, gameId));

    console.log('Successfully saved scores for game', gameId, 'quarter', quarter);
    res.json(updatedScores);
  } catch (error) {
    console.error('Error saving game scores:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ error: 'Failed to save game scores', details: error.message });
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
