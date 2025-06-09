
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function removeOpponentSystem() {
  try {
    console.log("Starting migration to remove opponent system");

    // Step 1: Convert existing BYE games to use null away_team_id
    console.log("Converting BYE games to use null away_team_id...");
    
    const byeGames = await db.execute(sql`
      SELECT g.id, g.home_team_id, g.away_team_id, at.name as away_team_name
      FROM games g
      LEFT JOIN teams at ON g.away_team_id = at.id
      WHERE g.status_id = 6 OR at.name = 'Bye'
    `);

    console.log(`Found ${byeGames.rows.length} bye games to convert`);

    for (const game of byeGames.rows) {
      await db.execute(sql`
        UPDATE games 
        SET away_team_id = NULL
        WHERE id = ${game.id}
      `);
      console.log(`Updated game ${game.id} to have null away_team_id`);
    }

    // Step 2: Remove BYE teams that are no longer needed
    console.log("Removing BYE teams...");
    
    const byeTeams = await db.execute(sql`
      SELECT id, name, club_id FROM teams WHERE name = 'Bye'
    `);

    for (const team of byeTeams.rows) {
      await db.execute(sql`
        DELETE FROM teams WHERE id = ${team.id}
      `);
      console.log(`Removed BYE team ${team.id} for club ${team.club_id}`);
    }

    console.log("Migration completed successfully!");

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

async function main() {
  try {
    await removeOpponentSystem();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();
