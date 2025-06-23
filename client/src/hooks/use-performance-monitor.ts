
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface PerformanceMetrics {
  apiCalls: number;
  cacheHits: number;
  cacheMisses: number;
  averageResponseTime: number;
  errorRate: number;
}

export function usePerformanceMonitor(componentName: string) {
  const queryClient = useQueryClient();
  const metricsRef = useRef<PerformanceMetrics>({
    apiCalls: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageResponseTime: 0,
    errorRate: 0
  });

  useEffect(() => {
    const startTime = performance.now();
    
    // Monitor query cache stats
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    const activeQueries = queries.filter(q => q.state.status === 'loading').length;
    const cachedQueries = queries.filter(q => q.state.status === 'success').length;
    const errorQueries = queries.filter(q => q.state.status === 'error').length;
    
    console.log(`[${componentName}] Performance Stats:`, {
      activeQueries,
      cachedQueries,
      errorQueries,
      totalQueries: queries.length,
      loadTime: performance.now() - startTime
    });

    return () => {
      const endTime = performance.now();
      console.log(`[${componentName}] Component unmounted after ${endTime - startTime}ms`);
    };
  }, [componentName, queryClient]);

  const recordApiCall = (responseTime: number, wasError: boolean = false) => {
    const metrics = metricsRef.current;
    metrics.apiCalls++;
    metrics.averageResponseTime = (metrics.averageResponseTime + responseTime) / 2;
    if (wasError) metrics.errorRate = (metrics.errorRate + 1) / metrics.apiCalls;
  };

  const recordCacheHit = () => {
    metricsRef.current.cacheHits++;
  };

  const recordCacheMiss = () => {
    metricsRef.current.cacheMisses++;
  };

  const getMetrics = (): PerformanceMetrics => ({ ...metricsRef.current });

  return {
    recordApiCall,
    recordCacheHit,
    recordCacheMiss,
    getMetrics
  };
}

// Global performance tracker
class PerformanceTracker {
  private static instance: PerformanceTracker;
  private metrics = new Map<string, PerformanceMetrics>();

  static getInstance(): PerformanceTracker {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker();
    }
    return PerformanceTracker.instance;
  }

  trackPageLoad(pageName: string, loadTime: number) {
    console.log(`[Performance] ${pageName} loaded in ${loadTime}ms`);
    
    // Store metrics for analysis
    const existing = this.metrics.get(pageName) || {
      apiCalls: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageResponseTime: 0,
      errorRate: 0
    };
    
    existing.averageResponseTime = (existing.averageResponseTime + loadTime) / 2;
    this.metrics.set(pageName, existing);
  }

  getOverallMetrics() {
    const overall = Array.from(this.metrics.values()).reduce((acc, curr) => ({
      apiCalls: acc.apiCalls + curr.apiCalls,
      cacheHits: acc.cacheHits + curr.cacheHits,
      cacheMisses: acc.cacheMisses + curr.cacheMisses,
      averageResponseTime: (acc.averageResponseTime + curr.averageResponseTime) / 2,
      errorRate: (acc.errorRate + curr.errorRate) / 2
    }), {
      apiCalls: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageResponseTime: 0,
      errorRate: 0
    });

    return overall;
  }
}

export const performanceTracker = PerformanceTracker.getInstance();
import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  componentRenders: number;
  apiCalls: number;
  lastRenderTime: number;
  averageRenderTime: number;
  cacheHits: number;
  cacheMisses: number;
}

export function usePerformanceMonitor(componentName: string) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    componentRenders: 0,
    apiCalls: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    cacheHits: 0,
    cacheMisses: 0
  });

  const renderStartTime = useRef<number>(0);
  const renderTimes = useRef<number[]>([]);

  useEffect(() => {
    // Track component render
    const renderEndTime = performance.now();
    const renderDuration = renderEndTime - renderStartTime.current;

    renderTimes.current.push(renderDuration);
    if (renderTimes.current.length > 10) {
      renderTimes.current = renderTimes.current.slice(-10); // Keep last 10 renders
    }

    const averageRenderTime = renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length;

    setMetrics(prev => ({
      ...prev,
      componentRenders: prev.componentRenders + 1,
      lastRenderTime: renderDuration,
      averageRenderTime
    }));

    console.log(`[PERF] ${componentName} render ${prev => prev.componentRenders + 1}: ${renderDuration.toFixed(2)}ms (avg: ${averageRenderTime.toFixed(2)}ms)`);
  });

  // Start timing for next render
  renderStartTime.current = performance.now();

  const trackApiCall = () => {
    setMetrics(prev => ({
      ...prev,
      apiCalls: prev.apiCalls + 1
    }));
  };

  const trackCacheHit = () => {
    setMetrics(prev => ({
      ...prev,
      cacheHits: prev.cacheHits + 1
    }));
  };

  const trackCacheMiss = () => {
    setMetrics(prev => ({
      ...prev,
      cacheMisses: prev.cacheMisses + 1
    }));
  };

  return {
    metrics,
    trackApiCall,
    trackCacheHit,
    trackCacheMiss
  };
}
