
/**
 * Migration to fix game_statuses foreign key constraint issues
 * This will safely rebuild the game_statuses table and fix all relationships
 */

import { db } from '../db';
import { sql } from 'drizzle-orm';
import { log } from '../vite';

export async function fixGameStatusesConstraints(): Promise<boolean> {
  try {
    log("Starting game_statuses constraint fix migration", "migration");

    // First, temporarily remove the foreign key constraint to allow data manipulation
    await db.execute(sql`
      ALTER TABLE games DROP CONSTRAINT IF EXISTS games_status_id_game_statuses_id_fk;
    `);
    log("Removed foreign key constraint temporarily", "migration");

    // Clear and recreate game_statuses table with fresh data
    await db.execute(sql`DELETE FROM game_statuses;`);
    log("Cleared existing game_statuses data", "migration");

    // Insert the standard game statuses
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
        points: 0,
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
        points: 0,
        opponentPoints: 0,
        isCompleted: true,
        allowsStatistics: false,
        requiresOpponent: true,
        colorClass: 'bg-gray-600',
        sortOrder: 7,
        isActive: true
      }
    ];

    // Insert each status using Drizzle ORM to ensure proper column mapping
    for (const status of initialStatuses) {
      await db.execute(sql`
        INSERT INTO game_statuses (
          name, display_name, points, opponent_points, is_completed,
          allows_statistics, requires_opponent, color_class, sort_order, is_active
        ) VALUES (
          ${status.name}, ${status.displayName}, ${status.points}, ${status.opponentPoints},
          ${status.isCompleted}, ${status.allowsStatistics}, ${status.requiresOpponent},
          ${status.colorClass}, ${status.sortOrder}, ${status.isActive}
        );
      `);
    }

    log("Recreated game_statuses with standard entries", "migration");

    // Get the status IDs for mapping
    const statusMap = await db.execute(sql`
      SELECT id, name FROM game_statuses ORDER BY id;
    `);

    log(`Found ${statusMap.length} game statuses`, "migration");

    // Update all games to use valid status IDs based on their current state
    // Default upcoming games to status ID 1 (upcoming)
    // Default completed games to status ID 3 (completed)
    // BYE games to status ID 6 (bye)

    // Update BYE games first
    await db.execute(sql`
      UPDATE games 
      SET status_id = (SELECT id FROM game_statuses WHERE name = 'bye')
      WHERE opponent_id IS NULL;
    `);

    // Update completed games
    await db.execute(sql`
      UPDATE games 
      SET status_id = (SELECT id FROM game_statuses WHERE name = 'completed')
      WHERE status_id IS NULL OR status_id NOT IN (SELECT id FROM game_statuses);
    `);

    // Ensure any remaining NULL status_ids are set to upcoming
    await db.execute(sql`
      UPDATE games 
      SET status_id = (SELECT id FROM game_statuses WHERE name = 'upcoming')
      WHERE status_id IS NULL;
    `);

    log("Updated all games with valid status IDs", "migration");

    // Re-add the foreign key constraint
    await db.execute(sql`
      ALTER TABLE games 
      ADD CONSTRAINT games_status_id_game_statuses_id_fk 
      FOREIGN KEY (status_id) REFERENCES game_statuses(id);
    `);

    log("Re-added foreign key constraint", "migration");

    // Verify the fix
    const gameCount = await db.execute(sql`
      SELECT COUNT(*) as count FROM games WHERE status_id IS NULL;
    `);

    if (gameCount.rows[0].count > 0) {
      throw new Error(`Still have ${gameCount.rows[0].count} games with NULL status_id`);
    }

    log("Game statuses constraint fix completed successfully!", "migration");
    return true;

  } catch (error) {
    log(`Error in game statuses constraint fix: ${error}`, "migration");
    return false;
  }
}
