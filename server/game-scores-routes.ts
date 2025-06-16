import { Express } from 'express';
import { db } from './db';
import { gameScores, games } from '@shared/schema';
import { eq, sql, and, or, inArray } from 'drizzle-orm';
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

      // Get all scores for the requested games in one query
      const gameIdList = limitedGameIds.map(id => parseInt(id));
      const scores = await db.select()
        .from(gameScores)
        .innerJoin(games, eq(gameScores.gameId, games.id))
        .where(
          and(
            inArray(gameScores.gameId, gameIdList),
            or(
              eq(games.homeClubId, clubId),
              eq(games.awayClubId, clubId)
            )
          )
        );

      // Group scores by game ID
      const scoresMap: Record<number, any[]> = {};
      limitedGameIds.forEach(gameId => {
        scoresMap[gameId] = [];
      });

      scores.forEach((row) => {
        const score = row.game_scores;
        const gameId = score.gameId;
        if (scoresMap[gameId]) {
          scoresMap[gameId].push(score);
        }
      });

      console.log(`Batch scores response: found scores for ${Object.keys(scoresMap).filter(id => scoresMap[parseInt(id)].length > 0).length} games`);
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