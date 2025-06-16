import { GameStat, Game, GameStatus } from '@shared/schema';
import { getCachedScores, cacheScores, isCacheValid } from './scoresCache';
import { validateInterClubScores, getReconciledScore, getScoreDiscrepancyWarning } from './scoreValidation';
import { apiClient } from './apiClient';

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

export interface OfficialGameScore {
  id?: number;
  gameId: number;
  teamId: number;
  quarter: number;
  score: number;
  notes?: string;
  enteredAt?: string;
  updatedAt?: string;
  enteredBy?: number;
}

class GameScoreService {
  async calculateGameScores(
    gameStats: any[], 
    gameStatus?: string, 
    statusScores?: { teamGoals: number | null, opponentGoals: number | null },
    isInterClub: boolean = false,
    homeTeamId?: number,
    awayTeamId?: number,
    currentTeamId?: number,
    officialScores?: OfficialGameScore[],
    gameId?: number
  ): Promise<GameScores> {
    // PRIORITY 1: Try to fetch official scores if gameId is provided
    if (gameId && !officialScores) {
      try {
        const response = await apiClient.get(`/api/games/${gameId}/scores`);
        if (response && Array.isArray(response) && response.length > 0) {
          console.log(`Using official scores for game ${gameId}:`, response);
          return this.createScoresFromOfficial(response, homeTeamId, awayTeamId, currentTeamId);
        }
      } catch (error) {
        console.log(`No official scores found for game ${gameId}`);
      }
    }

    // Use provided official scores if available
    if (officialScores && officialScores.length > 0) {
      return this.createScoresFromOfficial(officialScores, homeTeamId, awayTeamId, currentTeamId);
    }

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

    // If no official scores available, return empty scores
    console.log(`No official scores available for game ${gameId || 'unknown'}`);
    return this.createEmptyScores();
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
    const cachedScores = getCachedScores(gameId, gameStatus);
    if (cachedScores) {
      return this.convertLegacyScores(cachedScores);
    }

    // Calculate new scores
    const scores = await this.calculateGameScores(stats || [], gameStatus, statusScores, false, undefined, undefined, undefined, undefined, gameId);

    // Cache the result
    const legacyFormat = this.convertToLegacyFormat(scores);
    cacheScores(gameId, legacyFormat, gameStatus);

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


  private createEmptyScores(): GameScores {
    const quarterScores: QuarterScore[] = Array.from({ length: 4 }, (_, i) => ({
      quarter: i + 1,
      teamScore: 0,
      opponentScore: 0
    }));

    return {
      quarterScores,
      totalTeamScore: 0,
      totalOpponentScore: 0,
      result: 'draw'
    };
  }

  private createScoresFromOfficial(
    officialScores: OfficialGameScore[], 
    homeTeamId?: number, 
    awayTeamId?: number,
    currentTeamId?: number
  ): GameScores {
    // Create quarter scores from official data
    const quarterScores: QuarterScore[] = [];

    // Get all unique team IDs from official scores
    const teamIds = [...new Set(officialScores.map(s => s.teamId))];

    // If we don't have homeTeamId/awayTeamId but we have team IDs from scores, use those
    if (!homeTeamId && !awayTeamId && teamIds.length >= 2) {
      homeTeamId = teamIds[0];
      awayTeamId = teamIds[1];
    }

    // Ensure we have scores for all 4 quarters
    for (let quarter = 1; quarter <= 4; quarter++) {
      // Find scores for this quarter for both teams
      const homeTeamScore = officialScores.find(s => s.quarter === quarter && s.teamId === homeTeamId)?.score || 0;
      const awayTeamScore = officialScores.find(s => s.quarter === quarter && s.teamId === awayTeamId)?.score || 0;

      // Determine scores from the perspective of the current team
      let teamScore: number;
      let opponentScore: number;

      // Use currentTeamId if provided, otherwise determine from available team IDs
      const effectiveCurrentTeamId = currentTeamId || (teamIds.includes(homeTeamId!) ? homeTeamId : awayTeamId);

      if (effectiveCurrentTeamId === homeTeamId) {
        // Current team is home team - show from home perspective
        teamScore = homeTeamScore;
        opponentScore = awayTeamScore;
      } else if (effectiveCurrentTeamId === awayTeamId) {
        // Current team is away team - show from away perspective
        teamScore = awayTeamScore;
        opponentScore = homeTeamScore;
      } else {
        // Fallback: if current team doesn't match either, default to home perspective
        teamScore = homeTeamScore;
        opponentScore = awayTeamScore;
      }

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

  /**
   * Synchronous version of calculateGameScores for use in React components
   * Does not fetch official scores - those must be passed in if available
   */
  calculateGameScoresSync(
    gameStats: any[], 
    gameStatus?: string, 
    statusScores?: { teamGoals: number | null, opponentGoals: number | null },
    isInterClub: boolean = false,
    homeTeamId?: number,
    awayTeamId?: number,
    currentTeamId?: number,
    officialScores?: OfficialGameScore[]
  ): GameScores {
    // Use provided official scores if available
    if (officialScores && officialScores.length > 0) {
      return this.createScoresFromOfficial(officialScores, homeTeamId, awayTeamId, currentTeamId);
    }

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

    // If no official scores available, return empty scores
    return this.createEmptyScores();
  }
}

export const gameScoreService = new GameScoreService();