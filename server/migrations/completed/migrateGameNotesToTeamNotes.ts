
/**
 * Migration to transfer existing game notes to team-specific notes
 * This migrates notes from the single-team system to the new team-based notes system
 */

import { db } from '../db';
import { sql } from 'drizzle-orm';
import { log } from '../vite';

export async function migrateGameNotesToTeamNotes(): Promise<boolean> {
  try {
    log("Starting migration of game notes to team_game_notes", "migration");

    // Check if team_game_notes table exists
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'team_game_notes'
      );
    `);

    if (!tableExists.rows[0].exists) {
      log("team_game_notes table does not exist, skipping migration", "migration");
      return false;
    }

    // Get all games that have notes and a home team
    const gamesWithNotes = await db.execute(sql`
      SELECT g.id, g.notes, g.home_team_id, ht.club_id as home_club_id
      FROM games g
      JOIN teams ht ON g.home_team_id = ht.id
      WHERE g.notes IS NOT NULL 
      AND g.notes != ''
      AND g.home_team_id IS NOT NULL
    `);

    log(`Found ${gamesWithNotes.rows.length} games with notes to migrate`, "migration");

    let migrated = 0;
    for (const game of gamesWithNotes.rows) {
      try {
        // Check if team notes already exist for this game/team combo
        const existingNotes = await db.execute(sql`
          SELECT id FROM team_game_notes 
          WHERE game_id = ${game.id} AND team_id = ${game.home_team_id}
        `);

        if (existingNotes.rows.length === 0) {
          // Insert the game notes as team-specific notes for the home team
          await db.execute(sql`
            INSERT INTO team_game_notes (game_id, team_id, notes, created_at, updated_at)
            VALUES (${game.id}, ${game.home_team_id}, ${game.notes}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `);
          migrated++;
        } else {
          log(`Team notes already exist for game ${game.id}, skipping`, "migration");
        }
      } catch (error) {
        log(`Error migrating notes for game ${game.id}: ${error}`, "migration");
      }
    }

    log(`Successfully migrated ${migrated} game notes to team_game_notes`, "migration");

    // Optional: Clear the original notes field after successful migration
    // Uncomment the lines below if you want to clear the original notes
    /*
    if (migrated > 0) {
      await db.execute(sql`
        UPDATE games 
        SET notes = NULL 
        WHERE notes IS NOT NULL 
        AND notes != ''
        AND home_team_id IS NOT NULL
      `);
      log(`Cleared original notes from ${migrated} games`, "migration");
    }
    */

    log("Completed game notes to team notes migration", "migration");
    return true;

  } catch (error) {
    log(`Error in game notes migration: ${error}`, "migration");
    return false;
  }
}
