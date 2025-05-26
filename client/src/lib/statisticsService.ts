import { GameStat, Game, Roster, Position, Player, allPositions, GameStatus } from '@shared/schema';
import { apiRequest } from './queryClient';
import { isForfeitGame, getForfeitGameScore } from './utils';
import { 
  getCachedScores, 
  cacheScores, 
  clearGameCache, 
  invalidateGameCache 
} from './scoresCache';

/**
 * Unified Statistics Service - handles all game statistics operations
 */
class UnifiedStatisticsService {
  // Cache for batch operations to avoid duplicate requests
  private batchCache = new Map<string, Promise<any>>();

  /**
   * Get stats for multiple games efficiently using batch endpoint
   */
  async getBatchGameStats(gameIds: number[]): Promise<Record<number, GameStat[]>> {
    if (!gameIds.length) return {};

    const cacheKey = `batch-${gameIds.sort().join(',')}`;

    // Check if we already have a pending request for this batch
    if (this.batchCache.has(cacheKey)) {
      return this.batchCache.get(cacheKey);
    }

    const batchPromise = this.executeBatchRequest(gameIds);
    this.batchCache.set(cacheKey, batchPromise);

    // Clean up cache after request completes
    batchPromise.finally(() => {
      this.batchCache.delete(cacheKey);
    });

    return batchPromise;
  }

  private async executeBatchRequest(gameIds: number[]): Promise<Record<number, GameStat[]>> {
    try {
      const idsParam = gameIds.join(',');
      console.log(`Making batch request for game IDs: ${idsParam}`);
      const statsMap = await apiRequest('GET', `/api/games/stats/batch?gameIds=${idsParam}`);
      console.log(`Batch fetched stats for ${gameIds.length} games`);
      return statsMap;
    } catch (error) {
      console.warn('Batch fetch failed, falling back to individual requests:', error);
      return this.fallbackIndividualFetch(gameIds);
    }
  }

  private async fallbackIndividualFetch(gameIds: number[]): Promise<Record<number, GameStat[]>> {
    const statsMap: Record<number, GameStat[]> = {};
    const results = await Promise.allSettled(
      gameIds.map(id => apiRequest('GET', `/api/games/${id}/stats`))
    );

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        statsMap[gameIds[index]] = result.value;
      } else {
        statsMap[gameIds[index]] = [];
      }
    });

    return statsMap;
  }

  /**
   * Calculate scores for multiple games efficiently
   */
  async calculateBatchGameScores(gameIds: number[]): Promise<Record<number, GameScores>> {
    const scores: Record<number, GameScores> = {};

    // Check cache first for all games
    const uncachedGameIds: number[] = [];
    for (const gameId of gameIds) {
      const cached = getCachedScores(gameId);
      if (cached) {
        scores[gameId] = cached;
      } else {
        uncachedGameIds.push(gameId);
      }
    }

    if (uncachedGameIds.length === 0) {
      return scores;
    }

    // Get stats for uncached games
    const statsMap = await this.getBatchGameStats(uncachedGameIds);

    // Calculate scores for each uncached game
    for (const gameId of uncachedGameIds) {
      const stats = statsMap[gameId] || [];
      const gameScores = this.calculateScoresFromStats(stats, gameId);
      scores[gameId] = gameScores;
      cacheScores(gameId, gameScores, stats);
    }

    return scores;
  }

  calculateScoresFromStats(stats: GameStat[], gameId: number): GameScores {
    const quarterScores = {
      '1': { for: 0, against: 0 },
      '2': { for: 0, against: 0 },
      '3': { for: 0, against: 0 },
      '4': { for: 0, against: 0 }
    };

    // Group by position/quarter and take latest
    const latestStats: Record<string, GameStat> = {};
    stats.forEach(stat => {
      if (!stat.quarter || !stat.position) return;

      const key = `${stat.position}-${stat.quarter}`;
      if (!latestStats[key] || stat.id > latestStats[key].id) {
        latestStats[key] = stat;
      }
    });

    // Sum goals by quarter
    Object.values(latestStats).forEach(stat => {
      if (stat.quarter >= 1 && stat.quarter <= 4) {
        const quarter = stat.quarter.toString() as '1' | '2' | '3' | '4';
        quarterScores[quarter].for += stat.goalsFor || 0;
        quarterScores[quarter].against += stat.goalsAgainst || 0;
      }
    });

    const finalScore = {
      for: quarterScores['1'].for + quarterScores['2'].for + quarterScores['3'].for + quarterScores['4'].for,
      against: quarterScores['1'].against + quarterScores['2'].against + quarterScores['3'].against + quarterScores['4'].against
    };

    return { quarterScores, finalScore };
  }

  /**
   * Get position-based statistics for a game
   */
  async getPositionStats(gameId: number): Promise<Record<string, PositionStat>> {
    const statsMap = await this.getBatchGameStats([gameId]);
    const stats = statsMap[gameId] || [];

    const positionStats: Record<string, PositionStat> = {};

    stats.forEach(stat => {
      if (!stat.position || !stat.quarter) return;

      const key = `${stat.position}-${stat.quarter}`;
      positionStats[key] = {
        gameId: stat.gameId,
        quarter: stat.quarter,
        position: stat.position,
        goalsFor: stat.goalsFor || 0,
        goalsAgainst: stat.goalsAgainst || 0,
        missedGoals: stat.missedGoals || 0,
        rebounds: stat.rebounds || 0,
        intercepts: stat.intercepts || 0,
        badPass: stat.badPass || 0,
        handlingError: stat.handlingError || 0,
        pickUp: stat.pickUp || 0,
        infringement: stat.infringement || 0,
        rating: stat.rating
      };
    });

    return positionStats;
  }

  /**
   * Map stats to players using roster information
   */
  async mapStatsToPlayers(gameId: number): Promise<Record<number, GameStat[]>> {
    const [statsMap, rosters] = await Promise.all([
      this.getBatchGameStats([gameId]),
      apiRequest('GET', `/api/games/${gameId}/rosters`)
    ]);

    const stats = statsMap[gameId] || [];
    const playerStats: Record<number, GameStat[]> = {};

    stats.forEach(stat => {
      if (!stat.position) return;

      const playerRoster = rosters.find((r: Roster) => 
        r.quarter === stat.quarter && 
        r.position === stat.position
      );

      if (playerRoster) {
        if (!playerStats[playerRoster.playerId]) {
          playerStats[playerRoster.playerId] = [];
        }
        playerStats[playerRoster.playerId].push(stat);
      }
    });

    return playerStats;
  }

  /**
   * Update game statistics
   */
  async updateGameStat(gameId: number, position: Position, quarter: number, updates: Partial<GameStat>): Promise<GameStat> {
    // Clear cache for this game
    invalidateGameCache(gameId);

    // Find existing stat
    const statsMap = await this.getBatchGameStats([gameId]);
    const stats = statsMap[gameId] || [];
    const existingStat = stats.find(s => s.position === position && s.quarter === quarter);

    if (existingStat) {
      return apiRequest('PATCH', `/api/gamestats/${existingStat.id}`, updates);
    } else {
      return apiRequest('POST', '/api/gamestats', {
        gameId,
        position,
        quarter,
        ...updates
      });
    }
  }

  /**
   * Calculate player performance across games
   */
  async calculatePlayerPerformance(playerId: number, gameIds?: number[]): Promise<PlayerPerformance> {
    // Get all games if not specified, filter out forfeits
    const allGames = gameIds 
      ? await Promise.all(gameIds.map(id => apiRequest('GET', `/api/games/${id}`)))
      : await apiRequest('GET', '/api/games');

    const validGames = allGames.filter((g: Game) => !isForfeitGame(g));
    const validGameIds = validGames.map((g: Game) => g.id);

    // Get all stats and rosters in batch
    const [statsMap, ...rosterArrays] = await Promise.all([
      this.getBatchGameStats(validGameIds),
      ...validGameIds.map(id => apiRequest('GET', `/api/games/${id}/rosters`))
    ]);

    const performance: PlayerPerformance = {
      playerId,
      gamesPlayed: 0,
      goals: 0,
      goalsAgainst: 0,
      missedGoals: 0,
      rebounds: 0,
      intercepts: 0,
      badPass: 0,
      handlingError: 0,
      pickUp: 0,
      infringement: 0,
      rating: 0,
      quartersByPosition: {
        'GS': 0, 'GA': 0, 'WA': 0, 'C': 0, 'WD': 0, 'GD': 0, 'GK': 0
      }
    };

    const gamesPlayed = new Set<number>();
    let totalRating = 0;
    let ratingCount = 0;

    validGameIds.forEach((gameId, index) => {
      const stats = statsMap[gameId] || [];
      const rosters = rosterArrays[index] || [];

      const playerRosters = rosters.filter((r: Roster) => r.playerId === playerId);

      if (playerRosters.length === 0) return;

      gamesPlayed.add(gameId);

      playerRosters.forEach((roster: Roster) => {
        performance.quartersByPosition[roster.position]++;

        const stat = stats.find((s: GameStat) => 
          s.position === roster.position && s.quarter === roster.quarter
        );

        if (stat) {
          performance.goals += stat.goalsFor || 0;
          performance.goalsAgainst += stat.goalsAgainst || 0;
          performance.missedGoals += stat.missedGoals || 0;
          performance.rebounds += stat.rebounds || 0;
          performance.intercepts += stat.intercepts || 0;
          performance.badPass += stat.badPass || 0;
          performance.handlingError += stat.handlingError || 0;
          performance.pickUp += stat.pickUp || 0;
          performance.infringement += stat.infringement || 0;

          if (stat.quarter === 1 && stat.rating !== null) {
            totalRating += stat.rating;
            ratingCount++;
          }
        }
      });
    });

    performance.gamesPlayed = gamesPlayed.size;
    performance.rating = ratingCount > 0 ? Math.round(totalRating / ratingCount) : 5;

    return performance;
  }
}

// Interfaces
export interface GameScores {
  quarterScores: {
    '1': { for: number, against: number },
    '2': { for: number, against: number },
    '3': { for: number, against: number },
    '4': { for: number, against: number }
  };
  finalScore: {
    for: number,
    against: number
  };
}

export interface PositionStat {
  gameId: number;
  quarter: number;
  position: Position;
  goalsFor: number;
  goalsAgainst: number;
  missedGoals: number;
  rebounds: number;
  intercepts: number;
  badPass: number;
  handlingError: number;
  pickUp: number;
  infringement: number;
  rating: number | null;
}

export interface PlayerPerformance {
  playerId: number;
  gamesPlayed: number;
  goals: number;
  goalsAgainst: number;
  missedGoals: number;
  rebounds: number;
  intercepts: number;
  badPass: number;
  handlingError: number;
  pickUp: number;
  infringement: number;
  rating: number;
  quartersByPosition: Record<Position, number>;
}

// Export singleton instance
export const unifiedStatsService = new UnifiedStatisticsService();

// Legacy exports for backward compatibility
export const statisticsService = unifiedStatsService;

// Calculate game scores from statistics
export function calculateGameScores(stats: GameStat[]) {
  if (!stats || stats.length === 0) {
    return { teamScore: 0, opponentScore: 0 };
  }
  
  // For forfeit games, return standard 0-10 score
  if (stats.length > 0 && isForfeitGame({ id: stats[0].gameId } as Game)) {
    return { teamScore: 0, opponentScore: 10 };
  }
  
  // Calculate regular game scores
  const teamScore = stats.reduce((total, stat) => 
    total + (stat.goalsFor || 0), 0);
  
  const opponentScore = stats.reduce((total, stat) => 
    total + (stat.goalsAgainst || 0), 0);
  
  return { teamScore, opponentScore };
}

// Get appropriate color for game status
export function getGameStatusColor(status: GameStatus): string {
  const colorMap = {
    'upcoming': 'blue',
    'in-progress': 'amber',
    'completed': 'green',
    'forfeit-win': 'orange',
    'forfeit-loss': 'red'
  };
  
  return colorMap[status] || 'gray';
}
export { unifiedStatsService as StatisticsService };