import { queryClient } from './queryClient';
import { apiClient } from './apiClient';
import { CACHE_KEYS, normalizeGameIds } from './cacheKeys';

interface BatchFetchOptions {
  gameIds: number[] | string;
  clubId: number;
  teamId?: number;
  includeStats?: boolean;
  includeRosters?: boolean;
  includeScores?: boolean;
}

export class UnifiedDataFetcher {
  private static instance: UnifiedDataFetcher;
  private pendingBatches = new Map<string, Promise<any>>();

  static getInstance(): UnifiedDataFetcher {
    if (!UnifiedDataFetcher.instance) {
      UnifiedDataFetcher.instance = new UnifiedDataFetcher();
    }
    return UnifiedDataFetcher.instance;
  }

  /**
   * Batch fetch game-related data with intelligent caching
   */
  async batchFetchGameData(options: BatchFetchOptions) {
    const { gameIds, clubId, teamId, includeStats = true, includeRosters = true, includeScores = true } = options;

    if (gameIds.length === 0) return {};

    // Create batch key for deduplication
    const batchKey = `${clubId}-${teamId || 'all'}-${gameIds.sort().join(',')}-${includeStats}-${includeRosters}-${includeScores}`;

    // Return existing promise if batch is already in progress
    if (this.pendingBatches.has(batchKey)) {
      return this.pendingBatches.get(batchKey);
    }

    const batchPromise = this.executeBatchFetch(options);
    this.pendingBatches.set(batchKey, batchPromise);

    // Clean up after completion
    batchPromise.finally(() => {
      this.pendingBatches.delete(batchKey);
    });

    return batchPromise;
  }

  private async executeBatchFetch(options: BatchFetchOptions) {
    const { clubId, teamId, includeStats, includeRosters, includeScores } = options;
    
    // Normalize gameIds to array format
    const gameIds = Array.isArray(options.gameIds) 
      ? options.gameIds 
      : options.gameIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      
    const results: any = {};

    // Batch fetch stats
    if (includeStats) {
      try {
        const statsResponse = await apiClient.post('/api/games/stats/batch', { gameIds });
        results.stats = statsResponse;

        // Cache individual game stats
        Object.entries(statsResponse).forEach(([gameId, stats]) => {
          queryClient.setQueryData(
            CACHE_KEYS.gameStats(parseInt(gameId)), 
            stats
          );
        });
      } catch (error) {
        console.error('Batch stats fetch failed:', error);
        results.stats = {};
      }
    }

    // Batch fetch rosters
    if (includeRosters) {
      try {
        const rosterPromises = gameIds.map(gameId => 
          apiClient.get(`/api/games/${gameId}/rosters`)
            .then(roster => ({ gameId, roster }))
            .catch(error => ({ gameId, roster: [], error }))
        );

        const rosterResults = await Promise.all(rosterPromises);
        results.rosters = {};

        rosterResults.forEach(({ gameId, roster }) => {
          results.rosters[gameId] = roster;
          queryClient.setQueryData(
            CACHE_KEYS.gameRoster(gameId), 
            roster
          );
        });
      } catch (error) {
        console.error('Batch roster fetch failed:', error);
        results.rosters = {};
      }
    }

    // Batch fetch scores
    if (includeScores) {
      try {
        const scorePromises = gameIds.map(gameId => 
          apiClient.get(`/api/games/${gameId}/scores`)
            .then(scores => ({ gameId, scores }))
            .catch(error => ({ gameId, scores: [], error }))
        );

        const scoreResults = await Promise.all(scorePromises);
        results.scores = {};

        scoreResults.forEach(({ gameId, scores }) => {
          results.scores[gameId] = scores;
          queryClient.setQueryData(
            [`/api/games/${gameId}/scores`], 
            scores
          );
        });
      } catch (error) {
        console.error('Batch score fetch failed:', error);
        results.scores = {};
      }
    }

    return results;
  }

  /**
   * Prefetch related data based on current context
   */
  async prefetchRelatedData(gameIds: number[], clubId: number, teamId?: number) {
    // Prefetch in background without blocking UI
    this.batchFetchGameData({
      gameIds,
      clubId,
      teamId,
      includeStats: true,
      includeRosters: true,
      includeScores: true
    }).catch(error => {
      console.warn('Background prefetch failed:', error);
    });
  }

  // Cache invalidation removed - should be handled at mutation points
  // (when actually saving/updating data) rather than during data fetching
}

export const dataFetcher = UnifiedDataFetcher.getInstance();