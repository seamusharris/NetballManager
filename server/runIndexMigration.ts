import { runAddQueryIndexesMigration } from "./migrations/addQueryIndexes";
import { log } from "./vite";

/**
 * Script to run the database index migration
 */
async function main() {
  try {
    log("Starting index migration", "migration");
    await runAddQueryIndexesMigration();
    log("Index migration completed successfully", "migration");
    process.exit(0);
  } catch (error) {
    log(`Index migration failed: ${error}`, "migration-error");
    process.exit(1);
  }
}

// Run the migration
main();