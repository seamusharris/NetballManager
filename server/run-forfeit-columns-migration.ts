
/**
 * Script to run the forfeit columns update migration
 */

import { db, pool } from './db';
import { updateForfeitStatusColumns } from './migrations/updateForfeitStatusColumns';

async function main() {
  console.log('Starting forfeit columns update migration...');
  
  try {
    const success = await updateForfeitStatusColumns();
    
    if (success) {
      console.log('✅ Forfeit columns update migration completed successfully');
    } else {
      console.log('❌ Forfeit columns update migration failed');
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

main().catch(console.error);
