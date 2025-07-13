import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Clock, 
  Database, 
  Network, 
  HardDrive, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface PerformanceMetrics {
  pageLoadTime: number;
  apiResponseTime: number;
  renderTime: number;
  memoryUsage?: number;
  cacheHitRate?: number;
  errorRate?: number;
  timestamp: number;
}

interface PerformanceDashboardProps {
  metrics: PerformanceMetrics[];
  isRealTime?: boolean;
  onRefresh?: () => void;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  metrics,
  isRealTime = false,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(isRealTime);

  // Calculate aggregated metrics
  const latestMetrics = metrics[metrics.length - 1];
  const avgPageLoadTime = metrics.reduce((sum, m) => sum + m.pageLoadTime, 0) / metrics.length;
  const avgApiResponseTime = metrics.reduce((sum, m) => sum + m.apiResponseTime, 0) / metrics.length;
  const avgRenderTime = metrics.reduce((sum, m) => sum + m.renderTime, 0) / metrics.length;

  // Performance thresholds
  const thresholds = {
    pageLoad: { warning: 2000, critical: 5000 },
    apiResponse: { warning: 1000, critical: 3000 },
    render: { warning: 100, critical: 500 }
  };

  const getPerformanceStatus = (value: number, threshold: { warning: number; critical: number }) => {
    if (value <= threshold.warning) return 'good';
    if (value <= threshold.critical) return 'warning';
    return 'critical';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      onRefresh?.();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, onRefresh]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time performance metrics and system health
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRefresh?.()}
            disabled={!onRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className="h-4 w-4 mr-2" />
            {autoRefresh ? 'Auto' : 'Manual'}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Load Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestMetrics?.pageLoadTime?.toFixed(0) || 0}ms
            </div>
            <div className="flex items-center gap-2 mt-2">
              {getStatusIcon(getPerformanceStatus(latestMetrics?.pageLoadTime || 0, thresholds.pageLoad))}
              <Badge className={getStatusColor(getPerformanceStatus(latestMetrics?.pageLoadTime || 0, thresholds.pageLoad))}>
                {getPerformanceStatus(latestMetrics?.pageLoadTime || 0, thresholds.pageLoad)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Response</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestMetrics?.apiResponseTime?.toFixed(0) || 0}ms
            </div>
            <div className="flex items-center gap-2 mt-2">
              {getStatusIcon(getPerformanceStatus(latestMetrics?.apiResponseTime || 0, thresholds.apiResponse))}
              <Badge className={getStatusColor(getPerformanceStatus(latestMetrics?.apiResponseTime || 0, thresholds.apiResponse))}>
                {getPerformanceStatus(latestMetrics?.apiResponseTime || 0, thresholds.apiResponse)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Render Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestMetrics?.renderTime?.toFixed(0) || 0}ms
            </div>
            <div className="flex items-center gap-2 mt-2">
              {getStatusIcon(getPerformanceStatus(latestMetrics?.renderTime || 0, thresholds.render))}
              <Badge className={getStatusColor(getPerformanceStatus(latestMetrics?.renderTime || 0, thresholds.render))}>
                {getPerformanceStatus(latestMetrics?.renderTime || 0, thresholds.render)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestMetrics?.memoryUsage ? `${(latestMetrics.memoryUsage / 1024 / 1024).toFixed(1)}MB` : 'N/A'}
            </div>
            <Progress 
              value={latestMetrics?.memoryUsage ? Math.min((latestMetrics.memoryUsage / 1024 / 1024 / 100) * 100, 100) : 0} 
              className="mt-2" 
            />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Average Page Load</span>
                    <span>{avgPageLoadTime.toFixed(0)}ms</span>
                  </div>
                  <Progress 
                    value={Math.min((avgPageLoadTime / thresholds.pageLoad.critical) * 100, 100)} 
                    className="mt-1" 
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Average API Response</span>
                    <span>{avgApiResponseTime.toFixed(0)}ms</span>
                  </div>
                  <Progress 
                    value={Math.min((avgApiResponseTime / thresholds.apiResponse.critical) * 100, 100)} 
                    className="mt-1" 
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Average Render Time</span>
                    <span>{avgRenderTime.toFixed(0)}ms</span>
                  </div>
                  <Progress 
                    value={Math.min((avgRenderTime / thresholds.render.critical) * 100, 100)} 
                    className="mt-1" 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cache Hit Rate</span>
                  <Badge variant={latestMetrics?.cacheHitRate && latestMetrics.cacheHitRate > 80 ? "default" : "secondary"}>
                    {latestMetrics?.cacheHitRate?.toFixed(1) || 0}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Error Rate</span>
                  <Badge variant={latestMetrics?.errorRate && latestMetrics.errorRate < 5 ? "default" : "destructive"}>
                    {latestMetrics?.errorRate?.toFixed(2) || 0}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Last Updated</span>
                  <span className="text-sm text-muted-foreground">
                    {latestMetrics?.timestamp ? new Date(latestMetrics.timestamp).toLocaleTimeString() : 'Never'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Chart visualization would go here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              {latestMetrics?.pageLoadTime && latestMetrics.pageLoadTime > thresholds.pageLoad.critical ? (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Page load time is critically high: {latestMetrics.pageLoadTime.toFixed(0)}ms
                  </AlertDescription>
                </Alert>
              ) : latestMetrics?.apiResponseTime && latestMetrics.apiResponseTime > thresholds.apiResponse.critical ? (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    API response time is critically high: {latestMetrics.apiResponseTime.toFixed(0)}ms
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    All performance metrics are within acceptable ranges
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Auto-refresh interval</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                  <option value="5000">5 seconds</option>
                  <option value="10000">10 seconds</option>
                  <option value="30000">30 seconds</option>
                  <option value="60000">1 minute</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Performance thresholds</label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Page Load Warning</span>
                    <span className="text-sm">{thresholds.pageLoad.warning}ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API Response Warning</span>
                    <span className="text-sm">{thresholds.apiResponse.warning}ms</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 