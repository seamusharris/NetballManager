import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema";
import { log } from "./vite";

neonConfig.webSocketConstructor = ws;

// Configure Neon for better error handling
// (fetchConnectionCache is now always true by default)

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Improved pool configuration with connection limits and timeouts
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 15, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 5000, // Return an error after 5 seconds if connection not established
  allowExitOnIdle: false, // Don't allow the pool to exit while the server is running
});

// Add event handlers for better diagnostics and error tracking
pool.on('connect', (client) => {
  log('New database connection established', 'db-pool');
});

pool.on('error', (err) => {
  log(`Database pool error: ${err.message}`, 'db-pool-error');
});

pool.on('remove', () => {
  log('Database connection removed from pool', 'db-pool');
});

// Export the drizzle instance with the schema
export const db = drizzle(pool, { schema });

// Function to check pool health
export async function checkPoolHealth() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    return { 
      healthy: true, 
      timestamp: result.rows[0].now,
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount
    };
  } catch (error) {
    log(`Database health check failed: ${error}`, 'db-error');
    return { 
      healthy: false, 
      error: error instanceof Error ? error.message : String(error),
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount
    };
  }
}