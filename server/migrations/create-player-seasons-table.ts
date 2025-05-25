/**
 * Migration to create the player_seasons table
 * This resolves the error where player-season relationships cannot be created
 */

import { db } from '../db';
import { sql } from 'drizzle-orm';

export async function createPlayerSeasonsTable() {
  console.log('Starting player_seasons table migration...');
  
  try {
    // Check if table already exists
    const tableCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'player_seasons'
      );
    `);
    
    const tableExists = tableCheck.rows?.[0]?.exists === true;
    
    if (tableExists) {
      console.log('player_seasons table already exists, skipping creation...');
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
    
    console.log('Successfully created player_seasons table!');
    return true;
  } catch (error) {
    console.error('Failed to create player_seasons table:', error);
    return false;
  }
}