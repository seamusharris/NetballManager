import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkTeamsSchema() {
  try {
    const client = await pool.connect();
    
    // Get all columns from teams table
    const result = await client.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'teams' 
      ORDER BY ordinal_position
    `);
    
    console.log('Teams table schema:');
    console.log('==================');
    
    result.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type} ${row.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)'} ${row.column_default ? `DEFAULT: ${row.column_default}` : ''}`);
    });
    
    // Also check for any constraints
    const constraintsResult = await client.query(`
      SELECT 
        constraint_name,
        constraint_type
      FROM information_schema.table_constraints 
      WHERE table_name = 'teams'
    `);
    
    console.log('\nConstraints:');
    console.log('===========');
    constraintsResult.rows.forEach(row => {
      console.log(`${row.constraint_name}: ${row.constraint_type}`);
    });
    
    client.release();
  } catch (error) {
    console.error('Error checking teams schema:', error);
  } finally {
    await pool.end();
  }
}

checkTeamsSchema(); 