import { up } from './server/migrations/2025-07-13-add-division-id-to-teams-and-fix-division-schema.ts';

async function runMigration() {
  try {
    console.log('Running migration to add division_id to teams...');
    await up();
    console.log('✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

runMigration(); 