import { QueryClient } from '@tanstack/react-query';
import { CACHE_KEYS } from './cacheKeys';

export class CacheManager {
  constructor(private queryClient: QueryClient) {}

  // Smart invalidation based on data relationships
  async invalidateOnClubSwitch(newClubId: number, oldClubId: number | null) {
    if (oldClubId === newClubId) return;

    console.log(`CacheManager: Switching from club ${oldClubId} to ${newClubId}`);

    // Only invalidate club-specific data, preserve global data
    await this.queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey;
        return key.includes(oldClubId) || key.includes('user-clubs');
      }
    });

    // Prefetch critical data for new club
    this.prefetchClubEssentials(newClubId);
  }

  async invalidateOnTeamSwitch(clubId: number, newTeamId: number | null, oldTeamId: number | null) {
    if (newTeamId === oldTeamId) return;

    console.log(`CacheManager: Switching team from ${oldTeamId} to ${newTeamId} for club ${clubId}`);

    // Only invalidate specific team data that can't be reused
    // Keep club-level data and data that can be filtered client-side
    const teamSpecificPatterns = [
      ['dashboard-batch-data', clubId, oldTeamId], // Only old team's batch data
    ];

    for (const pattern of teamSpecificPatterns) {
      await this.queryClient.removeQueries({ 
        queryKey: pattern, 
        exact: true // Only remove exact matches
      });
      console.log(`CacheManager: Removed specific pattern:`, pattern);
    }

    // Preserve games, players, and other data that can be filtered client-side
    console.log(`CacheManager: Preserved club-level cache for better performance`);
  }

  // Prefetch critical data
  private async prefetchClubEssentials(clubId: number) {
    const criticalQueries = [
      CACHE_KEYS.teams(clubId),
      CACHE_KEYS.games(clubId),
      CACHE_KEYS.players(clubId)
    ];

    for (const queryKey of criticalQueries) {
      this.queryClient.prefetchQuery({
        queryKey,
        staleTime: 5 * 60 * 1000 // 5 minutes
      });
    }
  }

  // Optimize cache size
  clearStaleCache() {
    const staleTime = 60 * 60 * 1000; // 1 hour
    this.queryClient.getQueryCache().getAll()
      .filter(query => Date.now() - query.state.dataUpdatedAt > staleTime)
      .forEach(query => this.queryClient.removeQueries({ queryKey: query.queryKey }));
  }

  // Get cache statistics
  getCacheStats() {
    const cache = this.queryClient.getQueryCache();
    const queries = cache.getAll();

    return {
      totalQueries: queries.length,
      staleCacheSize: queries.filter(q => q.isStale()).length,
      errorQueries: queries.filter(q => q.state.status === 'error').length,
      memoryUsage: this.estimateCacheSize(queries)
    };
  }

  private estimateCacheSize(queries: any[]): string {
    const totalSize = queries.reduce((size, query) => {
      return size + JSON.stringify(query.state.data || {}).length;
    }, 0);

    return `${(totalSize / 1024 / 1024).toFixed(2)} MB`;
  }

  // Invalidate team-specific cached data when switching teams
  invalidateTeamData(newTeamId: number | null, oldTeamId: number | null) {
    if (!this.queryClient) return;

    console.log('CacheManager: Invalidating team data for team switch:', { newTeamId, oldTeamId });

    // Invalidate team-specific queries
    this.queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey;
        const keyStr = Array.isArray(key) ? key.join('-') : String(key);

        // Invalidate dashboard batch data to force refresh with new team context
        if (keyStr.includes('dashboard-batch-data')) {
          console.log('CacheManager: Invalidating dashboard batch data for team switch');
          return true;
        }

        // Invalidate any queries that include the old team ID
        if (oldTeamId && keyStr.includes(oldTeamId.toString())) {
          console.log('CacheManager: Invalidating query with old team ID:', keyStr);
          return true;
        }

        return false;
      }
    });
  }

  // Helper to check if a key should be invalidated during club switch
  shouldInvalidateOnClubSwitch: (key: string, newClubId: number, oldClubId: number | null): boolean => {
    // Add your logic here to determine invalidation
    return false;
  }
}

// Global cache manager instance
export let cacheManager: CacheManager;

export const initializeCacheManager = (queryClient: QueryClient) => {
  cacheManager = new CacheManager(queryClient);
  return cacheManager;
};