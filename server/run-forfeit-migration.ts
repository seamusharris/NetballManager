
import { db, pool } from './db';
import { gameStatuses } from '@shared/schema';
import { sql } from 'drizzle-orm';

async function addProperForfeitTracking(): Promise<boolean> {
  try {
    console.log("Adding team-specific forfeit tracking");

    // Check if statuses already exist
    const existingStatuses = await db.execute(sql`
      SELECT name FROM game_statuses 
      WHERE name IN ('home-team-forfeit', 'away-team-forfeit')
    `);

    if (existingStatuses.rows.length > 0) {
      console.log("Forfeit statuses already exist, skipping migration");
      return true;
    }

    // Add new forfeit statuses
    const newStatuses = [
      {
        name: 'home-team-forfeit',
        displayName: 'Home Team Forfeit',
        points: 0,
        opponentPoints: 4,
        teamGoals: 0,
        opponentGoals: 10,
        isCompleted: true,
        allowsStatistics: false,
        requiresOpponent: true,
        colorClass: 'bg-red-600',
        sortOrder: 8,
        isActive: true
      },
      {
        name: 'away-team-forfeit', 
        displayName: 'Away Team Forfeit',
        points: 4,
        opponentPoints: 0,
        teamGoals: 10,
        opponentGoals: 0,
        isCompleted: true,
        allowsStatistics: false,
        requiresOpponent: true,
        colorClass: 'bg-green-600',
        sortOrder: 9,
        isActive: true
      }
    ];

    // Insert statuses
    for (const status of newStatuses) {
      await db.insert(gameStatuses).values(status);
      console.log(`Added ${status.name} status`);
    }

    console.log("Forfeit tracking migration completed successfully");
    return true;

  } catch (error: any) {
    console.error(`Error in forfeit tracking migration: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('Starting forfeit tracking migration...');
  
  try {
    const success = await addProperForfeitTracking();
    
    if (success) {
      console.log('✅ Forfeit tracking migration completed successfully');
    } else {
      console.log('❌ Forfeit tracking migration failed');
    }
  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    // Properly close the database connection
    try {
      await pool.end();
      console.log('Database connection closed');
    } catch (closeError) {
      console.warn('Warning: Error closing database connection:', closeError);
    }
    // Force exit the process
    process.exit(0);
  }
}

main();
