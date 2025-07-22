#!/usr/bin/env node

/**
 * Check data integrity after cleanup
 */

const { Pool } = require('pg');
require('dotenv').config();

async function checkDataIntegrity() {
  console.log('🔍 Checking data integrity...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    // Check for orphaned club_players
    const orphanedClubPlayers = await pool.query(`
      SELECT cp.id, cp.club_id, cp.player_id
      FROM club_players cp
      LEFT JOIN clubs c ON cp.club_id = c.id
      LEFT JOIN players p ON cp.player_id = p.id
      WHERE c.id IS NULL OR p.id IS NULL
      LIMIT 10
    `);
    console.log(`\n🔗 Orphaned club_players: ${orphanedClubPlayers.rowCount}`);
    if (orphanedClubPlayers.rowCount > 0) {
      orphanedClubPlayers.rows.forEach(row => {
        console.log(`  - ID: ${row.id}, Club: ${row.club_id}, Player: ${row.player_id}`);
      });
    }

    // Check for orphaned team_players
    const orphanedTeamPlayers = await pool.query(`
      SELECT tp.id, tp.team_id, tp.player_id
      FROM team_players tp
      LEFT JOIN teams t ON tp.team_id = t.id
      LEFT JOIN players p ON tp.player_id = p.id
      WHERE t.id IS NULL OR p.id IS NULL
      LIMIT 10
    `);
    console.log(`\n🔗 Orphaned team_players: ${orphanedTeamPlayers.rowCount}`);
    if (orphanedTeamPlayers.rowCount > 0) {
      orphanedTeamPlayers.rows.forEach(row => {
        console.log(`  - ID: ${row.id}, Team: ${row.team_id}, Player: ${row.player_id}`);
      });
    }

    // Check for orphaned teams
    const orphanedTeams = await pool.query(`
      SELECT t.id, t.name, t.club_id
      FROM teams t
      LEFT JOIN clubs c ON t.club_id = c.id
      WHERE c.id IS NULL
      LIMIT 10
    `);
    console.log(`\n🔗 Orphaned teams: ${orphanedTeams.rowCount}`);
    if (orphanedTeams.rowCount > 0) {
      orphanedTeams.rows.forEach(row => {
        console.log(`  - ID: ${row.id}, Name: ${row.name}, Club: ${row.club_id}`);
      });
    }

    // Check active season
    const activeSeason = await pool.query(`
      SELECT id, name, is_active FROM seasons WHERE is_active = true
    `);
    console.log(`\n📅 Active seasons: ${activeSeason.rowCount}`);
    activeSeason.rows.forEach(season => {
      console.log(`  - ${season.id}: ${season.name}`);
    });

  } catch (error) {
    console.error('❌ Error checking integrity:', error);
  } finally {
    await pool.end();
  }
}

checkDataIntegrity();