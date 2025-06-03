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
  // Cache for frequently accessed data
  private frequentDataCache = new Map<string, { data: any; timestamp: number }>();
  private readonly FREQUENT_CACHE_TTL = 2 * 60 * 1000; // 2 minutes

  /**
   * Clear all batch caches
   */
  clearBatchCache(): void {
    this.batchCache.clear();
    this.frequentDataCache.clear();
  }

  /**
   * Calculate scores directly from provided stats without API calls
   */
  calculateScoresFromStats(stats: GameStat[], gameId: number): GameScores {
    if (!stats || stats.length === 0) {
      return {
        quarterScores: {
          '1': { for: 0, against: 0 },
          '2': { for: 0, against: 0 },
          '3': { for: 0, against: 0 },
          '4': { for: 0, against: 0 }
        },
        finalScore: { for: 0, against: 0 }
      };
    }

    // Calculate scores by quarter
    const quarterScores: Record<string, { for: number; against: number }> = {
      '1': { for: 0, against: 0 },
      '2': { for: 0, against: 0 },
      '3': { for: 0, against: 0 },
      '4': { for: 0, against: 0 }
    };

    stats.forEach(stat => {
      const quarter = stat.quarter.toString();
      if (quarterScores[quarter]) {
        quarterScores[quarter].for += stat.goalsFor || 0;
        quarterScores[quarter].against += stat.goalsAgainst || 0;
      }
    });

    // Calculate final score
    const finalScore = {
      for: Object.values(quarterScores).reduce((sum, q) => sum + q.for, 0),
      against: Object.values(quarterScores).reduce((sum, q) => sum + q.against, 0)
    };

    return { quarterScores, finalScore };
  }

  /**
   * Calculate position stats directly from provided stats without API calls
   */
  async calculatePositionStatsFromStats(stats: GameStat[], gameId: number): Promise<any> {
    if (!stats || stats.length === 0) {
      return {};
    }

    // Group stats by position and quarter
    const positionStats: Record<string, Record<number, any>> = {};

    stats.forEach(stat => {
      if (!positionStats[stat.position]) {
        positionStats[stat.position] = {};
      }
      if (!positionStats[stat.position][stat.quarter]) {
        positionStats[stat.position][stat.quarter] = {
          goalsFor: 0,
          goalsAgainst: 0,
          missedGoals: 0,
          rebounds: 0,
          intercepts: 0,
          badPass: 0,
          handlingError: 0,
          pickUp: 0,
          infringement: 0,
          totalRating: 0,
          ratingCount: 0
        };
      }

      const quarterStats = positionStats[stat.position][stat.quarter];
      quarterStats.goalsFor += stat.goalsFor || 0;
      quarterStats.goalsAgainst += stat.goalsAgainst || 0;
      quarterStats.missedGoals += stat.missedGoals || 0;
      quarterStats.rebounds += stat.rebounds || 0;
      quarterStats.intercepts += stat.intercepts || 0;
      quarterStats.badPass += stat.badPass || 0;
      quarterStats.handlingError += stat.handlingError || 0;
      quarterStats.pickUp += stat.pickUp || 0;
      quarterStats.infringement += stat.infringement || 0;

      if (stat.rating !== null && stat.rating !== undefined) {
        quarterStats.totalRating += stat.rating;
        quarterStats.ratingCount += 1;
      }
    });

    return positionStats;
  }

  /**
   * Map stats to players directly from provided stats without API calls
   */
  async mapStatsToPlayersFromStats(stats: GameStat[], gameId: number): Promise<any> {
    if (!stats || stats.length === 0) {
      return {};
    }

    // For now, return the stats grouped by position since we don't have player mapping in the stats
    // This would need roster data to properly map to players
    const playerMapping: Record<string, any[]> = {};

    stats.forEach(stat => {
      const key = `${stat.position}-Q${stat.quarter}`;
      if (!playerMapping[key]) {
        playerMapping[key] = [];
      }
      playerMapping[key].push(stat);
    });

    return playerMapping;
  }

  /**
   * Get frequently accessed data from cache
   */
  private getFrequentCache<T>(key: string): T | null {
    const cached = this.frequentDataCache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.FREQUENT_CACHE_TTL) {
      return cached.data;
    }
    return null;
  }

  /**
   * Set frequently accessed data in cache
   */
  private setFrequentCache(key: string, data: any): void {
    this.frequentDataCache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Get stats for multiple games efficiently using batch endpoint
   */
  async getBatchGameStats(gameIds: number[]): Promise<Record<number, GameStat[]>> {
    if (!gameIds || gameIds.length === 0) {
      return {};
    }

    // Filter out invalid IDs
    const validIds = gameIds.filter(id => id && typeof id === 'number' && id > 0 && !isNaN(id));
    if (validIds.length === 0) {
      return {};
    }

    // Use the same direct approach that works for GamesList
    const gameIdsParam = validIds.join(',');
    const url = `/api/games/stats/batch?gameIds=${encodeURIComponent(gameIdsParam)}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch batch game stats: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('getBatchGameStats: Error fetching batch stats:', error);
      // Fallback to individual requests
      return this.fallbackIndividualFetch(validIds);
    }
  }

  private async executeBatchRequest(gameIds: number[]): Promise<Record<number, GameStat[]>> {
    if (!gameIds || !gameIds.length) {
      return {};
    }

    try {
      const validIds = gameIds.filter(id => id && id > 0);
      if (!validIds.length) {
        return {};
      }

      const idsParam = validIds.join(',');

      // Construct URL with proper query parameter handling
      const baseUrl = '/api/games/stats/batch';
      const queryParams = new URLSearchParams({ gameIds: idsParam });
      const url = `${baseUrl}?${queryParams.toString()}`;
      const statsMap = await apiRequest('GET', url);
      return statsMap || {};
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
        missedGoals: 0,
        rebounds: 0,
        intercepts: 0,
        badPass: 0,
        handlingError: 0,
        pickUp: 0,
        infringement: 0,
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
      return apiRequest('PATCH', `/api/games/${gameId}/stats/${existingStat.id}`, updates);
    } else {
      return apiRequest('POST', `/api/games/${gameId}/stats`, {
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

// Export the service instance (single export)
export const statisticsService = unifiedStatsService;

/**
 * Utility function to invalidate all caches related to a game
 * Call this after creating, updating, or deleting game stats
 */
export function invalidateGameCaches(gameId: number): void {
  clearGameCache(gameId);

  // Also invalidate React Query caches
  import('./queryClient').then(({ queryClient }) => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey;
        // Invalidate any query that involves this game
        return queryKey.some(key => 
          typeof key === 'string' && (
            key.includes(`game-${gameId}`) ||
            key.includes(`/games/${gameId}/`) ||
            key.includes(`gameId-${gameId}`)
          )
        );
      }
    });
  });
}

/**
 * Utility to clear all statistics caches
 */
export function clearAllStatisticsCaches(): void {
  // Clear the batch cache from the service instance
  statisticsService.clearBatchCache();

  import('./queryClient').then(({ queryClient }) => {
    queryClient.clear();
  });
}

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
    'forfeit-loss': 'red',
    'bye': 'purple',
    'abandoned': 'gray'
  };

  return colorMap[status] || 'gray';
}
export { unifiedStatsService as StatisticsService };