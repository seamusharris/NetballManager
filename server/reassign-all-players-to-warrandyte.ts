
import { db } from './db';
import { sql } from 'drizzle-orm';

export async function reassignAllPlayersToWarrandyte() {
  try {
    console.log('Starting reassignment of all players to Warrandyte...');
    
    const warrandyteClubId = 54;
    
    // Step 1: Get all active players
    const allPlayers = await db.execute(sql`
      SELECT id, display_name FROM players WHERE active = true
      ORDER BY display_name
    `);
    
    console.log(`Found ${allPlayers.rows.length} active players to reassign`);
    
    // Step 2: Remove all players from non-Warrandyte teams
    console.log('Removing players from non-Warrandyte teams...');
    
    const removedFromTeams = await db.execute(sql`
      DELETE FROM team_players 
      WHERE team_id IN (
        SELECT id FROM teams WHERE club_id != ${warrandyteClubId}
      )
    `);
    
    console.log(`Removed ${removedFromTeams.rowCount} player-team assignments from non-Warrandyte teams`);
    
    // Step 3: Remove all players from non-Warrandyte clubs
    console.log('Removing players from non-Warrandyte clubs...');
    
    const removedFromClubs = await db.execute(sql`
      DELETE FROM club_players 
      WHERE club_id != ${warrandyteClubId}
    `);
    
    console.log(`Removed ${removedFromClubs.rowCount} player-club associations from non-Warrandyte clubs`);
    
    // Step 4: Add all players to Warrandyte club (if not already there)
    console.log('Adding all players to Warrandyte club...');
    
    let addedToWarrandyte = 0;
    for (const player of allPlayers.rows) {
      try {
        await db.execute(sql`
          INSERT INTO club_players (club_id, player_id, joined_date, is_active)
          VALUES (${warrandyteClubId}, ${player.id}, CURRENT_DATE, true)
          ON CONFLICT (club_id, player_id) DO UPDATE SET
            is_active = true,
            left_date = null,
            updated_at = NOW()
        `);
        
        console.log(`✓ ${player.display_name} -> Warrandyte`);
        addedToWarrandyte++;
      } catch (error) {
        console.error(`Failed to add ${player.display_name} to Warrandyte:`, error);
      }
    }
    
    // Step 5: Verify the results
    console.log('\nVerifying results...');
    
    const warrandytePlayers = await db.execute(sql`
      SELECT COUNT(*) as count
      FROM club_players 
      WHERE club_id = ${warrandyteClubId} AND is_active = true
    `);
    
    const totalClubAssociations = await db.execute(sql`
      SELECT COUNT(*) as count FROM club_players WHERE is_active = true
    `);
    
    const totalTeamAssignments = await db.execute(sql`
      SELECT COUNT(*) as count FROM team_players
    `);
    
    const warrandyteTeamAssignments = await db.execute(sql`
      SELECT COUNT(*) as count 
      FROM team_players tp
      JOIN teams t ON tp.team_id = t.id
      WHERE t.club_id = ${warrandyteClubId}
    `);
    
    console.log('\n=== REASSIGNMENT SUMMARY ===');
    console.log(`Players processed: ${allPlayers.rows.length}`);
    console.log(`Players added to Warrandyte: ${addedToWarrandyte}`);
    console.log(`Current Warrandyte players: ${warrandytePlayers.rows[0].count}`);
    console.log(`Total active club associations: ${totalClubAssociations.rows[0].count}`);
    console.log(`Total team assignments: ${totalTeamAssignments.rows[0].count}`);
    console.log(`Warrandyte team assignments: ${warrandyteTeamAssignments.rows[0].count}`);
    
    // Step 6: Show remaining team assignments by club
    const teamAssignmentsByClub = await db.execute(sql`
      SELECT c.name as club_name, c.id as club_id, COUNT(tp.player_id) as player_count
      FROM clubs c
      LEFT JOIN teams t ON c.id = t.club_id
      LEFT JOIN team_players tp ON t.id = tp.team_id
      GROUP BY c.id, c.name
      HAVING COUNT(tp.player_id) > 0
      ORDER BY player_count DESC
    `);
    
    console.log('\nTeam assignments by club:');
    teamAssignmentsByClub.rows.forEach(row => {
      console.log(`  ${row.club_name}: ${row.player_count} assignments`);
    });
    
    return {
      success: true,
      playersProcessed: allPlayers.rows.length,
      playersAddedToWarrandyte: addedToWarrandyte,
      removedFromTeams: removedFromTeams.rowCount || 0,
      removedFromClubs: removedFromClubs.rowCount || 0
    };
    
  } catch (error) {
    console.error('Error during player reassignment:', error);
    throw error;
  }
}

// If this file is run directly
if (require.main === module) {
  reassignAllPlayersToWarrandyte()
    .then(() => {
      console.log('✅ Player reassignment completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Player reassignment failed:', error);
      process.exit(1);
    });
}
