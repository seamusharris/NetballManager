
import { db } from '../db';
import { sql } from 'drizzle-orm';

/**
 * Populate club_players table with existing player relationships
 */
export async function populateClubPlayersTable() {
  console.log('Populating club_players table...');

  try {
    // Get the default club ID
    const defaultClubResult = await db.execute(sql`
      SELECT id FROM clubs WHERE code = 'DEFAULT' OR code = 'DC' LIMIT 1;
    `);
    
    if (defaultClubResult.rows.length === 0) {
      console.log('No default club found, creating one...');
      const newClubResult = await db.execute(sql`
        INSERT INTO clubs (name, code, primary_color, secondary_color)
        VALUES ('Default Club', 'DC', '#007acc', '#ffffff')
        RETURNING id;
      `);
      var defaultClubId = newClubResult.rows[0].id;
    } else {
      var defaultClubId = defaultClubResult.rows[0].id;
    }

    console.log(`Using club ID: ${defaultClubId}`);

    // Get all active players and add them to the default club
    const playersResult = await db.execute(sql`
      SELECT id FROM players WHERE active = true;
    `);

    console.log(`Found ${playersResult.rows.length} active players`);

    // Insert players into club_players table
    for (const player of playersResult.rows) {
      await db.execute(sql`
        INSERT INTO club_players (club_id, player_id, joined_date, is_active)
        VALUES (${defaultClubId}, ${player.id}, CURRENT_DATE, true)
        ON CONFLICT (club_id, player_id) DO UPDATE SET
          is_active = true,
          left_date = null,
          updated_at = NOW();
      `);
    }

    console.log(`Successfully populated club_players table with ${playersResult.rows.length} relationships`);
    return true;
  } catch (error) {
    console.error('Error populating club_players table:', error);
    return false;
  }
}
