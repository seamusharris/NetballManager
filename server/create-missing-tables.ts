import { sql } from "drizzle-orm";
import { db } from "./db";

async function createMissingTables() {
  console.log("Creating missing tables...");

  try {
    // Create age_groups table
    console.log("Creating age_groups table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS age_groups (
        id SERIAL PRIMARY KEY,
        name VARCHAR(10) NOT NULL UNIQUE,
        display_name VARCHAR(20) NOT NULL,
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create divisions table
    console.log("Creating divisions table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS divisions (
        id SERIAL PRIMARY KEY,
        season_id INTEGER NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
        age_group_id INTEGER NOT NULL REFERENCES age_groups(id) ON DELETE CASCADE,
        display_name VARCHAR(50) NOT NULL,
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(season_id, age_group_id)
      );
    `);

    console.log("Tables created successfully!");

  } catch (error) {
    console.error("Error creating tables:", error);
  }
}

// Run the creation
createMissingTables()
  .then(() => {
    console.log("Script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  }); 