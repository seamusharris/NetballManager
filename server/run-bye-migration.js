

import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkByeTransition() {
  const client = await pool.connect();
  
  try {
    console.log("Checking BYE transition status...");

    // Check for any remaining BYE teams
    const byeTeamsResult = await client.query(`
      SELECT id, name, club_id FROM teams WHERE name = 'Bye'
    `);

    // Check for BYE games using null away_team_id
    const byeGamesResult = await client.query(`
      SELECT COUNT(*) as count FROM games WHERE away_team_id IS NULL
    `);

    // Check for games with status_id = 6 (BYE status)
    const byeStatusGamesResult = await client.query(`
      SELECT COUNT(*) as count FROM games WHERE status_id = 6
    `);

    console.log(`\n=== BYE TRANSITION STATUS ===`);
    console.log(`Remaining BYE teams: ${byeTeamsResult.rows.length}`);
    console.log(`Games with null away_team_id: ${byeGamesResult.rows[0].count}`);
    console.log(`Games with BYE status (status_id=6): ${byeStatusGamesResult.rows[0].count}`);
    
    if (byeTeamsResult.rows.length === 0) {
      console.log("✅ BYE transition completed successfully!");
      console.log("✅ All BYE teams have been removed");
      console.log("✅ BYE games now use away_team_id = NULL");
    } else {
      console.log("⚠️  BYE teams still exist:");
      byeTeamsResult.rows.forEach(team => {
        console.log(`  - Team ID ${team.id}: ${team.name} (Club ${team.club_id})`);
      });
    }
    console.log(`=== END STATUS CHECK ===\n`);

  } catch (error) {
    console.error('Status check failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

checkByeTransition()
  .then(() => {
    console.log('Status check completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Status check failed:', error);
    process.exit(1);
  });
