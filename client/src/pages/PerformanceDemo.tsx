import React from 'react';
import { Helmet } from 'react-helmet';
import { StatsPerformanceDemo } from '@/components/stats/StatsPerformanceDemo';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

/**
 * Performance Demo page to showcase the database and query optimizations
 */
export default function PerformanceDemo() {
  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <Helmet>
        <title>Performance Optimizations | Netball Stats App</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight">Performance Optimizations</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            This page demonstrates the performance improvements made to the application,
            including database indexing, connection pooling, and granular query caching.
          </p>
        </div>
        
        <div className="grid gap-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Database Optimizations</h2>
            <div className="rounded-md bg-blue-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Implemented Improvements</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Added database indexes for faster query performance on <code>gameId</code>, <code>position</code>, and <code>quarter</code> columns</li>
                      <li>Created combined indexes for frequently joined data</li>
                      <li>Optimized connection pooling to prevent connection errors</li>
                      <li>Added structured error handling throughout the application</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">React Query Optimizations</h2>
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Client-Side Improvements</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Implemented granular stale times based on data type for better caching</li>
                      <li>Added error boundaries to prevent full application crashes</li>
                      <li>Standardized API URL patterns for consistency</li>
                      <li>Created specialized data-loading hooks with intelligent defaults</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <ErrorBoundary>
          <StatsPerformanceDemo />
        </ErrorBoundary>
      </div>
    </div>
  );
}