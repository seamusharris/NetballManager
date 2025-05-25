import { db } from "../db";
import { playerSeasons } from "@shared/schema";
import { sql } from "drizzle-orm";
import { log } from "../vite";

/**
 * Add player_seasons junction table to support many-to-many relationship between players and seasons
 */
export async function addPlayerSeasonsTable() {
  try {
    log("Starting player_seasons table migration", "migration");

    // Check if the table already exists
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'player_seasons'
      );
    `);

    if (tableExists.rows[0].exists) {
      log("player_seasons table already exists, skipping creation", "migration");
    } else {
      // Create the player_seasons table
      await db.execute(sql`
        CREATE TABLE player_seasons (
          id SERIAL PRIMARY KEY,
          player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
          season_id INTEGER NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(player_id, season_id)
        );
      `);
      log("Created player_seasons table", "migration");

      // Create indexes for performance
      await db.execute(sql`
        CREATE INDEX idx_player_seasons_player_id ON player_seasons(player_id);
      `);
      await db.execute(sql`
        CREATE INDEX idx_player_seasons_season_id ON player_seasons(season_id);
      `);
      log("Created indexes on player_seasons table", "migration");
    }

    // Add any existing players to the active season if there is one
    const activeSeasonResult = await db.execute(sql`
      SELECT id FROM seasons WHERE is_active = true LIMIT 1;
    `);

    if (activeSeasonResult.rows.length > 0) {
      const activeSeason = activeSeasonResult.rows[0].id;
      
      // Get all players
      const playersResult = await db.execute(sql`SELECT id FROM players;`);
      const players = playersResult.rows;
      
      // For each player, add them to the active season if they're not already in it
      for (const player of players) {
        const existingMapping = await db.execute(sql`
          SELECT id FROM player_seasons 
          WHERE player_id = ${player.id} AND season_id = ${activeSeason};
        `);
        
        if (existingMapping.rows.length === 0) {
          await db.execute(sql`
            INSERT INTO player_seasons (player_id, season_id)
            VALUES (${player.id}, ${activeSeason});
          `);
          log(`Added player ${player.id} to active season ${activeSeason}`, "migration");
        }
      }
    }

    log("Completed player_seasons table migration", "migration");
    return true;
  } catch (error) {
    log(`Error in player_seasons migration: ${error}`, "migration");
    console.error("Migration error:", error);
    return false;
  }
}