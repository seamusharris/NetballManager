/**
 * Simple Endpoint Usage Tracker
 * 
 * Tracks which endpoints are being used to help identify unused APIs
 */

import { Request, Response, NextFunction } from 'express';

// Track endpoint usage
const endpointUsage = new Map<string, {
  count: number;
  lastUsed: Date;
  method: string;
  path: string;
  userAgent?: string;
}>();

/**
 * Usage tracking middleware
 */
export function trackEndpointUsage() {
  return (req: Request, res: Response, next: NextFunction) => {
    const endpoint = `${req.method} ${req.path}`;
    
    const usage = endpointUsage.get(endpoint) || {
      count: 0,
      lastUsed: new Date(),
      method: req.method,
      path: req.path
    };
    
    usage.count++;
    usage.lastUsed = new Date();
    usage.userAgent = req.headers['user-agent'];
    
    endpointUsage.set(endpoint, usage);
    
    next();
  };
}

/**
 * Get usage statistics
 */
export function getUsageStats() {
  const stats = Array.from(endpointUsage.entries()).map(([endpoint, usage]) => ({
    endpoint,
    ...usage
  }));
  
  return {
    totalEndpoints: stats.length,
    totalRequests: stats.reduce((sum, stat) => sum + stat.count, 0),
    endpoints: stats.sort((a, b) => b.count - a.count),
    mostUsed: stats.slice(0, 10),
    leastUsed: stats.filter(s => s.count === 1).slice(0, 10),
    unused: [] // We'll populate this by comparing with all defined endpoints
  };
}

/**
 * Register usage stats endpoint
 */
export function registerUsageStatsEndpoint(app: any) {
  app.get('/api/admin/usage-stats', (req: Request, res: Response) => {
    const stats = getUsageStats();
    res.json(stats);
  });
}