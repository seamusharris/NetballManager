import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsPerformanceDemo } from '@/components/stats/StatsPerformanceDemo';

/**
 * Performance Demo Page showcasing optimized data loading techniques
 */
export default function PerformanceDemo() {
  return (
    <div className="container mx-auto py-6">
      <Helmet>
        <title>Performance Demo - Emerald Netball</title>
      </Helmet>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Performance Optimizations</h1>
        <p className="text-muted-foreground mt-2">
          Demonstration of performance optimization techniques and improved data loading
        </p>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Application Performance Improvements</CardTitle>
            <CardDescription>
              Recent optimizations to improve app responsiveness and data loading
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              <li>Database indexes for faster queries on frequently accessed fields</li>
              <li>Optimized database connection pooling to prevent "too many connections" errors</li>
              <li>Intelligent caching with data-type specific stale times</li>
              <li>Error boundary components to prevent full page crashes</li>
              <li>Improved loading states and feedback for better user experience</li>
            </ul>
          </CardContent>
        </Card>
        
        <StatsPerformanceDemo />
      </div>
    </div>
  );
}