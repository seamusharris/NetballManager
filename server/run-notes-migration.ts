
/**
 * Standalone script to run the game notes to team notes migration
 */

import { createTeamGameNotesTable } from './migrations/createTeamGameNotesTable';
import { migrateGameNotesToTeamNotes } from './migrations/migrateGameNotesToTeamNotes';

async function runNotesMigration() {
  console.log('Starting game notes migration...');
  
  try {
    // First, ensure the team_game_notes table exists
    console.log('Step 1: Creating team_game_notes table...');
    const tableCreated = await createTeamGameNotesTable();
    
    if (!tableCreated) {
      console.log('❌ Failed to create team_game_notes table');
      process.exit(1);
    }
    
    console.log('✅ team_game_notes table ready');
    
    // Then, migrate the existing game notes
    console.log('Step 2: Migrating existing game notes...');
    const migrationSuccess = await migrateGameNotesToTeamNotes();
    
    if (migrationSuccess) {
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
