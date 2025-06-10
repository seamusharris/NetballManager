import { QueryClient } from '@tanstack/react-query';

export class CacheManager {
  constructor(private queryClient: QueryClient) {}

  // Get cache statistics for debugging
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

  // Optimize cache size by removing truly stale data
  clearStaleCache() {
    const staleTime = 60 * 60 * 1000; // 1 hour
    this.queryClient.getQueryCache().getAll()
      .filter(query => Date.now() - query.state.dataUpdatedAt > staleTime)
      .forEach(query => this.queryClient.removeQueries({ queryKey: query.queryKey }));
  }

  // Club switching cache invalidation removed to prevent race conditions
  // Cache will be managed naturally through query key changes
}

// Global cache manager instance
export let cacheManager: CacheManager;

export const initializeCacheManager = (queryClient: QueryClient) => {
  cacheManager = new CacheManager(queryClient);
  return cacheManager;
};