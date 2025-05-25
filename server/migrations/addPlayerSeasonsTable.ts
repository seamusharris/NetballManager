/**
 * Migration to create the player_seasons table
 * This resolves the error where player-season relationships cannot be created
 */

import { db } from '../db';
import { sql } from 'drizzle-orm';
import { log } from '../vite';

export async function addPlayerSeasonsTable() {
  log("Starting player_seasons table migration...", "migration");
  
  try {
    // Check if table already exists
    const tableCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'player_seasons'
      );
    `);
    
    const tableExists = tableCheck.rows && tableCheck.rows[0] && tableCheck.rows[0].exists === true;
    
    if (tableExists) {
      log("player_seasons table already exists, skipping creation...", "migration");
      return true;
    }
    
    // Create the player_seasons junction table
    await db.execute(sql`
      CREATE TABLE player_seasons (
        player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
        season_id INTEGER NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
        PRIMARY KEY (player_id, season_id)
      );
    `);
    
    log("Successfully created player_seasons table!", "migration");
    return true;
  } catch (error) {
    log(`Failed to create player_seasons table: ${error}`, "migration-error");
    console.error('Failed to create player_seasons table:', error);
    return false;
  }
}