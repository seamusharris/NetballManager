
import { db, pool, checkPoolHealth } from './db';
import { sql } from 'drizzle-orm';

/**
 * Execute a database query with automatic retry on connection failures
 */
export async function executeWithRetry<T>(
  queryFn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Check pool health before executing
      if (attempt > 1) {
        const isHealthy = await checkPoolHealth();
        if (!isHealthy) {
          console.log(`Attempt ${attempt}: Database not healthy, waiting before retry...`);
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 500));
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
        error.message?.includes('connection') ||
        error.message?.includes('timeout');
        
      if (!isConnectionError || attempt === maxRetries) {
        throw error;
      }
      
      console.warn(`Database query failed on attempt ${attempt}/${maxRetries}:`, {
        code: error.code,
        message: error.message,
        retrying: attempt < maxRetries
      });
      
      // Wait before retry with exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 200));
    }
  }
  
  throw lastError;
}

/**
 * Safe database execute with retry logic
 */
export async function safeExecute<T = any>(query: any): Promise<{ rows: T[] }> {
  return executeWithRetry(() => db.execute(query));
}

/**
 * Safe pool query with retry logic
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
