
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface RequestMetrics {
  duplicateRequests: number;
  concurrentRequests: number;
  averageResponseTime: number;
}

export function useRequestMonitor(componentName: string) {
  const queryClient = useQueryClient();
  const metricsRef = useRef<RequestMetrics>({
    duplicateRequests: 0,
    concurrentRequests: 0,
    averageResponseTime: 0
  });

  useEffect(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    const loadingQueries = queries.filter(q => q.state.status === 'loading');
    const successQueries = queries.filter(q => q.state.status === 'success');
    const errorQueries = queries.filter(q => q.state.status === 'error');
    
    // Check for duplicate queries (same key, multiple loading)
    const queryKeys = new Set();
    const duplicates = loadingQueries.filter(q => {
      const key = JSON.stringify(q.queryKey);
      if (queryKeys.has(key)) {
        return true;
      }
      queryKeys.add(key);
      return false;
    });

    if (duplicates.length > 0) {
      console.warn(`[${componentName}] Detected ${duplicates.length} duplicate requests:`, 
        duplicates.map(q => q.queryKey));
    }

    console.log(`[${componentName}] Query Status:`, {
      loading: loadingQueries.length,
      success: successQueries.length,
      errors: errorQueries.length,
      duplicates: duplicates.length,
      total: queries.length
    });

    metricsRef.current = {
      duplicateRequests: duplicates.length,
      concurrentRequests: loadingQueries.length,
      averageResponseTime: 0 // Would need response time tracking
    };
  }, [componentName, queryClient]);

  return metricsRef.current;
}
