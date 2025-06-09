/**
 * Script to execute the bye migration
 */

import { removeOpponentSystem } from './migrations/removeOpponentSystem';

async function main() {
  try {
    console.log('Starting bye migration...');
    await removeOpponentSystem();
    console.log('Bye migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();