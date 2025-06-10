
import React from 'react';
import { cacheManager } from '@/lib/cacheManager';
import { Card } from '@/components/ui/card';

export function CacheDebug() {
  const [stats, setStats] = React.useState<any>(null);

  React.useEffect(() => {
    const updateStats = () => {
      if (cacheManager) {
        setStats(cacheManager.getCacheStats());
      }
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) return null;

  return (
    <Card className="p-4 m-4">
      <h3 className="font-bold mb-2">Cache Statistics</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>Total Queries: {stats.totalQueries}</div>
        <div>Stale Queries: {stats.staleCacheSize}</div>
        <div>Error Queries: {stats.errorQueries}</div>
        <div>Memory Usage: {stats.memoryUsage}</div>
      </div>
      <button 
        onClick={() => cacheManager.clearStaleCache()}
        className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
      >
        Clear Stale Cache
      </button>
    </Card>
  );
}
