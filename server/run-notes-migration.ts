
/**
 * Standalone script to run the game notes to team notes migration
 */

import { migrateGameNotesToTeamNotes } from './migrations/migrateGameNotesToTeamNotes';

async function runNotesMigration() {
  console.log('Starting game notes migration...');
  
  try {
    const success = await migrateGameNotesToTeamNotes();
    
    if (success) {
      console.log('✅ Game notes migration completed successfully');
    } else {
      console.log('❌ Game notes migration failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

runNotesMigration();
