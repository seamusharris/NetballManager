import { sql } from "drizzle-orm";
import { db } from "../db";

export async function addMultiClubSupport() {
  console.log("9:00:37 PM [migration] Starting multi-club support migration");

  try {
    // Create clubs table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS clubs (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        code TEXT NOT NULL UNIQUE,
        address TEXT,
        contact_email TEXT,
        contact_phone TEXT,
        logo_url TEXT,
        primary_color TEXT NOT NULL DEFAULT '#1f2937',
        secondary_color TEXT NOT NULL DEFAULT '#ffffff',
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    // Create teams table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        club_id INTEGER NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
        season_id INTEGER NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        division TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        UNIQUE(club_id, season_id, name)
      )
    `);

    // Create default club if none exists
    const existingClubs = await db.execute(sql`SELECT COUNT(*) as count FROM clubs`);
    const clubCount = existingClubs.rows[0]?.count || 0;

    if (clubCount === 0) {
      console.log("9:00:37 PM [migration] Creating default club");
      await db.execute(sql`
        INSERT INTO clubs (name, code, primary_color, secondary_color)
        VALUES ('Default Club', 'DEFAULT', '#1f2937', '#ffffff')
      `);
    }

    // Create default teams for each season if none exist
    const seasons = await db.execute(sql`SELECT id, name FROM seasons`);
    const defaultClub = await db.execute(sql`SELECT id FROM clubs WHERE code = 'DEFAULT' LIMIT 1`);
    const clubId = defaultClub.rows[0]?.id;

    if (clubId && seasons.rows.length > 0) {
      for (const season of seasons.rows) {
        // Check if team already exists for this season
        const existingTeam = await db.execute(sql`
          SELECT id FROM teams 
          WHERE club_id = ${clubId} AND season_id = ${season.id}
        `);

        if (existingTeam.rows.length === 0) {
          console.log(`9:00:37 PM [migration] Creating default team for season ${season.name}`);
          await db.execute(sql`
            INSERT INTO teams (club_id, season_id, name, division)
            VALUES (${clubId}, ${season.id}, 'Main Team', 'Division 1')
          `);
        }
      }
    }

    // Add team references to games table (nullable for backward compatibility)
    try {
      await db.execute(sql`
        ALTER TABLE games 
        ADD COLUMN home_team_id INTEGER REFERENCES teams(id),
        ADD COLUMN away_team_id INTEGER REFERENCES teams(id),
        ADD COLUMN is_inter_club BOOLEAN NOT NULL DEFAULT false
      `);
      console.log("9:00:37 PM [migration] Added team columns to games table");
    } catch (error) {
      if (error.message?.includes('already exists')) {
        console.log("9:00:37 PM [migration] Team columns already exist in games table");
      } else {
        throw error;
      }
    }

    console.log("9:00:37 PM [migration] Multi-club support migration completed successfully");
  } catch (error) {
    console.error("9:00:37 PM [migration] Error in multi-club support migration:", error);
    throw error;
  }
}