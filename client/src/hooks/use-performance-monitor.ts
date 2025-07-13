
import { useEffect, useRef, useState } from 'react';

/**
 * Performance monitoring hook for tracking app performance metrics
 * Helps identify bottlenecks and optimize user experience
 */

interface PerformanceMetrics {
  pageLoadTime: number;
  apiResponseTime: number;
  renderTime: number;
  memoryUsage?: number;
}

interface PerformanceMonitorOptions {
  trackApiCalls?: boolean;
  trackRenderTime?: boolean;
  trackMemoryUsage?: boolean;
  logToConsole?: boolean;
}

export const usePerformanceMonitor = (
  componentName: string,
  options: PerformanceMonitorOptions = {}
) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: 0,
    apiResponseTime: 0,
    renderTime: 0,
  });

  const startTime = useRef<number>(Date.now());
  const renderStartTime = useRef<number>(0);

  // Track component render time
  useEffect(() => {
    if (options.trackRenderTime) {
      renderStartTime.current = performance.now();
      
      return () => {
        const renderTime = performance.now() - renderStartTime.current;
        setMetrics(prev => ({ ...prev, renderTime }));
        
        if (options.logToConsole && renderTime > 16) { // 16ms = 60fps threshold
          console.warn(`🚨 Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
        }
      };
    }
  }, [componentName, options.trackRenderTime, options.logToConsole]);

  // Track page load time
  useEffect(() => {
    const loadTime = Date.now() - startTime.current;
    setMetrics(prev => ({ ...prev, pageLoadTime: loadTime }));
    
    if (options.logToConsole) {
      console.log(`📊 ${componentName} load time: ${loadTime}ms`);
    }
  }, [componentName, options.logToConsole]);

  // Track memory usage if available
  useEffect(() => {
    if (options.trackMemoryUsage && 'memory' in performance) {
      const memory = (performance as any).memory;
      setMetrics(prev => ({ 
        ...prev, 
        memoryUsage: memory.usedJSHeapSize / 1024 / 1024 // Convert to MB
      }));
    }
  }, [options.trackMemoryUsage]);

  // API performance tracking
  const trackApiCall = async <T>(
    apiCall: () => Promise<T>,
    endpoint: string
  ): Promise<T> => {
    const start = performance.now();
    
    try {
      const result = await apiCall();
      const responseTime = performance.now() - start;
      
      setMetrics(prev => ({ ...prev, apiResponseTime: responseTime }));
      
      if (options.logToConsole && responseTime > 1000) { // 1 second threshold
        console.warn(`🐌 Slow API call detected: ${endpoint} took ${responseTime.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const responseTime = performance.now() - start;
      console.error(`❌ API call failed: ${endpoint} after ${responseTime.toFixed(2)}ms`, error);
      throw error;
    }
  };

  return {
    metrics,
    trackApiCall,
    // Performance optimization helpers
    debounce: <T extends (...args: any[]) => any>(
      func: T,
      delay: number
    ): T => {
      let timeoutId: NodeJS.Timeout;
      return ((...args: any[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
      }) as T;
    },
    
    throttle: <T extends (...args: any[]) => any>(
      func: T,
      delay: number
    ): T => {
      let lastCall = 0;
      return ((...args: any[]) => {
        const now = Date.now();
        if (now - lastCall >= delay) {
          lastCall = now;
          func(...args);
        }
      }) as T;
    },
  };
};

/**
 * Hook for tracking specific performance bottlenecks
 */
export const usePerformanceBottleneck = (componentName: string) => {
  const [bottlenecks, setBottlenecks] = useState<string[]>([]);

  const trackBottleneck = (operation: string, duration: number, threshold = 100) => {
    if (duration > threshold) {
      const bottleneck = `${operation}: ${duration.toFixed(2)}ms`;
      setBottlenecks(prev => [...prev, bottleneck]);
      console.warn(`🚨 Performance bottleneck in ${componentName}: ${bottleneck}`);
    }
  };

  const clearBottlenecks = () => setBottlenecks([]);

  return {
    bottlenecks,
    trackBottleneck,
    clearBottlenecks,
  };
};

/**
 * Hook for optimizing re-renders
 */
export const useRenderOptimization = (componentName: string) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1;
    const now = performance.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    lastRenderTime.current = now;

    // Warn about excessive re-renders
    if (renderCount.current > 10) {
      console.warn(`🔄 Excessive re-renders detected in ${componentName}: ${renderCount.current} renders`);
    }

    // Warn about rapid re-renders
    if (timeSinceLastRender < 16) { // Less than 60fps
      console.warn(`⚡ Rapid re-render detected in ${componentName}: ${timeSinceLastRender.toFixed(2)}ms since last render`);
    }
  });

  return {
    renderCount: renderCount.current,
    resetRenderCount: () => { renderCount.current = 0; },
  };
};
