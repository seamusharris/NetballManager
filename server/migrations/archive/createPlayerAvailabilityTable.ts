
import { db } from "../db";
import { sql } from "drizzle-orm";

/**
 * Migration to create the player_availability table for storing which players are available for each game
 */
export async function createPlayerAvailabilityTable(): Promise<boolean> {
  try {
    console.log("Starting player_availability table creation migration");

    // Check if the table already exists
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'player_availability'
      );
    `);

    if (tableExists.rows[0].exists) {
      console.log("player_availability table already exists, skipping creation");
      return true;
    }

    // Create the player_availability table
    await db.execute(sql`
      CREATE TABLE player_availability (
        id SERIAL PRIMARY KEY,
        game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
        player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
        is_available BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(game_id, player_id)
      );
    `);

    console.log("Created player_availability table");

    // Create indexes for performance
    await db.execute(sql`
      CREATE INDEX idx_player_availability_game_id ON player_availability(game_id);
    `);
    await db.execute(sql`
      CREATE INDEX idx_player_availability_player_id ON player_availability(player_id);
    `);

    console.log("Created indexes on player_availability table");

    console.log("Completed player_availability table migration");
    return true;
  } catch (error) {
    console.error(`Error in player_availability migration: ${error}`);
    return false;
  }
}
