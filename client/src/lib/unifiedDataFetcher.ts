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

    if (gameIds.length === 0) return { stats: {}, rosters: {}, scores: {} };

    // Normalize and validate game IDs
    const normalizedGameIds = Array.isArray(gameIds) 
      ? gameIds.filter(id => id && !isNaN(Number(id))).map(Number).sort()
      : [];

    if (normalizedGameIds.length === 0) return { stats: {}, rosters: {}, scores: {} };

    // Create batch key for deduplication
    const batchKey = `${clubId}-${teamId || 'all'}-${normalizedGameIds.join(',')}-${includeStats}-${includeRosters}-${includeScores}`;

    // Return existing promise if batch is already in progress
    if (this.pendingBatches.has(batchKey)) {
      console.log(`UnifiedDataFetcher: Returning existing batch request for key: ${batchKey}`);
      return this.pendingBatches.get(batchKey);
    }

    const batchPromise = this.executeBatchFetch({ ...options, gameIds: normalizedGameIds });
    this.pendingBatches.set(batchKey, batchPromise);

    // Clean up after completion with error handling
    batchPromise.finally(() => {
      this.pendingBatches.delete(batchKey);
    }).catch(error => {
      console.warn(`UnifiedDataFetcher: Batch request failed for key ${batchKey}:`, error);
    });

    return batchPromise;
  }

  private async executeBatchFetch(options: BatchFetchOptions) {
    const { clubId, teamId, includeStats, includeRosters, includeScores } = options;

    // Normalize gameIds to array format
    const gameIds = Array.isArray(options.gameIds) 
      ? options.gameIds 
      : options.gameIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

    const result: any = {};

    if (includeStats) {
        const stats = await this.batchFetchStats(options.gameIds, options.clubId, options.teamId);
        result.stats = stats;
      }

    // Batch fetch rosters - using club-scoped endpoint
    if (includeRosters) {
      try {
        console.log(`UnifiedDataFetcher: Batch fetching rosters for ${gameIds.length} games via club ${clubId}`);
        const rostersResponse = await apiClient.post(`/api/clubs/${clubId}/games/rosters/batch`, { gameIds });
        result.rosters = rostersResponse;
        console.log(`UnifiedDataFetcher: Batch rosters received for ${Object.keys(rostersResponse).length} games`);

        // Cache individual game rosters
        Object.entries(rostersResponse).forEach(([gameId, rosters]) => {
          queryClient.setQueryData(
            CACHE_KEYS.gameRoster(parseInt(gameId)), 
            rosters
          );
        });
      } catch (error) {
        console.error('Batch roster fetch failed:', error);
        result.rosters = {};
      }
    }

    // Fetch scores if requested
    if (includeScores && gameIds.length > 0) {
      console.log(`UnifiedDataFetcher: Batch fetching scores for ${gameIds.length} games`);

      try {
        // Use club-scoped batch endpoint for better performance
        const scoresMap = await apiClient.post(`/api/clubs/${clubId}/games/scores/batch`, {
          gameIds: gameIds
        });

        result.scores = scoresMap || {};
        console.log(`UnifiedDataFetcher: Batch scores received for ${Object.keys(result.scores).length} games`);
      } catch (error) {
        console.error('UnifiedDataFetcher: Batch scores fetch failed, falling back to individual requests:', error);

        // Fallback to individual requests (limited)
        const fallbackGameIds = gameIds.slice(0, 10);
        const scoresMap: Record<number, any[]> = {};

        for (const gameId of fallbackGameIds) {
          try {
            const scores = await apiClient.get(`/api/games/${gameId}/scores`);
            scoresMap[gameId] = scores || [];
          } catch (gameError) {
            console.warn(`Failed to fetch scores for game ${gameId}:`, gameError);
            scoresMap[gameId] = [];
          }
        }

        result.scores = scoresMap;
      }
    }

    return result;
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

  async batchFetchStats(gameIds: number[], clubId: number, teamId?: number): Promise<Record<string, GameStat[]>> {
    if (gameIds.length === 0) return {};

    console.log(`UnifiedDataFetcher: Batch fetching stats for ${gameIds.length} games, teamId: ${teamId}`);

    try {
      const response = await apiClient.post(`/api/clubs/${clubId}/games/stats/batch`, {
        gameIds,
        teamId // Include team ID for filtering
      });

      console.log(`UnifiedDataFetcher: Batch stats received for ${gameIds.length} games`);
      return response || {};
    } catch (error) {
      console.error('UnifiedDataFetcher: Batch stats fetch failed:', error);
      return {};
    }
  }

  // Cache invalidation removed - should be handled at mutation points
  // (when actually saving/updating data) rather than during data fetching
}

export const dataFetcher = UnifiedDataFetcher.getInstance();