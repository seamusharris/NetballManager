
import { db } from './db';
import { sql } from 'drizzle-orm';

export async function debugStatsRelationships() {
  console.log('=== DEBUGGING STATS RELATIONSHIPS ===');

  try {
    // Check game stats
    const gameStatsCount = await db.execute(sql`SELECT COUNT(*) as count FROM game_stats`);
    console.log(`Total game stats: ${gameStatsCount.rows[0].count}`);

    // Check rosters
    const rostersCount = await db.execute(sql`SELECT COUNT(*) as count FROM rosters`);
    console.log(`Total rosters: ${rostersCount.rows[0].count}`);

    // Check games with teams
    const gamesWithTeams = await db.execute(sql`
      SELECT COUNT(*) as count FROM games 
      WHERE home_team_id IS NOT NULL OR away_team_id IS NOT NULL
    `);
    console.log(`Games with team assignments: ${gamesWithTeams.rows[0].count}`);

    // Check club-player relationships
    const clubPlayersCount = await db.execute(sql`SELECT COUNT(*) as count FROM club_players WHERE is_active = true`);
    console.log(`Active club-player relationships: ${clubPlayersCount.rows[0].count}`);

    // Check specific stats for Warrandyte games
    const warrandyteGames = await db.execute(sql`
      SELECT g.id, g.date, 
             COUNT(gs.id) as stats_count,
             COUNT(r.id) as roster_count
      FROM games g
      LEFT JOIN teams ht ON g.home_team_id = ht.id
      LEFT JOIN teams at ON g.away_team_id = at.id
      LEFT JOIN game_stats gs ON g.id = gs.game_id
      LEFT JOIN rosters r ON g.id = r.game_id
      WHERE (ht.club_id = 54 OR at.club_id = 54)
         OR EXISTS (SELECT 1 FROM game_permissions gp WHERE gp.game_id = g.id AND gp.club_id = 54)
      GROUP BY g.id, g.date
      ORDER BY g.date DESC
    `);

    console.log('\nWarrandyte games analysis:');
    warrandyteGames.rows.forEach(game => {
      console.log(`Game ${game.id} (${game.date}): ${game.stats_count} stats, ${game.roster_count} roster entries`);
    });

    // Check if players are in rosters for these games
    const playerRosterCheck = await db.execute(sql`
      SELECT p.id, p.display_name, COUNT(r.id) as roster_entries
      FROM players p
      JOIN club_players cp ON p.id = cp.player_id
      LEFT JOIN rosters r ON p.id = r.player_id
      WHERE cp.club_id = 54 AND cp.is_active = true
      GROUP BY p.id, p.display_name
    `);

    console.log('\nWarrandyte players roster entries:');
    playerRosterCheck.rows.forEach(player => {
      console.log(`Player ${player.display_name}: ${player.roster_entries} roster entries`);
    });

  } catch (error) {
    console.error('Error in debug:', error);
  }
}
