
import { db } from './db';
import { sql } from 'drizzle-orm';

export async function addPlayersToWarrandyte(): Promise<{ success: boolean; message: string; playersAdded: number }> {
  try {
    console.log('Starting to add players to Warrandyte Netball Club...');

    // Get Warrandyte club ID (should be 54)
    const warrandyteResult = await db.execute(sql`
      SELECT id FROM clubs WHERE name = 'Warrandyte Netball Club' OR id = 54 LIMIT 1
    `);

    if (warrandyteResult.rows.length === 0) {
      const message = 'Warrandyte Netball Club not found';
      console.error(message);
      return { success: false, message, playersAdded: 0 };
    }

    const warrandyteClubId = warrandyteResult.rows[0].id;
    console.log(`Found Warrandyte club with ID: ${warrandyteClubId}`);

    // Get all active players
    const playersResult = await db.execute(sql`
      SELECT id, display_name FROM players WHERE active = true
    `);

    console.log(`Found ${playersResult.rows.length} active players to associate with Warrandyte`);

    if (playersResult.rows.length === 0) {
      const message = 'No active players found';
      console.log(message);
      return { success: true, message, playersAdded: 0 };
    }

    // Check existing associations
    const existingResult = await db.execute(sql`
      SELECT COUNT(*) as count 
      FROM club_players 
      WHERE club_id = ${warrandyteClubId} AND is_active = true
    `);
    
    console.log(`Warrandyte currently has ${existingResult.rows[0].count} associated players`);

    // Add each player to Warrandyte
    let addedCount = 0;
    for (const player of playersResult.rows) {
      try {
        const result = await db.execute(sql`
          INSERT INTO club_players (club_id, player_id, joined_date, is_active)
          VALUES (${warrandyteClubId}, ${player.id}, CURRENT_DATE, true)
          ON CONFLICT (club_id, player_id) DO UPDATE SET
            is_active = true,
            left_date = null,
            updated_at = NOW()
        `);
        console.log(`Added/Updated player ${player.display_name} (ID: ${player.id}) to Warrandyte`);
        addedCount++;
      } catch (error) {
        console.error(`Error adding player ${player.display_name}:`, error);
      }
    }

    console.log(`Successfully processed ${addedCount} players for Warrandyte Netball Club`);

    // Verify the associations were created
    const verificationResult = await db.execute(sql`
      SELECT COUNT(*) as count 
      FROM club_players 
      WHERE club_id = ${warrandyteClubId} AND is_active = true
    `);

    const associatedPlayers = verificationResult.rows[0].count;
    console.log(`Verification: Warrandyte now has ${associatedPlayers} associated players`);

    const message = `Successfully associated ${addedCount} players with Warrandyte. Total active players: ${associatedPlayers}`;
    return { success: true, message, playersAdded: addedCount };
  } catch (error) {
    const message = `Error in addPlayersToWarrandyte: ${error}`;
    console.error(message);
    return { success: false, message, playersAdded: 0 };
  }
}
