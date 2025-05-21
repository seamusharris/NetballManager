/**
 * Migration to add status field to games table and populate with appropriate values
 * based on the existing completed field
 */
import { db } from "../db";
import { games } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

/**
 * Add status field to games table and populate it based on existing completed field
 * - If completed is true, set status to "completed"
 * - If completed is false, set status to "upcoming"
 */
export async function addGameStatusField() {
  console.log("Starting migration: Adding status field to games table");
  
  try {
    // First check if the column already exists to avoid errors
    const checkColumnExists = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'games' AND column_name = 'status'
    `);
    
    // If column doesn't exist, add it
    if ((checkColumnExists as any).length === 0) {
      console.log("Adding status column to games table");
      
      // Add the column with 'upcoming' as default
      await db.execute(sql`
        ALTER TABLE games 
        ADD COLUMN status TEXT DEFAULT 'upcoming'
      `);
      
      // Update all completed games to have status "completed"
      await db.execute(sql`
        UPDATE games 
        SET status = 'completed' 
        WHERE completed = true
      `);
      
      console.log("Migration complete: status field added to games table");
    } else {
      console.log("Status column already exists, skipping migration");
    }
  } catch (error) {
    console.error("Error during migration:", error);
    throw error;
  }
}

/**
 * Run the migration
 */
export async function runAddGameStatusMigration() {
  await addGameStatusField();
}