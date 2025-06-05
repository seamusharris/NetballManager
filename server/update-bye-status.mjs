
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

async function updateByeDisplayName() {
  try {
    const result = await db.execute(sql`
      UPDATE game_statuses 
      SET display_name = 'Bye' 
      WHERE name = 'bye'
    `);
    
    console.log('✅ Updated BYE display name to "Bye"');
    
    // Verify the change
    const verification = await db.execute(sql`
      SELECT name, display_name FROM game_statuses WHERE name = 'bye'
    `);
    
    if (verification.rows.length > 0) {
      console.log('Verified:', verification.rows[0]);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating BYE display name:', error);
    process.exit(1);
  }
}

updateByeDisplayName();
