/**
 * Migration to enforce unique constraint on game_stats table
 * This ensures we never have duplicate statistics for the same game/position/quarter
 */
import { db } from '../db';
import { sql } from 'drizzle-orm';

/**
 * This migration adds a unique constraint to the game_stats table for the 
 * combination of game_id, position, and quarter
 */
export async function addUniqueConstraintToGameStats() {
  try {
    console.log('Starting migration: Add unique constraint to game_stats table');
    
    // First, identify any duplicate rows and keep only the latest one
    await db.execute(sql`
      DELETE FROM game_stats 
      WHERE id NOT IN (
        SELECT MAX(id) 
        FROM game_stats 
        GROUP BY game_id, position, quarter
      )
    `);
    
    console.log('Removed duplicate statistics entries');
    
    // Then add the unique constraint
    await db.execute(sql`
      ALTER TABLE game_stats 
      ADD CONSTRAINT position_quarter_unique 
      UNIQUE (game_id, position, quarter)
    `);
    
    console.log('Successfully added unique constraint to game_stats table');
    return true;
  } catch (error) {
    console.error('Failed to add unique constraint to game_stats table:', error);
    return false;
  }
}

/**
 * Run the migration
 */
export async function runAddUniqueConstraintMigration() {
  try {
    const result = await addUniqueConstraintToGameStats();
    if (result) {
      console.log('Migration completed successfully');
    } else {
      console.log('Migration failed');
    }
  } catch (error) {
    console.error('Error running migration:', error);
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  runAddUniqueConstraintMigration()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration failed with error:', err);
      process.exit(1);
    });
}