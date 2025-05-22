import { runAddUniqueConstraintMigration } from './migrations/addUniqueConstraint';

/**
 * This script runs the migration to add a unique constraint to game_stats
 * It will deduplicate existing entries and add a unique constraint to prevent future duplicates
 */
runAddUniqueConstraintMigration()
  .then(() => {
    console.log('Migration completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });