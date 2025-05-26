
import { GameStat, Game, GameStatus } from '@shared/schema';
import { getCachedScores, cacheScores, isCacheValid } from './scoresCache';

export interface QuarterScore {
  quarter: number;
  teamScore: number;
  opponentScore: number;
}

export interface GameScores {
  quarterScores: QuarterScore[];
  totalTeamScore: number;
  totalOpponentScore: number;
  result: 'win' | 'loss' | 'draw';
}

class GameScoreService {
  calculateGameScores(stats: GameStat[], gameStatus?: GameStatus): GameScores {
    // Handle forfeit games
    if (gameStatus === 'forfeit-win') {
      return this.createForfeitScores(true);
    }
    if (gameStatus === 'forfeit-loss') {
      return this.createForfeitScores(false);
    }

    const quarterScores: QuarterScore[] = [];
    
    for (let quarter = 1; quarter <= 4; quarter++) {
      const quarterStats = stats.filter(s => s.quarter === quarter);
      const teamScore = quarterStats.reduce((sum, s) => sum + (s.goalsFor || 0), 0);
      const opponentScore = quarterStats.reduce((sum, s) => sum + (s.goalsAgainst || 0), 0);
      
      quarterScores.push({
        quarter,
        teamScore,
        opponentScore
      });
    }

    const totalTeamScore = quarterScores.reduce((sum, q) => sum + q.teamScore, 0);
    const totalOpponentScore = quarterScores.reduce((sum, q) => sum + q.opponentScore, 0);
    
    const result = totalTeamScore > totalOpponentScore ? 'win' : 
                   totalTeamScore < totalOpponentScore ? 'loss' : 'draw';

    return {
      quarterScores,
      totalTeamScore,
      totalOpponentScore,
      result
    };
  }

  private createForfeitScores(isWin: boolean): GameScores {
    const quarterScores = Array.from({ length: 4 }, (_, i) => ({
      quarter: i + 1,
      teamScore: 0,
      opponentScore: 0
    }));

    return {
      quarterScores,
      totalTeamScore: isWin ? 1 : 0,
      totalOpponentScore: isWin ? 0 : 1,
      result: isWin ? 'win' : 'loss'
    };
  }

  async getGameScoresWithCache(gameId: number, stats?: GameStat[], gameStatus?: GameStatus): Promise<GameScores> {
    // Check cache first
    const cachedScores = getCachedScores(gameId, stats, gameStatus);
    if (cachedScores) {
      return this.convertLegacyScores(cachedScores);
    }

    // Calculate new scores
    const scores = this.calculateGameScores(stats || [], gameStatus);
    
    // Cache the result
    const legacyFormat = this.convertToLegacyFormat(scores);
    cacheScores(gameId, legacyFormat, stats, gameStatus);
    
    return scores;
  }

  private convertLegacyScores(legacy: any): GameScores {
    const quarterScores = Object.entries(legacy.quarterScores).map(([quarter, scores]: [string, any]) => ({
      quarter: parseInt(quarter),
      teamScore: scores.for,
      opponentScore: scores.against
    }));

    return {
      quarterScores,
      totalTeamScore: legacy.finalScore.for,
      totalOpponentScore: legacy.finalScore.against,
      result: legacy.finalScore.for > legacy.finalScore.against ? 'win' : 
              legacy.finalScore.for < legacy.finalScore.against ? 'loss' : 'draw'
    };
  }

  private convertToLegacyFormat(scores: GameScores): any {
    const quarterScores = scores.quarterScores.reduce((acc, q) => {
      acc[q.quarter.toString()] = { for: q.teamScore, against: q.opponentScore };
      return acc;
    }, {} as any);

    return {
      quarterScores,
      finalScore: {
        for: scores.totalTeamScore,
        against: scores.totalOpponentScore
      }
    };
  }
}

export const gameScoreService = new GameScoreService();
