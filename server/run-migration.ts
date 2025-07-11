// Import the required migration functions
import { createGameScoresTable } from './migrations/createGameScoresTable';
import { migrateToTeamBasedScoring } from './migrations/migrateToTeamBasedScoring';
import { createTeamGameNotesTable } from './migrations/createTeamGameNotesTable';
import { migrateGameNotesToTeamNotes } from './migrations/migrateGameNotesToTeamNotes';
import { addNewStatisticsColumns } from './migrations/addNewStatisticsColumns';
import { removeOldStatisticsColumns } from './migrations/removeOldStatisticsColumns';

// Define an array of migration objects, each containing a name and a function to execute
const migrations = [
  { name: 'createGameScoresTable', fn: createGameScoresTable },
  { name: 'migrateToTeamBasedScoring', fn: migrateToTeamBasedScoring },
  { name: 'createTeamGameNotesTable', fn: createTeamGameNotesTable },
  { name: 'migrateGameNotesToTeamNotes', fn: migrateGameNotesToTeamNotes },
  { name: 'addNewStatisticsColumns', fn: addNewStatisticsColumns },
  { name: 'removeOldStatisticsColumns', fn: removeOldStatisticsColumns },
];

// Run migrations function
async function runMigrations() {
  try {
    console.log('Starting migration process...');
    
    for (const migration of migrations) {
      console.log(`Running migration: ${migration.name}`);
      const success = await migration.fn();
      if (success) {
        console.log(`✅ ${migration.name} completed successfully`);
      } else {
        console.log(`❌ ${migration.name} failed`);
        process.exit(1);
      }
    }
    
    console.log('✅ All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration process failed:', error);
    process.exit(1);
  }
}

// Run the migrations
runMigrations();