import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PerformanceDashboard } from '@/components/dashboard/PerformanceDashboard';
import { usePerformanceMonitor } from '@/hooks/use-performance-monitor';
import { useRequestMonitor } from '@/hooks/use-request-monitor';
import { Activity, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PerformanceMetrics {
  pageLoadTime: number;
  apiResponseTime: number;
  renderTime: number;
  memoryUsage?: number;
  cacheHitRate?: number;
  errorRate?: number;
  timestamp: number;
}

export default function PerformanceDashboardPage() {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [isRealTime, setIsRealTime] = useState(true);

  // Use performance monitoring hooks
  const performanceMetrics = usePerformanceMonitor('PerformanceDashboard', {
    trackApiCalls: true,
    trackRenderTime: true,
    logToConsole: true
  });

  const requestMetrics = useRequestMonitor('PerformanceDashboard');

  // Update metrics when new data comes in
  useEffect(() => {
    if (performanceMetrics) {
      const newMetric: PerformanceMetrics = {
        pageLoadTime: performanceMetrics.metrics.pageLoadTime || 0,
        apiResponseTime: performanceMetrics.metrics.apiResponseTime || 0,
        renderTime: performanceMetrics.metrics.renderTime || 0,
        memoryUsage: performanceMetrics.metrics.memoryUsage,
        cacheHitRate: undefined, // Not available in current hook
        errorRate: undefined, // Not available in current hook
        timestamp: Date.now()
      };

      setMetrics(prev => [...prev, newMetric].slice(-50)); // Keep last 50 metrics
    }
  }, [performanceMetrics]);

  const handleRefresh = () => {
    // Force a refresh of performance data
    window.location.reload();
  };

  const getSystemHealth = () => {
    if (metrics.length === 0) return 'unknown';
    
    const latest = metrics[metrics.length - 1];
    const avgPageLoad = metrics.reduce((sum, m) => sum + m.pageLoadTime, 0) / metrics.length;
    const avgApiResponse = metrics.reduce((sum, m) => sum + m.apiResponseTime, 0) / metrics.length;

    if (avgPageLoad > 5000 || avgApiResponse > 3000) return 'critical';
    if (avgPageLoad > 2000 || avgApiResponse > 1000) return 'warning';
    return 'healthy';
  };

  const systemHealth = getSystemHealth();

  return (
    <>
      <Helmet>
        <title>Performance Dashboard | Netball Team Stats</title>
        <meta name="description" content="Real-time performance monitoring and system health dashboard" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="container py-8 mx-auto space-y-8">
          {/* Header */}
          <Card className="border-0 shadow-lg text-white" style={{backgroundColor: '#1e3a8a'}}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Activity className="h-8 w-8 text-white" />
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">
                      Performance Dashboard
                    </h1>
                    <p className="text-blue-100">
                      Real-time system monitoring and performance metrics
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {systemHealth === 'healthy' && <CheckCircle className="h-6 w-6 text-green-400" />}
                    {systemHealth === 'warning' && <AlertTriangle className="h-6 w-6 text-yellow-400" />}
                    {systemHealth === 'critical' && <AlertTriangle className="h-6 w-6 text-red-400" />}
                    <span className="text-white font-semibold capitalize">{systemHealth}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Health Alert */}
          {systemHealth !== 'healthy' && (
            <Alert variant={systemHealth === 'critical' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {systemHealth === 'critical' 
                  ? 'System performance is critical. Consider optimizing database queries and reducing API calls.'
                  : 'System performance is degraded. Monitor for improvements.'
                }
              </AlertDescription>
            </Alert>
          )}

          {/* Performance Dashboard Component */}
          <PerformanceDashboard 
            metrics={metrics}
            isRealTime={isRealTime}
            onRefresh={handleRefresh}
          />

          {/* Additional System Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <RefreshCw className="h-5 w-5" />
                  <span>Request Monitoring</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Concurrent Requests</p>
                    <p className="text-2xl font-bold">{requestMetrics.concurrentRequests}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Duplicate Requests</p>
                    <p className="text-2xl font-bold">{requestMetrics.duplicateRequests}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Response Time</p>
                    <p className="text-2xl font-bold">{requestMetrics.averageResponseTime?.toFixed(0) || 0}ms</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Performance Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Metrics Collected</p>
                    <p className="text-2xl font-bold">{metrics.length}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monitoring Duration</p>
                    <p className="text-2xl font-bold">
                      {metrics.length > 0 
                        ? `${Math.round((Date.now() - metrics[0].timestamp) / 1000 / 60)}m`
                        : '0m'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Real-time Updates</p>
                    <p className="text-2xl font-bold">{isRealTime ? 'Enabled' : 'Disabled'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Tips */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Performance Optimization Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Database Optimization</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Use database indexes for frequently queried columns</li>
                    <li>• Implement connection pooling</li>
                    <li>• Cache frequently accessed data</li>
                    <li>• Optimize SQL queries</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Frontend Optimization</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Implement React Query caching</li>
                    <li>• Use lazy loading for components</li>
                    <li>• Optimize bundle size</li>
                    <li>• Implement proper error boundaries</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
} 