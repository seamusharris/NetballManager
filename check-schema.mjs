import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function checkSchema() {
  try {
    console.log('Checking seasons table schema...');
    
    // Check seasons table structure
    const seasonsResult = await db.execute(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'seasons' 
      ORDER BY ordinal_position
    `);
    
    console.log('Seasons table columns:');
    seasonsResult.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    // Check if there are any seasons
    const seasonsCount = await db.execute('SELECT COUNT(*) as count FROM seasons');
    console.log(`\nTotal seasons: ${seasonsCount.rows[0].count}`);
    
    // Check teams table structure
    console.log('\nChecking teams table schema...');
    const teamsResult = await db.execute(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'teams' 
      ORDER BY ordinal_position
    `);
    
    console.log('Teams table columns:');
    teamsResult.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    // Check divisions table structure
    console.log('\nChecking divisions table schema...');
    const divisionsResult = await db.execute(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'divisions' 
      ORDER BY ordinal_position
    `);
    
    console.log('Divisions table columns:');
    divisionsResult.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
  } catch (error) {
    console.error('Error checking schema:', error);
  } finally {
    await pool.end();
  }
}

checkSchema(); 