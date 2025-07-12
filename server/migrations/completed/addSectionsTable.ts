
import { sql } from "drizzle-orm";
import { db } from "../db";

export async function addSectionsTable() {
  console.log("Creating sections table...");
  
  // Create sections table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS sections (
      id SERIAL PRIMARY KEY,
      season_id INTEGER NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
      age_group TEXT NOT NULL,
      section_name TEXT NOT NULL,
      display_name TEXT NOT NULL,
      description TEXT,
      max_teams INTEGER DEFAULT 8,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
      UNIQUE(season_id, age_group, section_name)
    )
  `);

  // Add section_id column to teams table
  await db.execute(sql`
    ALTER TABLE teams 
    ADD COLUMN IF NOT EXISTS section_id INTEGER REFERENCES sections(id) ON DELETE SET NULL
  `);

  console.log("Sections table and team section_id column added successfully");
}

// ES module equivalent of require.main === module check
if (import.meta.url === `file://${process.argv[1]}`) {
  addSectionsTable()
    .then(() => {
      console.log("Migration completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}
