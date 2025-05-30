
import { db } from './db';
import { sql } from 'drizzle-orm';

async function grantWarrandyteAccessToAllGames() {
  const warrandyteClubId = 54;
  
  try {
    // Get all existing games in the system
    const allGames = await db.execute(sql`
      SELECT DISTINCT g.id, g.date, 
             ht.name as home_team_name, at.name as away_team_name,
             hc.name as home_club_name, ac.name as away_club_name
      FROM games g
      LEFT JOIN teams ht ON g.home_team_id = ht.id
      LEFT JOIN teams at ON g.away_team_id = at.id
      LEFT JOIN clubs hc ON ht.club_id = hc.id
      LEFT JOIN clubs ac ON at.club_id = ac.id
      WHERE g.id IS NOT NULL
      ORDER BY g.date DESC
    `);

    console.log(`Found ${allGames.rows.length} games in the system`);
    
    if (allGames.rows.length === 0) {
      console.log('No games found in the system to grant access to');
      return;
    }

    // Grant permissions for each game
    let successCount = 0;
    for (const game of allGames.rows) {
      try {
        // Check if permission already exists
        const existingPermission = await db.execute(sql`
          SELECT id FROM game_permissions 
          WHERE game_id = ${game.id} AND club_id = ${warrandyteClubId}
        `);

        if (existingPermission.rows.length > 0) {
          console.log(`Permission already exists for game ${game.id}`);
          continue;
        }

        // Grant both view and edit permissions
        await db.execute(sql`
          INSERT INTO game_permissions (game_id, club_id, can_edit_stats, can_view_detailed_stats)
          VALUES (${game.id}, ${warrandyteClubId}, true, true)
        `);

        console.log(`Granted access to game ${game.id} (${game.date}) - ${game.home_club_name || 'Unknown'} vs ${game.away_club_name || 'Unknown'}`);
        successCount++;
      } catch (error) {
        console.error(`Failed to grant access to game ${game.id}:`, error);
      }
    }

    console.log(`Successfully granted Warrandyte access to ${successCount} games`);
    
    // Verify the permissions were created
    const warrandytePermissions = await db.execute(sql`
      SELECT 
        gp.*,
        g.date,
        ht.name as home_team_name,
        at.name as away_team_name
      FROM game_permissions gp
      JOIN games g ON gp.game_id = g.id
      LEFT JOIN teams ht ON g.home_team_id = ht.id
      LEFT JOIN teams at ON g.away_team_id = at.id
      WHERE gp.club_id = ${warrandyteClubId}
      ORDER BY g.date DESC
    `);

    console.log(`Warrandyte now has access to ${warrandytePermissions.rows.length} games`);
    
  } catch (error) {
    console.error('Error granting Warrandyte access to games:', error);
  }
}

// Export the function so it can be called
export { grantWarrandyteAccessToAllGames };

// If running directly, execute the function
if (require.main === module) {
  grantWarrandyteAccessToAllGames()
    .then(() => {
      console.log('Script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}
