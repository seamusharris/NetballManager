
/**
 * Migration to update forfeit status columns and clean up legacy statuses
 * This will:
 * 1. Rename team_goals and opponent_goals to home_team_goals and away_team_goals
 * 2. Update existing forfeit statuses to use new column names
 * 3. Delete legacy forfeit-win and forfeit-loss statuses
 */

import { db } from '../db';
import { sql } from 'drizzle-orm';
import { log } from '../vite';

export async function updateForfeitStatusColumns(): Promise<boolean> {
  try {
    log("Starting forfeit status columns update migration", "migration");

    // Check if new columns already exist
    const homeTeamGoalsExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'game_statuses'
        AND column_name = 'home_team_goals'
      );
    `);

    if (!homeTeamGoalsExists.rows[0].exists) {
      // Add new columns
      await db.execute(sql`
        ALTER TABLE game_statuses 
        ADD COLUMN home_team_goals INTEGER,
        ADD COLUMN away_team_goals INTEGER;
      `);
      log("Added home_team_goals and away_team_goals columns", "migration");

      // Copy data from old columns if they exist
      const teamGoalsExists = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public'
          AND table_name = 'game_statuses'
          AND column_name = 'team_goals'
        );
      `);

      if (teamGoalsExists.rows[0].exists) {
        await db.execute(sql`
          UPDATE game_statuses 
          SET home_team_goals = team_goals, away_team_goals = opponent_goals
          WHERE team_goals IS NOT NULL OR opponent_goals IS NOT NULL;
        `);
        log("Copied data from old columns to new columns", "migration");

        // Drop old columns
        await db.execute(sql`
          ALTER TABLE game_statuses 
          DROP COLUMN IF EXISTS team_goals,
          DROP COLUMN IF EXISTS opponent_goals;
        `);
        log("Removed old team_goals and opponent_goals columns", "migration");
      }
    } else {
      log("New forfeit columns already exist", "migration");
    }

    // Update the forfeit statuses to use correct home/away scores
    await db.execute(sql`
      UPDATE game_statuses 
      SET home_team_goals = 0, away_team_goals = 10
      WHERE name = 'home-team-forfeit';
    `);

    await db.execute(sql`
      UPDATE game_statuses 
      SET home_team_goals = 10, away_team_goals = 0
      WHERE name = 'away-team-forfeit';
    `);
    log("Updated forfeit statuses with correct home/away scores", "migration");

    // Delete legacy forfeit statuses (forfeit-win and forfeit-loss)
    const deletedWin = await db.execute(sql`
      DELETE FROM game_statuses WHERE name = 'forfeit-win' RETURNING id;
    `);

    const deletedLoss = await db.execute(sql`
      DELETE FROM game_statuses WHERE name = 'forfeit-loss' RETURNING id;
    `);

    if (deletedWin.rows.length > 0) {
      log(`Deleted forfeit-win status (ID: ${deletedWin.rows[0].id})`, "migration");
    }

    if (deletedLoss.rows.length > 0) {
      log(`Deleted forfeit-loss status (ID: ${deletedLoss.rows[0].id})`, "migration");
    }

    log("Forfeit status columns update migration completed successfully", "migration");
    return true;

  } catch (error: any) {
    log(`Error in forfeit status columns update migration: ${error.message}`, "migration");
    return false;
  }
}
