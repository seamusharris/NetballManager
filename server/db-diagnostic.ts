
import { db } from './db.js';
import { sql } from 'drizzle-orm';

async function checkGameStatusJoin() {
  try {
    console.log('=== CHECKING GAMES TABLE STATUS IDs ===');
    const games = await db.execute(sql`
      SELECT id, date, status_id, opponent_id 
      FROM games 
      ORDER BY id 
      LIMIT 10
    `);
    console.log('Sample games with status_ids:', games.rows);
    
    console.log('\n=== CHECKING GAME_STATUSES TABLE ===');
    const statuses = await db.execute(sql`
      SELECT id, name, display_name, is_completed 
      FROM game_statuses 
      ORDER BY id
    `);
    console.log('Available game statuses:', statuses.rows);
    
    console.log('\n=== TESTING JOIN QUERY ===');
    const joinTest = await db.execute(sql`
      SELECT 
        g.id as game_id, 
        g.status_id, 
        gs.id as status_table_id, 
        gs.name as status_name,
        gs.is_completed
      FROM games g
      LEFT JOIN game_statuses gs ON g.status_id = gs.id
      ORDER BY g.id 
      LIMIT 10
    `);
    console.log('Join test results:', joinTest.rows);
    
    console.log('\n=== CHECKING FOR NULL STATUS IDs ===');
    const nullStatusIds = await db.execute(sql`
      SELECT COUNT(*) as null_count 
      FROM games 
      WHERE status_id IS NULL
    `);
    console.log('Games with NULL status_id:', nullStatusIds.rows);
    
    process.exit(0);
  } catch (error) {
    console.error('Database diagnostic error:', error);
    process.exit(1);
  }
}

checkGameStatusJoin();
