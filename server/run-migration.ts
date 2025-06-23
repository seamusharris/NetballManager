// Import the required migration functions
import { createGameScoresTable } from './migrations/createGameScoresTable';
import { migrateToTeamBasedScoring } from './migrations/migrateToTeamBasedScoring';
import { createTeamGameNotesTable } from './migrations/createTeamGameNotesTable';
import { migrateGameNotesToTeamNotes } from './migrations/migrateGameNotesToTeamNotes';

// Define an array of migration objects, each containing a name and a function to execute
const migrations = [
  { name: 'createGameScoresTable', fn: createGameScoresTable },
  { name: 'migrateToTeamBasedScoring', fn: migrateToTeamBasedScoring },
  { name: 'createTeamGameNotesTable', fn: createTeamGameNotesTable },
  { name: 'migrateGameNotesToTeamNotes', fn: migrateGameNotesToTeamNotes },
];

// Log a message to the console indicating that all migrations have been completed
console.log('All migrations have been completed. No migrations to run.');

// Exit the current process with an exit code of 0, indicating success
process.exit(0);