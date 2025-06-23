import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

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

    console.log(`[PERF] ${componentName} render ${metrics.componentRenders + 1}: ${renderDuration.toFixed(2)}ms (avg: ${averageRenderTime.toFixed(2)}ms)`);
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
      componentRenders: 0,
      apiCalls: 0,
      lastRenderTime: 0,
      averageRenderTime: 0,
      cacheHits: 0,
      cacheMisses: 0
    };

    existing.averageRenderTime = (existing.averageRenderTime + loadTime) / 2;
    this.metrics.set(pageName, existing);
  }

  getOverallMetrics() {
    const overall = Array.from(this.metrics.values()).reduce((acc, curr) => ({
      apiCalls: acc.apiCalls + curr.apiCalls,
      cacheHits: acc.cacheHits + curr.cacheHits,
      cacheMisses: acc.cacheMisses + curr.cacheMisses,
      averageRenderTime: (acc.averageRenderTime + curr.averageRenderTime) / 2,
      componentRenders: acc.componentRenders + curr.componentRenders,
      lastRenderTime: acc.lastRenderTime + curr.lastRenderTime
    }), {
      apiCalls: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageRenderTime: 0,
      componentRenders: 0,
      lastRenderTime: 0
    });

    return overall;
  }
}

export const performanceTracker = PerformanceTracker.getInstance();