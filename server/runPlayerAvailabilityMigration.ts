
import { createPlayerAvailabilityTable } from "./migrations/createPlayerAvailabilityTable";

async function runMigration() {
  console.log("Running player availability table migration...");
  
  try {
    const success = await createPlayerAvailabilityTable();
    
    if (success) {
      console.log("✅ Player availability table migration completed successfully");
    } else {
      console.log("❌ Player availability table migration failed");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Migration error:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

runMigration();
