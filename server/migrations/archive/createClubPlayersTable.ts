
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { log } from '../vite';

/**
 * Create club_players table for direct club-player relationships
 * This allows players to belong to multiple clubs simultaneously
 */
export async function createClubPlayersTable(): Promise<void> {
  try {
    log("Starting club_players table creation", "migration");

    // Check if table already exists
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'club_players'
      );
    `);

    if (tableExists.rows[0].exists) {
      log("club_players table already exists, skipping creation", "migration");
      return;
    }

    // Create the club_players table
    await db.execute(sql`
      CREATE TABLE club_players (
        id SERIAL PRIMARY KEY,
        club_id INTEGER NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
        player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
        joined_date DATE DEFAULT CURRENT_DATE,
        left_date DATE NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        UNIQUE(club_id, player_id)
      )
    `);

    log("Created club_players table successfully", "migration");

    // Create indexes for better query performance
    await db.execute(sql`
      CREATE INDEX idx_club_players_club_id ON club_players(club_id);
    `);
    
    await db.execute(sql`
      CREATE INDEX idx_club_players_player_id ON club_players(player_id);
    `);
    
    await db.execute(sql`
      CREATE INDEX idx_club_players_active ON club_players(is_active);
    `);

    log("Created indexes for club_players table", "migration");

    log("club_players table creation completed successfully", "migration");
  } catch (error) {
    log(`Error creating club_players table: ${error}`, "migration");
    throw error;
  }
}
