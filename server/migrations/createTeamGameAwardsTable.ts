
import { sql } from "drizzle-orm";
import { db } from "../db";

export async function createTeamGameAwardsTable() {
  console.log('Creating team_game_awards table...');
  
  try {
    // Create the team_game_awards table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS team_game_awards (
        id SERIAL PRIMARY KEY,
        game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
        team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
        award_type VARCHAR(50) DEFAULT 'player_of_match' NOT NULL,
        entered_by INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(game_id, team_id, award_type)
      )
    `);

    // Create indexes for better performance
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_team_game_awards_game_team 
      ON team_game_awards(game_id, team_id)
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_team_game_awards_player 
      ON team_game_awards(player_id)
    `);

    console.log('team_game_awards table created successfully');
    return true;
  } catch (error) {
    console.error('Error creating team_game_awards table:', error);
    return false;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createTeamGameAwardsTable()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}
