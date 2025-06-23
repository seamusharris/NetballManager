
import { createTeamGameAwardsTable } from './migrations/createTeamGameAwardsTable';
import { sql } from 'drizzle-orm';
import { db } from './db';

async function runAwardsMigration() {
  console.log('Starting game awards migration...');
  console.log(new Date().toLocaleTimeString(), '[migration] Starting migration of game awards to team_game_awards');

  try {
    // Step 1: Create the new table
    const tableCreated = await createTeamGameAwardsTable();
    if (!tableCreated) {
      throw new Error('Failed to create team_game_awards table');
    }

    // Step 2: Migrate existing award winners from games table
    console.log(new Date().toLocaleTimeString(), '[migration] Migrating existing award winners...');
    
    const existingAwards = await db.execute(sql`
      SELECT g.id as game_id, g.award_winner_id, g.home_team_id, g.away_team_id
      FROM games g 
      WHERE g.award_winner_id IS NOT NULL
    `);

    console.log(new Date().toLocaleTimeString(), `[migration] Found ${existingAwards.rows.length} existing awards to migrate`);

    let migratedCount = 0;
    for (const award of existingAwards.rows) {
      try {
        // For each existing award, we need to determine which team the player belongs to
        // Check if the player is on the home team or away team roster
        const playerTeamCheck = await db.execute(sql`
          SELECT DISTINCT tp.team_id, t.name as team_name
          FROM team_players tp
          JOIN teams t ON tp.team_id = t.id
          WHERE tp.player_id = ${award.award_winner_id}
            AND (tp.team_id = ${award.home_team_id} OR tp.team_id = ${award.away_team_id})
        `);

        if (playerTeamCheck.rows.length > 0) {
          const teamId = playerTeamCheck.rows[0].team_id;
          
          // Insert into new team_game_awards table
          await db.execute(sql`
            INSERT INTO team_game_awards (game_id, team_id, player_id, award_type, entered_by, created_at, updated_at)
            VALUES (${award.game_id}, ${teamId}, ${award.award_winner_id}, 'player_of_match', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT (game_id, team_id, award_type) DO UPDATE SET
              player_id = EXCLUDED.player_id,
              updated_at = CURRENT_TIMESTAMP
          `);
          
          migratedCount++;
          console.log(new Date().toLocaleTimeString(), `[migration] Migrated award for game ${award.game_id}, team ${teamId}, player ${award.award_winner_id}`);
        } else {
          console.warn(new Date().toLocaleTimeString(), `[migration] Could not determine team for player ${award.award_winner_id} in game ${award.game_id}`);
        }
      } catch (error) {
        console.error(new Date().toLocaleTimeString(), `[migration] Error migrating award for game ${award.game_id}:`, error);
      }
    }

    console.log(new Date().toLocaleTimeString(), `[migration] Successfully migrated ${migratedCount} awards`);
    
    // Note: We're not removing the award_winner_id column from games yet
    // This allows for a gradual migration and rollback if needed
    console.log(new Date().toLocaleTimeString(), '[migration] Award migration completed successfully');
    
    return true;
  } catch (error) {
    console.error(new Date().toLocaleTimeString(), '[migration] Award migration failed:', error);
    return false;
  }
}

// Run the migration
runAwardsMigration()
  .then((success) => {
    if (success) {
      console.log('✅ Game awards migration completed successfully');
      process.exit(0);
    } else {
      console.log('❌ Game awards migration failed');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('Migration error:', error);
    process.exit(1);
  });
