/**
 * Migration to add player_seasons table for many-to-many relationship
 * between players and seasons.
 */
import { db } from '../db';
import { playerSeasons } from '@shared/schema';
import { sql } from 'drizzle-orm';

/**
 * Add player_seasons table
 */
export async function addPlayerSeasonRelation() {
  console.log('Creating player_seasons table...');
  
  try {
    // Check if table exists
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'player_seasons'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      // Create the table
      await db.execute(sql`
        CREATE TABLE player_seasons (
          player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
          season_id INTEGER NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
          PRIMARY KEY (player_id, season_id)
        );
      `);
      
      console.log('Player-Season relationship table created successfully.');
      
      // Add all existing players to the active season (if one exists)
      const activeSeason = await db.query.seasons.findFirst({
        where: sql`is_active = true`
      });
      
      if (activeSeason) {
        console.log(`Associating all existing players with active season (${activeSeason.name})...`);
        
        const players = await db.query.players.findMany();
        
        if (players.length > 0) {
          // Build values for bulk insert
          const values = players.map(player => {
            return `(${player.id}, ${activeSeason.id})`;
          }).join(', ');
          
          await db.execute(sql`
            INSERT INTO player_seasons (player_id, season_id)
            VALUES ${sql.raw(values)}
            ON CONFLICT DO NOTHING;
          `);
          
          console.log(`Associated ${players.length} players with the active season.`);
        } else {
          console.log('No existing players to associate with the active season.');
        }
      } else {
        console.log('No active season found. Players will need to be manually associated with seasons.');
      }
      
      return true;
    } else {
      console.log('player_seasons table already exists. Skipping creation.');
      return false;
    }
  } catch (error) {
    console.error('Failed to create player_seasons table:', error);
    throw error;
  }
}

/**
 * Run the migration
 */
export async function runPlayerSeasonRelationMigration() {
  try {
    await addPlayerSeasonRelation();
    console.log('Player-Season relationship migration completed successfully.');
  } catch (error) {
    console.error('Player-Season relationship migration failed:', error);
    throw error;
  }
}

// Run the migration directly if this file is executed
if (require.main === module) {
  runPlayerSeasonRelationMigration()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Migration failed with error:', error);
      process.exit(1);
    });
}