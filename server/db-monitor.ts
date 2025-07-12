import { pool } from './db';

/**
 * Database connection monitor for debugging and optimization
 */
export class DatabaseMonitor {
  private static instance: DatabaseMonitor;
  private stats = {
    totalAcquires: 0,
    totalReleases: 0,
    errors: 0,
    lastCheck: Date.now()
  };

  private constructor() {
    // Monitor pool events
    pool.on('acquire', () => {
      this.stats.totalAcquires++;
    });

    pool.on('release', () => {
      this.stats.totalReleases++;
    });

    pool.on('error', () => {
      this.stats.errors++;
    });
  }

  static getInstance(): DatabaseMonitor {
    if (!DatabaseMonitor.instance) {
      DatabaseMonitor.instance = new DatabaseMonitor();
    }
    return DatabaseMonitor.instance;
  }

  /**
   * Get current pool statistics
   */
  getPoolStats() {
    return {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount,
      acquires: this.stats.totalAcquires,
      releases: this.stats.totalReleases,
      errors: this.stats.errors,
      lastCheck: this.stats.lastCheck
    };
  }

  /**
   * Log pool statistics (only if there are issues)
   */
  logStats() {
    const stats = this.getPoolStats();
    const now = Date.now();
    
    // Only log if there are issues or significant activity
    if (stats.waitingCount > 0 || stats.errors > 0 || stats.totalCount > 5) {
      console.log('📊 Database Pool Stats:', {
        total: stats.totalCount,
        idle: stats.idleCount,
        waiting: stats.waitingCount,
        acquires: stats.acquires,
        releases: stats.releases,
        errors: stats.errors,
        timeSinceLastCheck: now - stats.lastCheck
      });
    }
    
    this.stats.lastCheck = now;
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalAcquires: 0,
      totalReleases: 0,
      errors: 0,
      lastCheck: Date.now()
    };
  }
}

// Export singleton instance
export const dbMonitor = DatabaseMonitor.getInstance(); 