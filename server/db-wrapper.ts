
import { db, pool, checkPoolHealth } from './db';
import { sql } from 'drizzle-orm';

/**
 * Execute a database query with automatic retry on connection failures
 * Enhanced with better error handling and exponential backoff
 */
export async function executeWithRetry<T>(
  queryFn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Check pool health before executing (only on retries)
      if (attempt > 1) {
        const isHealthy = await checkPoolHealth();
        if (!isHealthy) {
          console.log(`Attempt ${attempt}: Database not healthy, waiting before retry...`);
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * baseDelay));
        }
      }
      
      return await queryFn();
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a connection-related error
      const isConnectionError = 
        error.code === '57P01' || // terminating connection due to administrator command
        error.code === 'ECONNRESET' ||
        error.code === 'ENOTFOUND' ||
        error.code === 'ECONNREFUSED' ||
        error.message?.includes('connection') ||
        error.message?.includes('timeout') ||
        error.message?.includes('ECONNREFUSED');
        
      if (!isConnectionError || attempt === maxRetries) {
        throw error;
      }
      
      console.warn(`Database query failed on attempt ${attempt}/${maxRetries}:`, {
        code: error.code,
        message: error.message,
        retrying: attempt < maxRetries
      });
      
      // Wait before retry with exponential backoff
      const delay = Math.pow(2, attempt) * baseDelay;
      console.log(`Waiting ${delay}ms before retry ${attempt + 1}...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Safe pool query with retry logic and connection management
 */
export async function safePoolQuery(text: string, params?: any[]): Promise<any> {
  return executeWithRetry(async () => {
    const client = await pool.connect();
    try {
      return await client.query(text, params);
    } finally {
      client.release();
    }
  });
}

/**
 * Enhanced database health check with detailed diagnostics
 */
export async function enhancedHealthCheck(): Promise<{
  healthy: boolean;
  details: {
    poolSize: number;
    idleCount: number;
    waitingCount: number;
    totalCount: number;
    errors: string[];
  };
}> {
  const details = {
    poolSize: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
    totalCount: pool.totalCount,
    errors: [] as string[]
  };

  try {
    const isHealthy = await checkPoolHealth();
    return {
      healthy: isHealthy,
      details
    };
  } catch (error: any) {
    details.errors.push(error.message);
    return {
      healthy: false,
      details
    };
  }
}
