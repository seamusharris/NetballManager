
import { db } from '../db';
import { sql } from 'drizzle-orm';

/**
 * Migrate existing single-team data to multi-club structure
 */
export async function migrateExistingDataToMultiClub() {
  console.log('Starting data migration to multi-club...');

  try {
    // 1. Create default club
    const defaultClubResult = await db.execute(sql`
      INSERT INTO clubs (name, code, primary_color, secondary_color)
      VALUES ('Emeralds Netball Club', 'EMFC', '#22c55e', '#ffffff')
      ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
      RETURNING id;
    `);
    
    const defaultClubId = defaultClubResult.rows[0].id;
    console.log(`Created/found default club with ID: ${defaultClubId}`);

    // 2. Create teams for each season
    const seasonsResult = await db.execute(sql`SELECT id, name FROM seasons ORDER BY start_date;`);
    
    for (const season of seasonsResult.rows) {
      await db.execute(sql`
        INSERT INTO teams (club_id, season_id, name, division)
        VALUES (${defaultClubId}, ${season.id}, 'Emeralds A', 'Division 1')
        ON CONFLICT (club_id, season_id, name) DO NOTHING;
      `);
      console.log(`Created team for season: ${season.name}`);
    }

    // 3. Migrate player-season relationships to team-player relationships
    const playerSeasonsResult = await db.execute(sql`
      SELECT ps.player_id, ps.season_id, t.id as team_id 
      FROM player_seasons ps
      JOIN teams t ON t.season_id = ps.season_id AND t.club_id = ${defaultClubId};
    `);

    for (const relationship of playerSeasonsResult.rows) {
      await db.execute(sql`
        INSERT INTO team_players (team_id, player_id, is_regular)
        VALUES (${relationship.team_id}, ${relationship.player_id}, true)
        ON CONFLICT (team_id, player_id) DO NOTHING;
      `);
    }
    console.log(`Migrated ${playerSeasonsResult.rows.length} player-team relationships`);

    // 4. Update existing games to use teams
    // Convert current games (which are vs opponents) to be home team vs away team
    const activeSeasonResult = await db.execute(sql`
      SELECT id FROM seasons WHERE is_active = true LIMIT 1;
    `);
    
    if (activeSeasonResult.rows.length > 0) {
      const activeSeasonId = activeSeasonResult.rows[0].id;
      
      const defaultTeamResult = await db.execute(sql`
        SELECT id FROM teams WHERE club_id = ${defaultClubId} AND season_id = ${activeSeasonId} LIMIT 1;
      `);
      
      if (defaultTeamResult.rows.length > 0) {
        const defaultTeamId = defaultTeamResult.rows[0].id;
        
        // Update games to set home_team_id
        await db.execute(sql`
          UPDATE games 
          SET home_team_id = ${defaultTeamId}, is_inter_club = true
          WHERE season_id = ${activeSeasonId} AND home_team_id IS NULL;
        `);
        console.log('Updated existing games with team references');
      }
    }

    // 5. Create default admin user for the club (only if users exist)
    const usersResult = await db.execute(sql`SELECT id FROM users LIMIT 1;`);
    if (usersResult.rows.length > 0) {
      const firstUserId = usersResult.rows[0].id;
      await db.execute(sql`
        INSERT INTO club_users (club_id, user_id, role, can_manage_players, can_manage_games, can_manage_stats, can_view_other_teams)
        VALUES (${defaultClubId}, ${firstUserId}, 'admin', true, true, true, true)
        ON CONFLICT (club_id, user_id) DO NOTHING;
      `);
      console.log(`Created club admin user relationship for user ${firstUserId}`);
    } else {
      console.log('No users found, skipping club_users creation');
    }

    console.log('Data migration completed successfully!');
    return true;
  } catch (error) {
    console.error('Error in data migration:', error);
    return false;
  }
}
