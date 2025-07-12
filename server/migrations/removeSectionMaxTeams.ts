
import { sql } from "drizzle-orm";
import { db } from "../db";

export async function removeSectionMaxTeams() {
  console.log("Removing max_teams column from sections table...");
  
  // Remove max_teams column from sections table
  await db.execute(sql`
    ALTER TABLE sections 
    DROP COLUMN IF EXISTS max_teams
  `);

  console.log("max_teams column removed from sections table successfully");
}

// ES module equivalent of require.main === module check
if (import.meta.url === `file://${process.argv[1]}`) {
  removeSectionMaxTeams()
    .then(() => {
      console.log("Migration completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}
