
import { removeOpponentSystem } from './migrations/removeOpponentSystem';

async function runMigration() {
  try {
    console.log('Starting opponent system removal migration...');
    await removeOpponentSystem();
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
