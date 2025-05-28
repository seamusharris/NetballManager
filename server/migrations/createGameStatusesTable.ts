
/**
 * Migration to create the game_statuses table and migrate existing game status data
 * This will:
 * 1. Create the game_statuses table
 * 2. Populate it with initial status definitions
 * 3. Add statusId column to games table
 * 4. Migrate existing status data to use IDs
 * 5. Eventually remove the old status column (kept for now for backward compatibility)
 */

import { db } from '../db';
import { gameStatuses, games } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';
import { log } from '../vite';

/**
 * Create game_statuses table and migrate existing data
 */
export async function createGameStatusesTable(): Promise<boolean> {
  try {
    log("Starting game_statuses table creation and migration", "migration");

    // Check if the table already exists
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'game_statuses'
      );
    `);

    if (tableExists.rows[0].exists) {
      log("game_statuses table already exists, skipping creation", "migration");
      return true;
    }

    // Create the game_statuses table
    await db.execute(sql`
      CREATE TABLE game_statuses (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        display_name VARCHAR(100) NOT NULL,
        points INTEGER NOT NULL DEFAULT 0,
        opponent_points INTEGER NOT NULL DEFAULT 0,
        is_completed BOOLEAN NOT NULL DEFAULT false,
        allows_statistics BOOLEAN NOT NULL DEFAULT true,
        requires_opponent BOOLEAN NOT NULL DEFAULT true,
        color_class VARCHAR(50),
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);

    log("Created game_statuses table", "migration");

    // Insert initial game status definitions
    const initialStatuses = [
      {
        name: 'upcoming',
        displayName: 'Upcoming',
        points: 0,
        opponentPoints: 0,
        isCompleted: false,
        allowsStatistics: false,
        requiresOpponent: true,
        colorClass: 'bg-gray-500',
        sortOrder: 1,
        isActive: true
      },
      {
        name: 'in-progress',
        displayName: 'In Progress',
        points: 0,
        opponentPoints: 0,
        isCompleted: false,
        allowsStatistics: true,
        requiresOpponent: true,
        colorClass: 'bg-blue-500',
        sortOrder: 2,
        isActive: true
      },
      {
        name: 'completed',
        displayName: 'Completed',
        points: 0, // Points will be calculated based on actual game result
        opponentPoints: 0,
        isCompleted: true,
        allowsStatistics: true,
        requiresOpponent: true,
        colorClass: 'bg-green-500',
        sortOrder: 3,
        isActive: true
      },
      {
        name: 'forfeit-win',
        displayName: 'Forfeit Win',
        points: 4,
        opponentPoints: 0,
        isCompleted: true,
        allowsStatistics: false,
        requiresOpponent: true,
        colorClass: 'bg-green-600',
        sortOrder: 4,
        isActive: true
      },
      {
        name: 'forfeit-loss',
        displayName: 'Forfeit Loss',
        points: 0,
        opponentPoints: 4,
        isCompleted: true,
        allowsStatistics: false,
        requiresOpponent: true,
        colorClass: 'bg-red-600',
        sortOrder: 5,
        isActive: true
      },
      {
        name: 'bye',
        displayName: 'BYE',
        points: 4,
        opponentPoints: 0,
        isCompleted: true,
        allowsStatistics: false,
        requiresOpponent: false,
        colorClass: 'bg-purple-500',
        sortOrder: 6,
        isActive: true
      },
      {
        name: 'abandoned',
        displayName: 'Abandoned',
        points: 0, // No points awarded for abandoned games by default
        opponentPoints: 0,
        isCompleted: true,
        allowsStatistics: false, // No statistics recorded for abandoned games
        requiresOpponent: true,
        colorClass: 'bg-gray-600',
        sortOrder: 7,
        isActive: true
      }
    ];

    await db.insert(gameStatuses).values(initialStatuses);
    log(`Inserted ${initialStatuses.length} initial game statuses`, "migration");

    // Add statusId column to games table
    const statusIdColumnExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'games'
        AND column_name = 'status_id'
      );
    `);

    if (!statusIdColumnExists.rows[0].exists) {
      await db.execute(sql`
        ALTER TABLE games 
        ADD COLUMN status_id INTEGER REFERENCES game_statuses(id);
      `);
      log("Added status_id column to games table", "migration");
    } else {
      log("status_id column already exists in games table", "migration");
    }

    // Migrate existing status data to use IDs
    const allStatuses = await db.select().from(gameStatuses);
    const statusMap = new Map(allStatuses.map(s => [s.name, s.id]));

    // Get all games that need migration
    const gamesToMigrate = await db.execute(sql`
      SELECT id, status FROM games WHERE status_id IS NULL;
    `);

    log(`Found ${gamesToMigrate.length} games to migrate`, "migration");

    for (const game of gamesToMigrate.rows) {
      const statusId = statusMap.get(game.status) || statusMap.get('upcoming');
      if (statusId) {
        await db.execute(sql`
          UPDATE games SET status_id = ${statusId} WHERE id = ${game.id};
        `);
      }
    }

    log(`Successfully migrated ${gamesToMigrate.length} games to use status IDs`, "migration");

    // Create indexes for performance
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_games_status_id ON games(status_id);
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_game_statuses_name ON game_statuses(name);
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_game_statuses_is_active ON game_statuses(is_active);
    `);

    log("Created indexes on game_statuses table", "migration");
    log("Completed game_statuses table migration", "migration");
    return true;

  } catch (error) {
    log(`Error in game_statuses migration: ${error}`, "migration");
    return false;
  }
}
