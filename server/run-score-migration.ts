
/**
 * Script to run the score columns migration
 */

import { addScoreColumnsToGameStatuses } from './migrations/addScoreColumnsToGameStatuses';

async function main() {
  console.log('Running score columns migration...');
  
  try {
    const success = await addScoreColumnsToGameStatuses();
    
    if (success) {
      console.log('✅ Score columns migration completed successfully');
    } else {
      console.log('❌ Score columns migration failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

main();
