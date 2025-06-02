
import { db } from './db';
import { sql } from 'drizzle-orm';
import { log } from './vite';

/**
 * Ensures BYE teams exist for all clubs and seasons
 */
export async function ensureByeTeamsExist(): Promise<void> {
  try {
    log("Ensuring BYE teams exist for all clubs and seasons", "bye-teams");

    // Get all active clubs
    const clubs = await db.execute(sql`
      SELECT id, name FROM clubs WHERE is_active = true
    `);

    // Get all seasons (both active and inactive, as we might need teams for historical data)
    const seasons = await db.execute(sql`
      SELECT id, name FROM seasons
    `);

    for (const club of clubs.rows) {
      for (const season of seasons.rows) {
        // Check if BYE team already exists
        const existingByeTeam = await db.execute(sql`
          SELECT id FROM teams 
          WHERE club_id = ${club.id} 
          AND season_id = ${season.id} 
          AND name = 'Bye'
        `);

        if (existingByeTeam.rows.length === 0) {
          // Create BYE team
          await db.execute(sql`
            INSERT INTO teams (club_id, season_id, name, division, is_active)
            VALUES (${club.id}, ${season.id}, 'Bye', 'Bye', true)
          `);
          log(`Created BYE team for club ${club.name} in season ${season.name}`, "bye-teams");
        }
      }
    }

    log("BYE team check completed", "bye-teams");
  } catch (error) {
    console.error("Error ensuring BYE teams exist:", error);
    throw error;
  }
}

/**
 * Creates BYE teams for a specific club across all seasons
 */
export async function createByeTeamsForClub(clubId: number): Promise<void> {
  try {
    log(`Creating BYE teams for club ${clubId}`, "bye-teams");

    const seasons = await db.execute(sql`
      SELECT id, name FROM seasons
    `);

    for (const season of seasons.rows) {
      // Check if BYE team already exists
      const existingByeTeam = await db.execute(sql`
        SELECT id FROM teams 
        WHERE club_id = ${clubId} 
        AND season_id = ${season.id} 
        AND name = 'Bye'
      `);

      if (existingByeTeam.rows.length === 0) {
        // Create BYE team
        await db.execute(sql`
          INSERT INTO teams (club_id, season_id, name, division, is_active)
          VALUES (${clubId}, ${season.id}, 'Bye', 'Bye', true)
        `);
        log(`Created BYE team for club ${clubId} in season ${season.name}`, "bye-teams");
      }
    }
  } catch (error) {
    console.error(`Error creating BYE teams for club ${clubId}:`, error);
    throw error;
  }
}

/**
 * Creates BYE teams for a specific season across all clubs
 */
export async function createByeTeamsForSeason(seasonId: number): Promise<void> {
  try {
    log(`Creating BYE teams for season ${seasonId}`, "bye-teams");

    const clubs = await db.execute(sql`
      SELECT id, name FROM clubs WHERE is_active = true
    `);

    for (const club of clubs.rows) {
      // Check if BYE team already exists
      const existingByeTeam = await db.execute(sql`
        SELECT id FROM teams 
        WHERE club_id = ${club.id} 
        AND season_id = ${seasonId} 
        AND name = 'Bye'
      `);

      if (existingByeTeam.rows.length === 0) {
        // Create BYE team
        await db.execute(sql`
          INSERT INTO teams (club_id, season_id, name, division, is_active)
          VALUES (${club.id}, ${seasonId}, 'Bye', 'Bye', true)
        `);
        log(`Created BYE team for club ${club.name} in season ${seasonId}`, "bye-teams");
      }
    }
  } catch (error) {
    console.error(`Error creating BYE teams for season ${seasonId}:`, error);
    throw error;
  }
}

/**
 * Checks if a team is a BYE team
 */
export async function isByeTeam(teamId: number): Promise<boolean> {
  try {
    const result = await db.execute(sql`
      SELECT name FROM teams WHERE id = ${teamId}
    `);
    
    return result.rows.length > 0 && result.rows[0].name === 'Bye';
  } catch (error) {
    console.error("Error checking if team is BYE team:", error);
    return false;
  }
}
