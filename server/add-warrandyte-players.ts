
import { db } from './db';
import { sql } from 'drizzle-orm';

export async function addPlayersToWarrandyte(): Promise<boolean> {
  try {
    console.log('Starting to add players to Warrandyte Netball Club...');

    // Get Warrandyte club ID (should be 54)
    const warrandyteResult = await db.execute(sql`
      SELECT id FROM clubs WHERE name = 'Warrandyte Netball Club' OR id = 54 LIMIT 1
    `);

    if (warrandyteResult.rows.length === 0) {
      console.error('Warrandyte Netball Club not found');
      return false;
    }

    const warrandyteClubId = warrandyteResult.rows[0].id;
    console.log(`Found Warrandyte club with ID: ${warrandyteClubId}`);

    // Get all active players
    const playersResult = await db.execute(sql`
      SELECT id, display_name FROM players WHERE active = true
    `);

    console.log(`Found ${playersResult.rows.length} active players to associate with Warrandyte`);

    if (playersResult.rows.length === 0) {
      console.log('No active players found');
      return true;
    }

    // Add each player to Warrandyte
    let addedCount = 0;
    for (const player of playersResult.rows) {
      try {
        await db.execute(sql`
          INSERT INTO club_players (club_id, player_id, joined_date, is_active)
          VALUES (${warrandyteClubId}, ${player.id}, CURRENT_DATE, true)
          ON CONFLICT (club_id, player_id) DO UPDATE SET
            is_active = true,
            left_date = null,
            updated_at = NOW()
        `);
        console.log(`Added player ${player.display_name} (ID: ${player.id}) to Warrandyte`);
        addedCount++;
      } catch (error) {
        console.error(`Error adding player ${player.display_name}:`, error);
      }
    }

    console.log(`Successfully added ${addedCount} players to Warrandyte Netball Club`);

    // Verify the associations were created
    const verificationResult = await db.execute(sql`
      SELECT COUNT(*) as count 
      FROM club_players 
      WHERE club_id = ${warrandyteClubId} AND is_active = true
    `);

    const associatedPlayers = verificationResult.rows[0].count;
    console.log(`Verification: Warrandyte now has ${associatedPlayers} associated players`);

    return addedCount > 0;
  } catch (error) {
    console.error('Error in addPlayersToWarrandyte:', error);
    return false;
  }
}
