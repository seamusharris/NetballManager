
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface RequestMetrics {
  duplicateRequests: number;
  concurrentRequests: number;
  averageResponseTime: number;
  totalRequests: number;
  failedRequests: number;
  activeRequests: number;
}

// Global request monitoring state
let globalRequestMetrics: RequestMetrics = {
  duplicateRequests: 0,
  concurrentRequests: 0,
  averageResponseTime: 0,
  totalRequests: 0,
  failedRequests: 0,
  activeRequests: 0,
};

let requestHistory: Array<{ startTime: number; endTime?: number; success?: boolean }> = [];

export function useRequestMonitor(componentName: string) {
  const queryClient = useQueryClient();
  const [metrics, setMetrics] = useState<RequestMetrics>(globalRequestMetrics);

  // Update metrics from global state
  useEffect(() => {
    const updateMetrics = () => {
      setMetrics({ ...globalRequestMetrics });
    };

    // Update immediately
    updateMetrics();

    // Update every second
    const interval = setInterval(updateMetrics, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    const loadingQueries = queries.filter(q => q.state.status === 'pending');
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

    // Update global metrics
    globalRequestMetrics = {
      duplicateRequests: duplicates.length,
      concurrentRequests: loadingQueries.length,
      averageResponseTime: globalRequestMetrics.averageResponseTime,
      totalRequests: successQueries.length + errorQueries.length,
      failedRequests: errorQueries.length,
      activeRequests: loadingQueries.length,
    };

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
  }, [componentName, queryClient]);

  return metrics;
}

// Intercept fetch to track request metrics
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const startTime = Date.now();
  const requestId = Math.random();
  
  // Add to active requests
  globalRequestMetrics.activeRequests++;
  requestHistory.push({ startTime });
  
  try {
    const response = await originalFetch(...args);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Update request history
    const request = requestHistory.find(r => r.startTime === startTime);
    if (request) {
      request.endTime = endTime;
      request.success = response.ok;
    }
    
    // Update metrics
    globalRequestMetrics.activeRequests--;
    globalRequestMetrics.totalRequests++;
    
    if (!response.ok) {
      globalRequestMetrics.failedRequests++;
    }
    
    // Calculate average response time
    const completedRequests = requestHistory.filter(r => r.endTime);
    if (completedRequests.length > 0) {
      const totalTime = completedRequests.reduce((sum, r) => sum + (r.endTime! - r.startTime), 0);
      globalRequestMetrics.averageResponseTime = totalTime / completedRequests.length;
    }
    
    // Keep only last 100 requests in history
    if (requestHistory.length > 100) {
      requestHistory = requestHistory.slice(-100);
    }
    
    return response;
  } catch (error) {
    const endTime = Date.now();
    
    // Update request history
    const request = requestHistory.find(r => r.startTime === startTime);
    if (request) {
      request.endTime = endTime;
      request.success = false;
    }
    
    // Update metrics
    globalRequestMetrics.activeRequests--;
    globalRequestMetrics.totalRequests++;
    globalRequestMetrics.failedRequests++;
    
    throw error;
  }
};
