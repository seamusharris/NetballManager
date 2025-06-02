
/**
 * Migration to remove the opponent system and use BYE teams for each club
 * This migration creates a special "BYE" team for each club to handle BYE games
 */

import { db } from '../db';
import { sql } from 'drizzle-orm';
import { log } from '../vite';

export async function removeOpponentSystem(): Promise<void> {
  try {
    log("Starting migration to remove opponent system", "migration");

    // Step 1: Create BYE teams for each club that doesn't already have one
    log("Creating BYE teams for each club...", "migration");
    
    const clubs = await db.execute(sql`
      SELECT id, name, code FROM clubs WHERE is_active = true
    `);

    for (const club of clubs.rows) {
      // Check if BYE team already exists for this club
      const existingByeTeam = await db.execute(sql`
        SELECT id FROM teams 
        WHERE club_id = ${club.id} AND name = 'BYE'
      `);

      if (existingByeTeam.rows.length === 0) {
        // Create BYE team for each active season
        const activeSeasons = await db.execute(sql`
          SELECT id, name FROM seasons WHERE is_active = true
        `);

        for (const season of activeSeasons.rows) {
          await db.execute(sql`
            INSERT INTO teams (club_id, season_id, name, division, is_active)
            VALUES (${club.id}, ${season.id}, 'BYE', 'BYE', true)
            ON CONFLICT (club_id, season_id, name) DO NOTHING
          `);
          log(`Created BYE team for club ${club.name} in season ${season.name}`, "migration");
        }
      }
    }

    // Step 2: Convert existing games that use opponents to use BYE teams where appropriate
    log("Converting opponent-based games to team-based games...", "migration");

    // Handle games that are currently BYE games (status = 'bye' or isBye = true)
    const byeGames = await db.execute(sql`
      SELECT g.id, g.home_team_id, g.season_id, ht.club_id as home_club_id
      FROM games g
      LEFT JOIN teams ht ON g.home_team_id = ht.id
      WHERE (g.status_id = (SELECT id FROM game_statuses WHERE name = 'bye') OR g.opponent_id IS NULL)
      AND g.away_team_id IS NULL
    `);

    for (const game of byeGames.rows) {
      if (game.home_club_id && game.season_id) {
        // Find the BYE team for this club and season
        const byeTeam = await db.execute(sql`
          SELECT id FROM teams 
          WHERE club_id = ${game.home_club_id} 
          AND season_id = ${game.season_id} 
          AND name = 'BYE'
          LIMIT 1
        `);

        if (byeTeam.rows.length > 0) {
          await db.execute(sql`
            UPDATE games 
            SET away_team_id = ${byeTeam.rows[0].id}
            WHERE id = ${game.id}
          `);
          log(`Updated BYE game ${game.id} to use BYE team`, "migration");
        }
      }
    }

    // Step 3: Handle games with opponents - convert to inter-club games
    const opponentGames = await db.execute(sql`
      SELECT g.id, g.opponent_id, g.home_team_id, g.season_id, 
             ht.club_id as home_club_id, o.team_name as opponent_name
      FROM games g
      LEFT JOIN teams ht ON g.home_team_id = ht.id
      LEFT JOIN opponents o ON g.opponent_id = o.id
      WHERE g.opponent_id IS NOT NULL AND g.away_team_id IS NULL
    `);

    for (const game of opponentGames.rows) {
      if (game.opponent_name && game.season_id) {
        // Try to find an existing team with the opponent's name
        const existingTeam = await db.execute(sql`
          SELECT id FROM teams 
          WHERE name = ${game.opponent_name} 
          AND season_id = ${game.season_id}
          LIMIT 1
        `);

        let awayTeamId;
        if (existingTeam.rows.length > 0) {
          awayTeamId = existingTeam.rows[0].id;
        } else {
          // Create a generic "External" club for opponent teams if it doesn't exist
          const externalClub = await db.execute(sql`
            INSERT INTO clubs (name, code, primary_color, secondary_color, is_active)
            VALUES ('External Teams', 'EXT', '#6b7280', '#ffffff', true)
            ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
            RETURNING id
          `);

          const externalClubId = externalClub.rows[0].id;

          // Create team for the opponent
          const newTeam = await db.execute(sql`
            INSERT INTO teams (club_id, season_id, name, division, is_active)
            VALUES (${externalClubId}, ${game.season_id}, ${game.opponent_name}, 'External', true)
            ON CONFLICT (club_id, season_id, name) DO UPDATE SET name = EXCLUDED.name
            RETURNING id
          `);

          awayTeamId = newTeam.rows[0].id;
          log(`Created external team for opponent: ${game.opponent_name}`, "migration");
        }

        // Update the game to use the team instead of opponent
        await db.execute(sql`
          UPDATE games 
          SET away_team_id = ${awayTeamId}, is_inter_club = true
          WHERE id = ${game.id}
        `);
        log(`Updated game ${game.id} to use team-based system`, "migration");
      }
    }

    // Step 4: Make home_team_id and away_team_id required
    log("Making team columns required...", "migration");
    
    await db.execute(sql`
      ALTER TABLE games 
      ALTER COLUMN home_team_id SET NOT NULL,
      ALTER COLUMN away_team_id SET NOT NULL
    `);

    // Step 5: Remove opponent-related columns
    log("Removing opponent system columns...", "migration");
    
    // Remove foreign key constraint first if it exists
    try {
      await db.execute(sql`
        ALTER TABLE games DROP CONSTRAINT IF EXISTS games_opponent_id_opponents_id_fk
      `);
    } catch (error) {
      log("Foreign key constraint may not exist, continuing...", "migration");
    }

    // Drop the opponent_id column
    await db.execute(sql`
      ALTER TABLE games DROP COLUMN IF EXISTS opponent_id
    `);

    // Step 6: Clean up scoring columns (optional - remove legacy team_score/opponent_score)
    log("Removing legacy scoring columns...", "migration");
    
    await db.execute(sql`
      ALTER TABLE games 
      DROP COLUMN IF EXISTS team_score,
      DROP COLUMN IF EXISTS opponent_score
    `);

    log("Successfully completed opponent system removal migration", "migration");
    
    // Report summary
    const totalGames = await db.execute(sql`SELECT COUNT(*) as count FROM games`);
    const teamGames = await db.execute(sql`
      SELECT COUNT(*) as count FROM games 
      WHERE home_team_id IS NOT NULL AND away_team_id IS NOT NULL
    `);
    
    log(`Migration summary: ${teamGames.rows[0].count}/${totalGames.rows[0].count} games now use team-based system`, "migration");

  } catch (error) {
    log(`Error during opponent system removal migration: ${error}`, "migration");
    throw error;
  }
}
