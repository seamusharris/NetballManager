/**
 * Migration to add score columns to game_statuses table
 * This will allow game statuses to define fixed scores for games that don't use statistics
 */

import { db } from '../db';
import { sql } from 'drizzle-orm';
import { log } from '../vite';

export async function addScoreColumnsToGameStatuses(): Promise<boolean> {
  try {
    log("Starting migration to add score columns to game_statuses table", "migration");

    // Check if columns already exist
    const teamGoalsExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'game_statuses'
        AND column_name = 'team_goals'
      );
    `);

    if (teamGoalsExists.rows[0].exists) {
      log("Score columns already exist in game_statuses table", "migration");
      return true;
    }

    // Add the new columns
    await db.execute(sql`
      ALTER TABLE game_statuses 
      ADD COLUMN team_goals INTEGER,
      ADD COLUMN opponent_goals INTEGER;
    `);

    log("Added team_goals and opponent_goals columns to game_statuses", "migration");

    // Update forfeit statuses to include fixed scores
    // forfeit-win: when the home team wins by forfeit (away team forfeited)
    await db.execute(sql`
      UPDATE game_statuses 
      SET team_goals = 10, opponent_goals = 0,
          display_name = 'Forfeit Win (Opponent Forfeited)'
      WHERE name = 'forfeit-win'
    `);

    // forfeit-loss: when the home team loses by forfeit (home team forfeited)  
    await db.execute(sql`
      UPDATE game_statuses 
      SET team_goals = 0, opponent_goals = 10,
          display_name = 'Forfeit Loss (Team Forfeited)'
      WHERE name = 'forfeit-loss'
    `);

    log("Updated forfeit statuses with fixed scores and clarified descriptions", "migration");

    // BYE and abandoned games keep NULL scores (no fixed score)
    log("Completed score columns migration for game_statuses", "migration");
    return true;

  } catch (error) {
    log(`Error in addScoreColumnsToGameStatuses migration: ${error}`, "migration");
    return false;
  }
}