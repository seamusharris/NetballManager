
/**
 * Migration to remove legacy columns from games table
 * This will remove the isBye and completed columns since we now use the game_statuses system
 */

import { db } from '../db';
import { sql } from 'drizzle-orm';
import { log } from '../vite';

export async function cleanupLegacyGameColumns(): Promise<boolean> {
  try {
    log("Starting cleanup of legacy game columns", "migration");

    // Check if isBye column exists
    const isByeExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'games'
        AND column_name = 'is_bye'
      );
    `);

    if (isByeExists.rows[0].exists) {
      await db.execute(sql`ALTER TABLE games DROP COLUMN is_bye;`);
      log("Removed is_bye column from games table", "migration");
    } else {
      log("is_bye column already removed", "migration");
    }

    // Check if completed column exists
    const completedExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'games'
        AND column_name = 'completed'
      );
    `);

    if (completedExists.rows[0].exists) {
      await db.execute(sql`ALTER TABLE games DROP COLUMN completed;`);
      log("Removed completed column from games table", "migration");
    } else {
      log("completed column already removed", "migration");
    }

    // Check if legacy status column exists (text-based status)
    const statusExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'games'
        AND column_name = 'status'
      );
    `);

    if (statusExists.rows[0].exists) {
      await db.execute(sql`ALTER TABLE games DROP COLUMN status;`);
      log("Removed legacy status column from games table", "migration");
    } else {
      log("Legacy status column already removed", "migration");
    }

    log("Completed cleanup of legacy game columns", "migration");
    return true;

  } catch (error) {
    log(`Error in legacy columns cleanup: ${error}`, "migration");
    return false;
  }
}
