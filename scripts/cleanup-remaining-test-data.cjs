#!/usr/bin/env node

/**
 * Clean up remaining test data that wasn't caught by the first cleanup
 */

const { Pool } = require('pg');
require('dotenv').config();

async function cleanupRemainingTestData() {
  console.log('🧹 Cleaning up remaining test data...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    // Clean up remaining "Case Test" players
    const caseTestPlayers = await pool.query(`
      DELETE FROM players 
      WHERE display_name LIKE 'Case Test Player%'
      OR first_name = 'Case Test'
    `);
    console.log(`✅ Deleted ${caseTestPlayers.rowCount || 0} remaining case test players`);

    // Clean up remaining "Updated Case Test" clubs
    const updatedCaseTestClubs = await pool.query(`
      DELETE FROM clubs 
      WHERE name LIKE 'Updated Case Test Club%'
      OR code LIKE 'UPD%'
    `);
    console.log(`✅ Deleted ${updatedCaseTestClubs.rowCount || 0} remaining updated case test clubs`);

    console.log('🎉 Remaining test data cleanup complete!');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await pool.end();
  }
}

cleanupRemainingTestData();