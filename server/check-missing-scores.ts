
import { db, pool } from './db';
import { sql } from 'drizzle-orm';

async function checkMissingScores() {
  try {
    console.log('Checking for Kangaroos games missing official scores...\n');

    // Get all completed Kangaroos games and their official scores
    const result = await db.execute(sql`
      SELECT 
        g.id,
        g.date,
        g.round,
        CASE 
          WHEN g.home_team_id = 127 THEN g.away_team_id
          WHEN g.away_team_id = 127 THEN g.home_team_id
          ELSE NULL
        END as opponent_team_id,
        CASE 
          WHEN g.home_team_id = 127 THEN at.name
          WHEN g.away_team_id = 127 THEN ht.name
          ELSE NULL
        END as opponent_name,
        gs.name as status_name,
        gs.is_completed,
        COUNT(scores.id) as score_count
      FROM games g
      LEFT JOIN teams ht ON g.home_team_id = ht.id
      LEFT JOIN teams at ON g.away_team_id = at.id
      LEFT JOIN game_statuses gs ON g.status_id = gs.id
      LEFT JOIN game_scores scores ON g.id = scores.game_id
      WHERE (g.home_team_id = 127 OR g.away_team_id = 127)
        AND gs.is_completed = true
      GROUP BY g.id, g.date, g.round, opponent_team_id, opponent_name, gs.name, gs.is_completed
      ORDER BY g.date DESC, g.round DESC
    `);

    console.log(`Found ${result.rows.length} completed Kangaroos games\n`);

    const gamesWithoutScores = result.rows.filter(game => game.score_count === 0);
    const gamesWithIncompleteScores = result.rows.filter(game => game.score_count > 0 && game.score_count < 8);
    const gamesWithCompleteScores = result.rows.filter(game => game.score_count >= 8);

    console.log('=== GAMES WITHOUT ANY OFFICIAL SCORES ===');
    if (gamesWithoutScores.length === 0) {
      console.log('✅ All completed games have at least some official scores entered\n');
    } else {
      gamesWithoutScores.forEach(game => {
        console.log(`❌ Game ${game.id}: Round ${game.round} vs ${game.opponent_name} (${game.date}) - Status: ${game.status_name}`);
      });
      console.log(`\nTotal games missing ALL scores: ${gamesWithoutScores.length}\n`);
    }

    console.log('=== GAMES WITH INCOMPLETE OFFICIAL SCORES ===');
    if (gamesWithIncompleteScores.length === 0) {
      console.log('✅ No games have incomplete score entries\n');
    } else {
      gamesWithIncompleteScores.forEach(game => {
        console.log(`⚠️  Game ${game.id}: Round ${game.round} vs ${game.opponent_name} (${game.date}) - ${game.score_count}/8 quarters entered`);
      });
      console.log(`\nTotal games with incomplete scores: ${gamesWithIncompleteScores.length}\n`);
    }

    console.log('=== GAMES WITH COMPLETE OFFICIAL SCORES ===');
    console.log(`✅ ${gamesWithCompleteScores.length} games have complete official scores (8 quarters)\n`);

    // Show detailed breakdown for games with incomplete scores
    if (gamesWithIncompleteScores.length > 0) {
      console.log('=== DETAILED BREAKDOWN OF INCOMPLETE SCORES ===');
      for (const game of gamesWithIncompleteScores) {
        const detailResult = await db.execute(sql`
          SELECT 
            gs.quarter,
            gs.team_id,
            gs.score,
            t.name as team_name
          FROM game_scores gs
          JOIN teams t ON gs.team_id = t.id
          WHERE gs.game_id = ${game.id}
          ORDER BY gs.quarter, gs.team_id
        `);

        console.log(`\nGame ${game.id} (Round ${game.round} vs ${game.opponent_name}):`);
        if (detailResult.rows.length === 0) {
          console.log('  No scores entered');
        } else {
          const scoresByQuarter = detailResult.rows.reduce((acc, score) => {
            if (!acc[score.quarter]) acc[score.quarter] = [];
            acc[score.quarter].push(`${score.team_name}: ${score.score}`);
            return acc;
          }, {} as Record<number, string[]>);

          for (let q = 1; q <= 4; q++) {
            if (scoresByQuarter[q]) {
              console.log(`  Q${q}: ${scoresByQuarter[q].join(', ')}`);
            } else {
              console.log(`  Q${q}: Missing`);
            }
          }
        }
      }
    }

    console.log('\n=== SUMMARY ===');
    console.log(`Total completed Kangaroos games: ${result.rows.length}`);
    console.log(`Games with no official scores: ${gamesWithoutScores.length}`);
    console.log(`Games with incomplete scores: ${gamesWithIncompleteScores.length}`);
    console.log(`Games with complete scores: ${gamesWithCompleteScores.length}`);

  } catch (error) {
    console.error('Error checking missing scores:', error);
  } finally {
    await pool.end();
  }
}

checkMissingScores();
