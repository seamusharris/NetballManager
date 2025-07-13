import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function dropSectionId() {
  try {
    const client = await pool.connect();
    
    console.log('Dropping section_id column from teams table...');
    
    const result = await client.query(`
      ALTER TABLE teams DROP COLUMN IF EXISTS section_id;
    `);
    
    console.log('section_id column dropped successfully');
    
    // Verify it's gone
    const checkResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'teams' 
      AND column_name = 'section_id'
    `);
    
    if (checkResult.rows.length === 0) {
      console.log('✅ section_id column has been successfully removed');
    } else {
      console.log('❌ section_id column still exists');
    }
    
    client.release();
  } catch (error) {
    console.error('Error dropping section_id column:', error);
  } finally {
    await pool.end();
  }
}

dropSectionId(); 