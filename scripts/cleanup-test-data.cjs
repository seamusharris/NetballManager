#!/usr/bin/env node

/**
 * Cleanup script to remove all test data created during testing
 * This will remove all clubs, players, teams, games, etc. that start with "Test"
 */

const { Pool } = require('pg');
require('dotenv').config();

async function cleanupTestData() {
  console.log('🧹 Starting test data cleanup...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    // Clean up in dependency order (child tables first)
    
    // 1. Game Stats
    console.log('Cleaning up test game stats...');
    const gameStatsResult = await pool.query(`
      DELETE FROM game_stats 
      WHERE game_id IN (
        SELECT id FROM games 
        WHERE venue LIKE 'Test Venue%' 
        OR round LIKE 'Test Round%'
      )
    `);
    console.log(`✅ Deleted ${gameStatsResult.rowCount || 0} test game stats`);

    // 2. Rosters
    console.log('Cleaning up test rosters...');
    const rostersResult = await pool.query(`
      DELETE FROM rosters 
      WHERE game_id IN (
        SELECT id FROM games 
        WHERE venue LIKE 'Test Venue%' 
        OR round LIKE 'Test Round%'
      )
    `);
    console.log(`✅ Deleted ${rostersResult.rowCount || 0} test rosters`);

    // 3. Game Scores
    console.log('Cleaning up test game scores...');
    const gameScoresResult = await pool.query(`
      DELETE FROM game_scores 
      WHERE game_id IN (
        SELECT id FROM games 
        WHERE venue LIKE 'Test Venue%' 
        OR round LIKE 'Test Round%'
      )
    `);
    console.log(`✅ Deleted ${gameScoresResult.rowCount || 0} test game scores`);

    // 4. Games
    console.log('Cleaning up test games...');
    const gamesResult = await pool.query(`
      DELETE FROM games 
      WHERE venue LIKE 'Test Venue%' 
      OR round LIKE 'Test Round%'
      OR venue LIKE '%Test%'
    `);
    console.log(`✅ Deleted ${gamesResult.rowCount || 0} test games`);

    // 5. Team Players
    console.log('Cleaning up test team-player relationships...');
    const teamPlayersResult = await pool.query(`
      DELETE FROM team_players 
      WHERE team_id IN (
        SELECT id FROM teams 
        WHERE name LIKE 'Test Team%' 
        OR name LIKE 'Away Team%'
      )
      OR player_id IN (
        SELECT id FROM players 
        WHERE display_name LIKE 'Test Player%'
        OR display_name LIKE 'Complex Player%'
      )
    `);
    console.log(`✅ Deleted ${teamPlayersResult.rowCount || 0} test team-player relationships`);

    // 6. Teams
    console.log('Cleaning up test teams...');
    const teamsResult = await pool.query(`
      DELETE FROM teams 
      WHERE name LIKE 'Test Team%' 
      OR name LIKE 'Away Team%'
      OR name LIKE '%Test%'
    `);
    console.log(`✅ Deleted ${teamsResult.rowCount || 0} test teams`);

    // 7. Player Seasons
    console.log('Cleaning up test player-season relationships...');
    const playerSeasonsResult = await pool.query(`
      DELETE FROM player_seasons 
      WHERE player_id IN (
        SELECT id FROM players 
        WHERE display_name LIKE 'Test Player%'
        OR display_name LIKE 'Complex Player%'
      )
    `);
    console.log(`✅ Deleted ${playerSeasonsResult.rowCount || 0} test player-season relationships`);

    // 8. Club Players
    console.log('Cleaning up test club-player relationships...');
    const clubPlayersResult = await pool.query(`
      DELETE FROM club_players 
      WHERE player_id IN (
        SELECT id FROM players 
        WHERE display_name LIKE 'Test Player%'
        OR display_name LIKE 'Complex Player%'
      )
      OR club_id IN (
        SELECT id FROM clubs 
        WHERE name LIKE 'Test Club%'
        OR name LIKE 'Case Test Club%'
      )
    `);
    console.log(`✅ Deleted ${clubPlayersResult.rowCount || 0} test club-player relationships`);

    // 9. Players
    console.log('Cleaning up test players...');
    const playersResult = await pool.query(`
      DELETE FROM players 
      WHERE display_name LIKE 'Test Player%'
      OR display_name LIKE 'Complex Player%'
      OR first_name = 'Test'
      OR first_name = 'Complex'
    `);
    console.log(`✅ Deleted ${playersResult.rowCount || 0} test players`);

    // 10. Clubs
    console.log('Cleaning up test clubs...');
    const clubsResult = await pool.query(`
      DELETE FROM clubs 
      WHERE name LIKE 'Test Club%'
      OR name LIKE 'Case Test Club%'
      OR code LIKE 'TC%'
      OR code LIKE 'CTC%'
      OR address LIKE '%Test%'
    `);
    console.log(`✅ Deleted ${clubsResult.rowCount || 0} test clubs`);

    // 11. Test Seasons (be careful - only delete obvious test seasons)
    console.log('Cleaning up test seasons...');
    const seasonsResult = await pool.query(`
      DELETE FROM seasons 
      WHERE name LIKE 'Test Season%'
      OR name LIKE '%Test%'
    `);
    console.log(`✅ Deleted ${seasonsResult.rowCount || 0} test seasons`);

    console.log('🎉 Test data cleanup complete!');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

// Run the cleanup
cleanupTestData();