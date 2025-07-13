import { db } from './server/db.ts';
import { sql } from 'drizzle-orm';

async function checkDatabase() {
  try {
    console.log('Checking teams table structure...');
    
    // Check if division_id column exists
    const columns = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'teams' 
      ORDER BY column_name
    `);
    
    console.log('Teams table columns:');
    columns.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type}`);
    });
    
    // Check teams data
    const teams = await db.execute(sql`
      SELECT id, name, division_id
      FROM teams 
      WHERE club_id = 54 
      LIMIT 5
    `);
    
    console.log('\nTeams data:');
    teams.rows.forEach(row => {
      console.log(`  ID: ${row.id}, Name: ${row.name}, division_id: ${row.division_id}`);
    });
    
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    process.exit(0);
  }
}

checkDatabase(); 