

import { db, pool } from './db';
import { sql } from 'drizzle-orm';

export async function addPlayersToWarrandyte() {
  const client = await pool.connect();
  
  try {
    console.log('Starting to add players to Warrandyte Netball Club...');

    // Get Warrandyte club ID (should be 54)
    const warrandyteResult = await client.query(`
      SELECT id FROM clubs WHERE name = 'Warrandyte Netball Club' OR id = 54 LIMIT 1
    `);

    if (warrandyteResult.rows.length === 0) {
      console.error('Warrandyte Netball Club not found');
      return { success: false, message: 'Warrandyte Netball Club not found', playersAdded: 0 };
    }

    const warrandyteClubId = warrandyteResult.rows[0].id;
    console.log(`Found Warrandyte club with ID: ${warrandyteClubId}`);

    // Get all active players
    const playersResult = await client.query(`
      SELECT id, display_name FROM players WHERE active = true
    `);

    console.log(`Found ${playersResult.rows.length} active players to associate with Warrandyte`);

    if (playersResult.rows.length === 0) {
      console.log('No active players found');
      return { success: true, message: 'No active players found to associate', playersAdded: 0 };
    }

    await client.query('BEGIN');
    let addedCount = 0;

    // First, clear any existing associations for Warrandyte to start fresh
    await client.query(`DELETE FROM club_players WHERE club_id = $1`, [warrandyteClubId]);
    console.log(`Cleared existing associations for club ${warrandyteClubId}`);

    // Add each player to Warrandyte
    for (const player of playersResult.rows) {
      try {
        const insertResult = await client.query(`
          INSERT INTO club_players (club_id, player_id, joined_date, is_active)
          VALUES ($1, $2, CURRENT_DATE, true)
          RETURNING id
        `, [warrandyteClubId, player.id]);

        console.log(`Successfully added player ${player.display_name} (ID: ${player.id}) to Warrandyte`);
        addedCount++;
      } catch (error) {
        console.error(`Error adding player ${player.display_name}:`, error);
      }
    }

    await client.query('COMMIT');
    console.log(`Transaction committed. Successfully added ${addedCount} players to Warrandyte Netball Club`);

    // Verify the associations were created
    const verificationResult = await client.query(`
      SELECT COUNT(*) as count 
      FROM club_players 
      WHERE club_id = $1 AND is_active = true
    `, [warrandyteClubId]);

    const associatedPlayers = verificationResult.rows[0].count;
    console.log(`Verification: Warrandyte now has ${associatedPlayers} associated players`);

    return { 
      success: true, 
      message: `Successfully added ${addedCount} players to Warrandyte Netball Club`, 
      playersAdded: addedCount 
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in addPlayersToWarrandyte:', error);
    return { success: false, message: 'Error adding players to Warrandyte', playersAdded: 0 };
  } finally {
    client.release();
  }
}

