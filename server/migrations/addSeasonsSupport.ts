/**
 * Migration to add seasons support to the application
 * This will:
 * 1. Create the seasons table
 * 2. Create a default season
 * 3. Add seasonId to the games table
 * 4. Update all existing games to use the default season
 */

import { db } from '../db';
import { seasons, games } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * Add the seasons table and update games to support seasons
 */
export async function addSeasonsSupport() {
  console.log('Starting seasons migration...');

  try {
    // Check if seasons table exists
    const checkSeasonsTable = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'seasons'
      );
    `);
    
    const seasonsTableExists = checkSeasonsTable.rows[0].exists;
    
    if (!seasonsTableExists) {
      console.log('Creating seasons table...');
      
      // Create seasons table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "seasons" (
          "id" SERIAL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "start_date" DATE NOT NULL,
          "end_date" DATE NOT NULL,
          "is_active" BOOLEAN NOT NULL DEFAULT false,
          "type" TEXT,
          "year" INTEGER NOT NULL,
          "display_order" INTEGER NOT NULL DEFAULT 0
        );
      `);
    } else {
      console.log('Seasons table already exists, skipping creation...');
    }
    
    // Check if season_id column exists in games table
    const checkSeasonIdColumn = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'games' AND column_name = 'season_id'
      );
    `);
    
    const seasonIdExists = checkSeasonIdColumn.rows[0].exists;
    
    if (!seasonIdExists) {
      console.log('Adding season_id column to games table...');
      
      // Add season_id column to games table
      await db.execute(sql`
        ALTER TABLE "games" ADD COLUMN "season_id" INTEGER;
      `);
      
      // Add foreign key constraint
      await db.execute(sql`
        ALTER TABLE "games" 
        ADD CONSTRAINT "games_season_id_fkey" 
        FOREIGN KEY ("season_id") REFERENCES "seasons"("id");
      `);
    } else {
      console.log('Season_id column already exists in games table, skipping...');
    }
    
    // Create default season if none exists
    const existingSeasons = await db.select().from(seasons);
    
    if (existingSeasons.length === 0) {
      console.log('Creating default season...');
      
      // Create a default season for 2025
      const [defaultSeason] = await db.insert(seasons).values({
        name: 'Season 2025',
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        isActive: true,
        type: 'Default',
        year: 2025,
        displayOrder: 0
      }).returning();
      
      console.log(`Created default season: ${defaultSeason.name} (ID: ${defaultSeason.id})`);
      
      // Update all existing games to use this season
      await db.update(games)
        .set({ seasonId: defaultSeason.id })
        .where(sql`true`);
        
      console.log('Updated all existing games to use the default season');
    } else {
      console.log(`Found ${existingSeasons.length} existing seasons, skipping default season creation...`);
      
      // Make sure at least one season is active
      const activeSeasons = existingSeasons.filter(s => s.isActive);
      
      if (activeSeasons.length === 0 && existingSeasons.length > 0) {
        console.log('No active season found, setting the first season as active...');
        await db.update(seasons)
          .set({ isActive: true })
          .where(eq(seasons.id, existingSeasons[0].id));
      }
    }
    
    console.log('Seasons migration completed successfully!');
    return true;
  } catch (error) {
    console.error('Error during seasons migration:', error);
    return false;
  }
}

/**
 * Run the migration
 */
export async function runAddSeasonsMigration() {
  const success = await addSeasonsSupport();
  
  if (success) {
    console.log('Successfully added seasons support!');
  } else {
    console.error('Failed to add seasons support.');
  }
  
  return success;
}