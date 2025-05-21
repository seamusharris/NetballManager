// Simple script to run the migration from the command line
import { runMigrateNullPositions } from './migrateNullPositions.js';

async function main() {
  try {
    console.log('Starting position migration...');
    const result = await runMigrateNullPositions();
    console.log('Migration completed', result);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();