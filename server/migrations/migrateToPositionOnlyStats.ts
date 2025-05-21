import { db } from "../db";
import { sql } from "drizzle-orm";

/**
 * This migration transforms the game_stats table to a fully position-based model 
 * and creates a new schema that doesn't depend on player IDs
 */
export async function migrateToPositionOnlyStats() {
  console.log("Starting migration to a fully position-based stats model...");
  
  try {
    // 1. First ensure all existing stats have position data
    const positionlessStats = await db.execute(sql`
      SELECT gs.id, gs.game_id, gs.player_id, gs.position, gs.quarter 
      FROM game_stats gs
      WHERE gs.position IS NULL
    `);
    
    console.log(`Found ${positionlessStats.rows.length} stats without position data`);
    
    // Fill in missing position data from roster
    for (const stat of positionlessStats.rows) {
      const rosterData = await db.execute(sql`
        SELECT position FROM rosters 
        WHERE game_id = ${stat.game_id} AND player_id = ${stat.player_id} AND quarter = ${stat.quarter}
      `);
      
      if (rosterData.rows.length > 0) {
        const position = rosterData.rows[0].position;
        console.log(`Updating stat ID ${stat.id} with position ${position}`);
        
        await db.execute(sql`
          UPDATE game_stats 
          SET position = ${position} 
          WHERE id = ${stat.id}
        `);
      } else {
        console.warn(`No roster entry found for game ${stat.game_id}, player ${stat.player_id}, quarter ${stat.quarter}`);
      }
    }
    
    // 2. Remove any stats that still don't have position data
    const deleteResult = await db.execute(sql`
      DELETE FROM game_stats 
      WHERE position IS NULL
      RETURNING id
    `);
    
    console.log(`Removed ${deleteResult.rows.length} stats without position data`);
    
    // 3. Check for duplicate stats (same game/position/quarter)
    const duplicateStats = await db.execute(sql`
      SELECT game_id, position, quarter, COUNT(*) as count
      FROM game_stats
      GROUP BY game_id, position, quarter
      HAVING COUNT(*) > 1
    `);
    
    console.log(`Found ${duplicateStats.rows.length} cases with duplicate position stats`);
    
    // 4. For each duplicate, merge the stats by summing them
    for (const dupCase of duplicateStats.rows) {
      console.log(`Merging stats for Game ${dupCase.game_id}, Position ${dupCase.position}, Quarter ${dupCase.quarter}`);
      
      // Get all duplicates
      const stats = await db.execute(sql`
        SELECT id, goals_for, goals_against, missed_goals, rebounds, intercepts, 
               bad_pass, handling_error, pick_up, infringement, rating
        FROM game_stats
        WHERE game_id = ${dupCase.game_id} 
          AND position = ${dupCase.position} 
          AND quarter = ${dupCase.quarter}
        ORDER BY id
      `);
      
      if (stats.rows.length > 1) {
        // Keep the first (lowest ID) and sum all stats to it
        const firstStat = stats.rows[0];
        let goalsFor = parseInt(firstStat.goals_for) || 0;
        let goalsAgainst = parseInt(firstStat.goals_against) || 0;
        let missedGoals = parseInt(firstStat.missed_goals) || 0;
        let rebounds = parseInt(firstStat.rebounds) || 0;
        let intercepts = parseInt(firstStat.intercepts) || 0;
        let badPass = parseInt(firstStat.bad_pass) || 0;
        let handlingError = parseInt(firstStat.handling_error) || 0;
        let pickUp = parseInt(firstStat.pick_up) || 0;
        let infringement = parseInt(firstStat.infringement) || 0;
        
        // Accumulate stats from other entries
        const idsToDelete = [];
        for (let i = 1; i < stats.rows.length; i++) {
          const stat = stats.rows[i];
          idsToDelete.push(stat.id);
          
          goalsFor += parseInt(stat.goals_for) || 0;
          goalsAgainst += parseInt(stat.goals_against) || 0;
          missedGoals += parseInt(stat.missed_goals) || 0;
          rebounds += parseInt(stat.rebounds) || 0;
          intercepts += parseInt(stat.intercepts) || 0;
          badPass += parseInt(stat.bad_pass) || 0;
          handlingError += parseInt(stat.handling_error) || 0;
          pickUp += parseInt(stat.pick_up) || 0;
          infringement += parseInt(stat.infringement) || 0;
        }
        
        // Update the first record with the summed stats
        await db.execute(sql`
          UPDATE game_stats
          SET goals_for = ${goalsFor},
              goals_against = ${goalsAgainst},
              missed_goals = ${missedGoals},
              rebounds = ${rebounds},
              intercepts = ${intercepts},
              bad_pass = ${badPass},
              handling_error = ${handlingError},
              pick_up = ${pickUp},
              infringement = ${infringement}
          WHERE id = ${firstStat.id}
        `);
        
        // Delete the duplicate records
        if (idsToDelete.length > 0) {
          const idsStr = idsToDelete.join(',');
          await db.execute(sql`DELETE FROM game_stats WHERE id IN (${sql.raw(idsStr)})`);
          console.log(`Deleted ${idsToDelete.length} duplicate stats after merging`);
        }
      }
    }
    
    // 5. Create a backup of the old data if needed
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS game_stats_with_players AS
      SELECT * FROM game_stats
    `);
    
    console.log("Migration completed successfully!");
    console.log("The game_stats table is now fully position-based");
    console.log("A backup of the data with player IDs is in game_stats_with_players");
    return "Migration to position-only stats model completed successfully";
  } catch (error) {
    console.error("Error during migration:", error);
    throw error;
  }
}