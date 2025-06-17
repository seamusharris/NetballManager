import { Express } from 'express';
import { db } from './db';
import { gameScores, games } from '@shared/schema';
import { eq, and, or, inArray, sql } from 'drizzle-orm';
import { standardAuth, AuthenticatedRequest } from './auth-middleware';

export function registerGameScoresRoutes(app: Express) {
  // Batch endpoint for multiple games' official scores
  app.post('/api/games/scores/batch', standardAuth({ requireClubAccess: true }), async (req: AuthenticatedRequest, res) => {
    try {
      const { gameIds } = req.body;
      const clubId = parseInt(req.headers['x-current-club-id'] as string);

      if (!Array.isArray(gameIds) || gameIds.length === 0) {
        return res.status(400).json({ error: 'gameIds array is required' });
      }

      // Limit batch size to prevent server overwhelm
      const limitedGameIds = gameIds.slice(0, 50);

      console.log(`Batch scores request for club ${clubId}, games:`, limitedGameIds);

      // Convert to integers and get scores directly
      const gameIdList = limitedGameIds.map(id => parseInt(id));

      // Get all scores for the requested games using proper Drizzle ORM
      const scores = await db.select()
        .from(gameScores)
        .where(inArray(gameScores.gameId, gameIdList));

      // Group scores by game ID
      const scoresMap: Record<number, any[]> = {};
      limitedGameIds.forEach(gameId => {
        scoresMap[gameId] = [];
      });

      scores.forEach((score) => {
        const gameId = score.gameId;
        if (scoresMap[gameId]) {
          scoresMap[gameId].push(score);
        } else {
          scoresMap[gameId] = [score];
        }
      });

      const gamesWithScores = Object.keys(scoresMap).filter(id => scoresMap[parseInt(id)].length > 0);
      const gamesWithoutScores = gameIds.filter(id => !gamesWithScores.includes(id.toString()));
      
      console.log(`Batch scores response: found scores for ${gamesWithScores.length} games: [${gamesWithScores.join(', ')}]`);
      if (gamesWithoutScores.length > 0) {
        console.log(`Batch scores response: NO scores found for ${gamesWithoutScores.length} games: [${gamesWithoutScores.join(', ')}]`);
      }
      
      res.json(scoresMap);
    } catch (error) {
      console.error('Error fetching batch game scores:', error);
      res.status(500).json({ error: 'Failed to fetch batch game scores' });
    }
  });

  // Get official scores for a game
  app.get('/api/games/:gameId/scores', standardAuth({ requireGameAccess: true }), async (req: AuthenticatedRequest, res) => {
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
  app.post('/api/games/:gameId/scores', standardAuth({ requireGameAccess: true }), async (req: AuthenticatedRequest, res) => {
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
  app.delete('/api/games/:gameId/scores', standardAuth({ requireGameAccess: true }), async (req: AuthenticatedRequest, res) => {
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

}