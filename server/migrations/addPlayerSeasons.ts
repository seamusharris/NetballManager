import { db } from "../db";
import { sql } from "drizzle-orm";
import { seasons } from "@shared/schema";

/**
 * Migration to add player_seasons table and link existing players to the active season
 */
export async function addPlayerSeasonsTable() {
  console.log("Starting player-seasons migration...");

  try {
    // Check if player_seasons table already exists
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'player_seasons'
      );
    `);

    if (tableExists.rows[0].exists) {
      console.log("Player seasons table already exists, skipping creation...");
    } else {
      // Create the player_seasons table
      await db.execute(sql`
        CREATE TABLE player_seasons (
          id SERIAL PRIMARY KEY,
          player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
          season_id INTEGER NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
          UNIQUE(player_id, season_id)
        );
      `);
      console.log("Created player_seasons table");

      // Get the active season
      const [activeSeason] = await db.select().from(seasons).where(sql`is_active = true`);
      
      if (activeSeason) {
        // Add all existing players to the active season
        await db.execute(sql`
          INSERT INTO player_seasons (player_id, season_id)
          SELECT id, ${activeSeason.id} FROM players;
        `);
        console.log(`Linked ${activeSeason.name} season to all existing players`);
      } else {
        console.log("No active season found, players will need to be linked manually");
      }
    }

    console.log("Player-seasons migration completed successfully!");
    return true;
  } catch (error) {
    console.error("Error in player-seasons migration:", error);
    throw error;
  }
}

/**
 * Run the migration
 */
export async function runPlayerSeasonsMigration() {
  try {
    await addPlayerSeasonsTable();
    console.log("Player-seasons migration completed successfully!");
  } catch (error) {
    console.error("Error running player-seasons migration:", error);
    process.exit(1);
  }
}

// Allow running directly from command line
if (require.main === module) {
  runPlayerSeasonsMigration();
}