
import { GameStat, Game, GameStatus } from '@shared/schema';
import { getCachedScores, cacheScores, isCacheValid } from './scoresCache';
import { validateInterClubScores, getReconciledScore, getScoreDiscrepancyWarning } from './scoreValidation';

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
  calculateGameScores(
    stats: GameStat[], 
    gameStatus?: GameStatus, 
    statusScores?: { teamGoals: number | null, opponentGoals: number | null },
    isInterClub: boolean = false,
    homeTeamId?: number,
    awayTeamId?: number
  ): GameScores {
    // Handle games with fixed scores from status (forfeit, etc.)
    if (statusScores && statusScores.teamGoals !== null && statusScores.opponentGoals !== null) {
      return this.createFixedScores(statusScores.teamGoals, statusScores.opponentGoals);
    }

    // Handle legacy forfeit games - check for string format too
    const statusString = typeof gameStatus === 'string' ? gameStatus : gameStatus?.toString();
    if (statusString === 'forfeit-win') {
      return this.createForfeitScores(true);
    }
    if (statusString === 'forfeit-loss') {
      return this.createForfeitScores(false);
    }

    const quarterScores: QuarterScore[] = [];
    
    // Handle inter-club games with potential score reconciliation
    if (isInterClub && homeTeamId && awayTeamId) {
      for (let quarter = 1; quarter <= 4; quarter++) {
        const quarterStats = stats.filter(s => s.quarter === quarter);
        const homeStats = quarterStats.filter(s => s.teamId === homeTeamId);
        const awayStats = quarterStats.filter(s => s.teamId === awayTeamId);
        
        const homeTeamStats = {
          teamId: homeTeamId,
          goalsFor: homeStats.reduce((sum, s) => sum + (s.goalsFor || 0), 0),
          goalsAgainst: homeStats.reduce((sum, s) => sum + (s.goalsAgainst || 0), 0)
        };
        
        const awayTeamStats = {
          teamId: awayTeamId,
          goalsFor: awayStats.reduce((sum, s) => sum + (s.goalsFor || 0), 0),
          goalsAgainst: awayStats.reduce((sum, s) => sum + (s.goalsAgainst || 0), 0)
        };
        
        // Reconcile scores using home-priority for consistency
        const reconciledScore = getReconciledScore(homeTeamStats, awayTeamStats, 'home-priority');
        
        quarterScores.push({
          quarter,
          teamScore: reconciledScore.homeScore,
          opponentScore: reconciledScore.awayScore
        });
      }
    } else {
      // Standard single-team scoring
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
      teamScore: i === 0 ? (isWin ? 10 : 0) : 0,
      opponentScore: i === 0 ? (isWin ? 0 : 10) : 0
    }));

    return {
      quarterScores,
      totalTeamScore: isWin ? 10 : 0,
      totalOpponentScore: isWin ? 0 : 10,
      result: isWin ? 'win' : 'loss'
    };
  }

  private createFixedScores(teamGoals: number, opponentGoals: number): GameScores {
    const quarterScores = Array.from({ length: 4 }, (_, i) => ({
      quarter: i + 1,
      teamScore: i === 0 ? teamGoals : 0,
      opponentScore: i === 0 ? opponentGoals : 0
    }));

    const result = teamGoals > opponentGoals ? 'win' : 
                   teamGoals < opponentGoals ? 'loss' : 'draw';

    return {
      quarterScores,
      totalTeamScore: teamGoals,
      totalOpponentScore: opponentGoals,
      result
    };
  }

  async getGameScoresWithCache(gameId: number, stats?: GameStat[], gameStatus?: GameStatus, statusScores?: { teamGoals: number | null, opponentGoals: number | null }): Promise<GameScores> {
    // Check cache first
    const cachedScores = getCachedScores(gameId, stats, gameStatus);
    if (cachedScores) {
      return this.convertLegacyScores(cachedScores);
    }

    // Calculate new scores
    const scores = this.calculateGameScores(stats || [], gameStatus, statusScores);
    
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
