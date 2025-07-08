
/**
 * Script to run the forfeit tracking migration
 */

import { addProperForfeitTracking } from './migrations/addProperForfeitTracking';

async function main() {
  console.log('Starting forfeit tracking migration...');
  
  try {
    const success = await addProperForfeitTracking();
    
    if (success) {
      console.log('✅ Forfeit tracking migration completed successfully');
    } else {
      console.log('❌ Forfeit tracking migration failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

main();
