import express from 'express';
import { registerRoutes } from './routes';
import { registerTeamRoutes } from './team-routes';
import { registerGameScoresRoutes } from './game-scores-routes';
import { registerGameStatsRoutes } from './game-stats-routes';
import gameStatusRoutes from './game-status-routes';
import { registerGamePermissionsRoutes } from './game-permissions-routes';
import { registerPlayerBorrowingRoutes } from './player-borrowing-routes';
import { registerUserManagementRoutes } from './user-management-routes';
import { enhancedHealthCheck } from './db-wrapper';
import { setupVite, serveStatic } from './vite';
import { loadUserPermissions } from './auth-middleware';

const app = express();
const PORT = process.env.PORT || 3000;

// Enhanced CORS configuration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-current-club-id');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply user permissions middleware only to API routes
app.use('/api', loadUserPermissions);

// Database health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const health = await enhancedHealthCheck();
    res.json({
      status: health.healthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      database: health.details
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Database health monitoring on startup
async function checkDatabaseHealth() {
  console.log('🔍 Checking database health on startup...');
  try {
    const health = await enhancedHealthCheck();
    if (health.healthy) {
      console.log('✅ Database connection healthy');
      // Only log pool stats if there are issues
      if (health.details.waitingCount > 0 || health.details.totalCount > 5) {
        console.log(`📊 Pool stats: ${health.details.idleCount} idle, ${health.details.waitingCount} waiting, ${health.details.totalCount} total`);
      }
    } else {
      console.warn('⚠️ Database connection degraded:', health.details.errors);
    }
  } catch (error) {
    console.error('❌ Database health check failed:', error);
  }
}

// Register all API routes
registerRoutes(app);
registerTeamRoutes(app);
registerGameScoresRoutes(app);
registerGameStatsRoutes(app);
app.use('/api/game-statuses', gameStatusRoutes);
registerGamePermissionsRoutes(app);
registerPlayerBorrowingRoutes(app);
registerUserManagementRoutes(app);

// Start server with health check
const server = app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Perform initial health check
  await checkDatabaseHealth();
  
  // Set up periodic health monitoring - reduced frequency
  setInterval(async () => {
    try {
      const health = await enhancedHealthCheck();
      // Only log if there are issues
      if (!health.healthy || health.details.waitingCount > 0) {
        console.warn('⚠️ Database health degraded:', health.details.errors);
      }
    } catch (error) {
      console.error('❌ Periodic health check failed:', error);
    }
  }, 10 * 60 * 1000); // Check every 10 minutes instead of 5
});

// Setup Vite for development or serve static files for production
if (process.env.NODE_ENV === 'development') {
  setupVite(app, server);
} else {
  serveStatic(app);
}