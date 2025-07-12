import { queryClient } from './queryClient';

/**
 * Centralized cache management to prevent cache thrashing
 * and improve application performance
 */
export class CacheManager {
  /**
   * Invalidate specific cache keys with proper error handling
   */
  static async invalidateQueries(queries: string[], options?: { 
    exact?: boolean;
    refetchType?: 'active' | 'inactive' | 'all' | 'none';
  }) {
    try {
      await Promise.all(
        queries.map(queryKey => 
          queryClient.invalidateQueries({
            queryKey: [queryKey],
            exact: options?.exact ?? false,
            refetchType: options?.refetchType ?? 'active'
          })
        )
      );
      console.log(`✅ Invalidated ${queries.length} cache queries:`, queries);
    } catch (error) {
      console.error('❌ Cache invalidation failed:', error);
    }
  }

  /**
   * Remove specific cache entries without refetching
   */
  static async removeQueries(queries: string[]) {
    try {
      await Promise.all(
        queries.map(queryKey => 
          queryClient.removeQueries({
            queryKey: [queryKey],
            exact: false
          })
        )
      );
      console.log(`🗑️ Removed ${queries.length} cache entries:`, queries);
    } catch (error) {
      console.error('❌ Cache removal failed:', error);
    }
  }

  /**
   * Reset entire cache (use sparingly)
   */
  static async resetCache() {
    try {
      await queryClient.resetQueries();
      console.log('🔄 Cache reset completed');
    } catch (error) {
      console.error('❌ Cache reset failed:', error);
    }
  }

  /**
   * Get cache statistics for debugging
   */
  static getCacheStats() {
    const queries = queryClient.getQueryCache().getAll();
    const mutations = queryClient.getMutationCache().getAll();
    
    return {
      totalQueries: queries.length,
      totalMutations: mutations.length,
      activeQueries: queries.filter(q => q.isActive()).length,
      staleQueries: queries.filter(q => q.isStale()).length,
      fetchingQueries: queries.filter(q => q.state.status === 'pending').length,
      errorQueries: queries.filter(q => q.state.error).length
    };
  }

  /**
   * Prefetch data for better UX
   */
  static async prefetchQuery(queryKey: string[], queryFn: () => Promise<any>) {
    try {
      await queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
      console.log(`📥 Prefetched query: ${queryKey[0]}`);
    } catch (error) {
      console.warn(`⚠️ Prefetch failed for ${queryKey[0]}:`, error);
    }
  }

  /**
   * Set query data directly (useful for optimistic updates)
   */
  static setQueryData(queryKey: string[], data: any) {
    try {
      queryClient.setQueryData(queryKey, data);
      console.log(`📝 Set query data for: ${queryKey[0]}`);
    } catch (error) {
      console.error('❌ Set query data failed:', error);
    }
  }

  /**
   * Optimistic update helper
   */
  static async optimisticUpdate<T>(
    queryKey: string[],
    updateFn: (oldData: T | undefined) => T,
    rollbackFn?: () => Promise<void>
  ) {
    try {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot the previous value
      const previousData = queryClient.getQueryData<T>(queryKey);
      
      // Optimistically update to the new value
      queryClient.setQueryData<T>(queryKey, updateFn);
      
      return { previousData };
    } catch (error) {
      console.error('❌ Optimistic update failed:', error);
      if (rollbackFn) {
        await rollbackFn();
      }
      throw error;
    }
  }
}

/**
 * Cache invalidation patterns for common operations
 */
export const CachePatterns = {
  // Game-related invalidations
  GAME_UPDATED: ['games', 'teams', 'game-stats', 'game-scores'],
  GAME_CREATED: ['games', 'teams'],
  GAME_DELETED: ['games', 'teams'],
  
  // Player-related invalidations
  PLAYER_UPDATED: ['players', 'teams', 'rosters'],
  PLAYER_CREATED: ['players', 'teams'],
  PLAYER_DELETED: ['players', 'teams', 'rosters'],
  
  // Team-related invalidations
  TEAM_UPDATED: ['teams', 'players', 'rosters'],
  TEAM_CREATED: ['teams'],
  TEAM_DELETED: ['teams', 'players', 'rosters'],
  
  // Stats-related invalidations
  STATS_UPDATED: ['game-stats', 'player-stats', 'team-stats'],
  STATS_CREATED: ['game-stats', 'player-stats', 'team-stats'],
  STATS_DELETED: ['game-stats', 'player-stats', 'team-stats'],
  
  // Club-related invalidations
  CLUB_UPDATED: ['clubs', 'teams', 'players'],
  CLUB_CREATED: ['clubs'],
  CLUB_DELETED: ['clubs', 'teams', 'players'],
} as const;

/**
 * Helper function to invalidate cache based on operation type
 */
export function invalidateCacheForOperation(operation: keyof typeof CachePatterns) {
  const patterns = CachePatterns[operation];
  return CacheManager.invalidateQueries([...patterns]);
}