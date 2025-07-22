#!/usr/bin/env node

/**
 * Check what data remains after cleanup
 */

const { Pool } = require('pg');
require('dotenv').config();

async function checkRemainingData() {
  console.log('🔍 Checking remaining data...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    // Check clubs
    const clubsResult = await pool.query(`
      SELECT id, name, code, address 
      FROM clubs 
      ORDER BY name
      LIMIT 20
    `);
    console.log(`\n📊 Remaining Clubs (${clubsResult.rowCount}):`);
    clubsResult.rows.forEach(club => {
      console.log(`  - ${club.id}: ${club.name} (${club.code})`);
    });

    // Check players
    const playersResult = await pool.query(`
      SELECT id, display_name, first_name, last_name 
      FROM players 
      ORDER BY display_name
      LIMIT 20
    `);
    console.log(`\n👥 Remaining Players (${playersResult.rowCount}):`);
    playersResult.rows.forEach(player => {
      console.log(`  - ${player.id}: ${player.display_name} (${player.first_name} ${player.last_name})`);
    });

    // Check teams
    const teamsResult = await pool.query(`
      SELECT id, name, club_id 
      FROM teams 
      ORDER BY name
      LIMIT 20
    `);
    console.log(`\n🏆 Remaining Teams (${teamsResult.rowCount}):`);
    teamsResult.rows.forEach(team => {
      console.log(`  - ${team.id}: ${team.name} (Club: ${team.club_id})`);
    });

    // Check seasons
    const seasonsResult = await pool.query(`
      SELECT id, name, start_date, end_date, is_active 
      FROM seasons 
      ORDER BY start_date DESC
      LIMIT 10
    `);
    console.log(`\n📅 Remaining Seasons (${seasonsResult.rowCount}):`);
    seasonsResult.rows.forEach(season => {
      console.log(`  - ${season.id}: ${season.name} (${season.is_active ? 'Active' : 'Inactive'})`);
    });

    // Check games
    const gamesResult = await pool.query(`
      SELECT COUNT(*) as count FROM games
    `);
    console.log(`\n🎮 Remaining Games: ${gamesResult.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error checking data:', error);
  } finally {
    await pool.end();
  }
}

checkRemainingData();