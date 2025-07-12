
# Completed Migrations

This folder contains all database migrations that have been successfully executed and are no longer needed for new deployments.

## Migration History

### Core System Migrations
- `createGameScoresTable.ts` - Created the game_scores table for team-based scoring
- `migrateToTeamBasedScoring.ts` - Migrated from opponent-based to team-based scoring system
- `createTeamGameNotesTable.ts` - Created team_game_notes table for per-team game notes
- `migrateGameNotesToTeamNotes.ts` - Migrated existing game notes to team-specific notes
- `addNewStatisticsColumns.ts` - Added new statistics tracking columns
- `removeOldStatisticsColumns.ts` - Removed deprecated statistics columns
- `addSectionsTable.ts` - Added sections table for organizing teams
- `removeSectionMaxTeams.ts` - Removed max_teams column from sections table

## Notes

- These migrations should not be run again as they have already been applied to the database
- The main migration runner (`server/run-migration.ts`) has been updated to exclude these completed migrations
- For reference purposes, these files are preserved in this archive folder
