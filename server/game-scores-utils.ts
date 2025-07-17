import { db } from './db';
import { gameScores, games } from '@shared/schema';
import { eq, inArray } from 'drizzle-orm';

export interface QuarterScore {
  homeScore: number;
  awayScore: number;
}

export interface GameScoreResult {
  gameId: number;
  quarterScores: QuarterScore[];
  totalHomeScore: number;
  totalAwayScore: number;
}

/**
 * Utility function to get quarter-by-quarter and total scores for a game
 * Transforms team-based scores into home/away format
 */
export async function getGameScores(gameId: number): Promise<GameScoreResult> {
  try {
    // Get the game to know home/away team IDs
    const game = await db.select({
      id: games.id,
      home_team_id: games.home_team_id,
      away_team_id: games.away_team_id
    })
    .from(games)
    .where(eq(games.id, gameId))
    .limit(1);

    if (game.length === 0) {
      return {
        gameId,
        quarterScores: [],
        totalHomeScore: 0,
        totalAwayScore: 0
      };
    }

    const { home_team_id, away_team_id } = game[0];

    // Get all scores for this game
    const scores = await db.select()
      .from(gameScores)
      .where(eq(gameScores.game_id, gameId));

    // Group scores by quarter
    const quarterMap: Record<number, { homeScore: number; awayScore: number }> = {};

    scores.forEach(score => {
      if (!quarterMap[score.quarter]) {
        quarterMap[score.quarter] = { homeScore: 0, awayScore: 0 };
      }

      if (score.team_id === home_team_id) {
        quarterMap[score.quarter].homeScore = score.score;
      } else if (score.team_id === away_team_id) {
        quarterMap[score.quarter].awayScore = score.score;
      }
    });

    // Convert to ordered array (quarters 1-4)
    const quarterScores: QuarterScore[] = [];
    let totalHomeScore = 0;
    let totalAwayScore = 0;

    for (let quarter = 1; quarter <= 4; quarter++) {
      const quarterData = quarterMap[quarter] || { homeScore: 0, awayScore: 0 };
      quarterScores.push(quarterData);
      totalHomeScore += quarterData.homeScore;
      totalAwayScore += quarterData.awayScore;
    }

    return {
      gameId,
      quarterScores,
      totalHomeScore,
      totalAwayScore
    };

  } catch (error) {
    console.error(`Error fetching scores for game ${gameId}:`, error);
    return {
      gameId,
      quarterScores: [],
      totalHomeScore: 0,
      totalAwayScore: 0
    };
  }
}

/**
 * Batch version to get scores for multiple games efficiently
 */
export async function getBatchGameScores(gameIds: number[]): Promise<Record<number, GameScoreResult>> {
  try {
    if (gameIds.length === 0) {
      return {};
    }

    // Get all games to know home/away team IDs
    const gamesData = await db.select({
      id: games.id,
      home_team_id: games.home_team_id,
      away_team_id: games.away_team_id
    })
    .from(games)
    .where(inArray(games.id, gameIds));

    // Create lookup map
    const gameTeamMap = gamesData.reduce((acc, game) => {
      acc[game.id] = {
        home_team_id: game.home_team_id,
        away_team_id: game.away_team_id
      };
      return acc;
    }, {} as Record<number, { home_team_id: number; away_team_id: number }>);

    // Get all scores for these games
    const scores = await db.select()
      .from(gameScores)
      .where(inArray(gameScores.game_id, gameIds));

    // Group scores by game and quarter
    const gameScoresMap: Record<number, Record<number, { homeScore: number; awayScore: number }>> = {};

    scores.forEach(score => {
      const gameTeams = gameTeamMap[score.game_id];
      if (!gameTeams) return;

      if (!gameScoresMap[score.game_id]) {
        gameScoresMap[score.game_id] = {};
      }

      if (!gameScoresMap[score.game_id][score.quarter]) {
        gameScoresMap[score.game_id][score.quarter] = { homeScore: 0, awayScore: 0 };
      }

      if (score.team_id === gameTeams.home_team_id) {
        gameScoresMap[score.game_id][score.quarter].homeScore = score.score;
      } else if (score.team_id === gameTeams.away_team_id) {
        gameScoresMap[score.game_id][score.quarter].awayScore = score.score;
      }
    });

    // Transform to final format
    const results: Record<number, GameScoreResult> = {};

    gameIds.forEach(gameId => {
      const quarterMap = gameScoresMap[gameId] || {};
      const quarterScores: QuarterScore[] = [];
      let totalHomeScore = 0;
      let totalAwayScore = 0;

      for (let quarter = 1; quarter <= 4; quarter++) {
        const quarterData = quarterMap[quarter] || { homeScore: 0, awayScore: 0 };
        quarterScores.push(quarterData);
        totalHomeScore += quarterData.homeScore;
        totalAwayScore += quarterData.awayScore;
      }

      results[gameId] = {
        gameId,
        quarterScores,
        totalHomeScore,
        totalAwayScore
      };
    });

    return results;

  } catch (error) {
    console.error('Error fetching batch game scores:', error);
    return {};
  }
}