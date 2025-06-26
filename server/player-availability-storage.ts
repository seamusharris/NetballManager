import { db } from './db';
import { sql } from 'drizzle-orm';

export interface PlayerAvailability {
  id?: number;
  gameId: number;
  playerId: number;
  isAvailable: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class PlayerAvailabilityStorage {

  async getPlayerAvailabilityForGame(gameId: number, teamId?: number): Promise<number[]> {
    try {
      console.log(`Checking for existing availability records for game ${gameId}`);

      // First check if any availability records exist for this game
      const existingRecords = await db.execute(sql`
        SELECT COUNT(*) as count FROM player_availability WHERE game_id = ${gameId}
      `);

      const hasExistingRecords = parseInt(existingRecords.rows[0].count) > 0;

      if (!hasExistingRecords) {
        if (teamId) {
          console.log(`No availability records found for game ${gameId}, returning team ${teamId} players as available by default`);

          // Get the specific team's players and return them as available (don't create records)
          const teamPlayersResult = await db.execute(sql`
            SELECT p.id 
            FROM players p
            JOIN team_players tp ON p.id = tp.player_id
            WHERE tp.team_id = ${teamId} 
              AND p.active = true
          `);

          console.log(`Returning ${teamPlayersResult.rows.length} active team players as available by default for game ${gameId}`);
          return teamPlayersResult.rows.map(row => row.id as number);
        } else {
          console.log(`No availability records found for game ${gameId}, returning all active players as available by default`);

          // Fallback to all active players if no team specified
          const playersResult = await db.execute(sql`
            SELECT id FROM players WHERE active = true
          `);

          console.log(`Returning ${playersResult.rows.length} active players as available by default for game ${gameId}`);
          return playersResult.rows.map(row => row.id as number);
        }
      } else {
        console.log(`Found existing availability records for game ${gameId}`);
      }

      // Return existing availability records
      const result = await db.execute(sql`
        SELECT player_id 
        FROM player_availability 
        WHERE game_id = ${gameId} AND is_available = true
      `);

      const playerIds = result.rows.map(row => row.player_id as number);
      // Deduplicate player IDs to prevent frontend issues
      const uniquePlayerIds = [...new Set(playerIds)];
      console.log(`Returning ${uniquePlayerIds.length} available players for game ${gameId}`);
      return uniquePlayerIds;

    } catch (error) {
      console.error('Error fetching player availability:', error);

      // Fallback: return team players if teamId provided, otherwise all active players
      try {
        if (teamId) {
          const teamPlayersResult = await db.execute(sql`
            SELECT p.id 
            FROM players p
            JOIN team_players tp ON p.id = tp.player_id
            WHERE tp.team_id = ${teamId} 
              AND p.active = true
          `);

          console.log(`Fallback: returning ${teamPlayersResult.rows.length} active team players as available`);
          return teamPlayersResult.rows.map(row => row.id as number);
        } else {
          const playersResult = await db.execute(sql`
            SELECT id FROM players WHERE active = true
          `);

          console.log(`Fallback: returning ${playersResult.rows.length} active players as available`);
          return playersResult.rows.map(row => row.id as number);
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        return [];
      }
    }
  }

  async setPlayerAvailabilityForGame(gameId: number, availablePlayerIds: number[]): Promise<boolean> {
    const startTime = Date.now();
    console.log(`Setting availability for game ${gameId}: ${availablePlayerIds.length} players available`);

    try {
      // Use default isolation level with optimized upsert operation
      const result = await db.transaction(async (tx) => {
        // Get game info without locking (just for validation and team lookup)
        const gameResult = await tx.execute(sql`
          SELECT home_team_id, away_team_id 
          FROM games 
          WHERE id = ${gameId}
        `);
        
        if (gameResult.rows.length === 0) {
          throw new Error(`Game ${gameId} not found`);
        }

        const game = gameResult.rows[0] as any;
        const homeTeamId = game.home_team_id;

        // Get all team players (no locking needed for read-only data)
        const teamPlayersResult = await tx.execute(sql`
          SELECT p.id 
          FROM players p
          JOIN team_players tp ON p.id = tp.player_id
          WHERE tp.team_id = ${homeTeamId} AND p.active = true
          ORDER BY p.id
        `);
        
        const teamPlayerIds = teamPlayersResult.rows.map(row => row.id as number);
        console.log(`Found ${teamPlayerIds.length} team players for team ${homeTeamId}`);

        if (teamPlayerIds.length === 0) {
          console.warn(`No team players found for game ${gameId}, team ${homeTeamId}`);
          return true;
        }

        // Validate that availablePlayerIds only contains team players
        const validAvailablePlayerIds = availablePlayerIds.filter(id => teamPlayerIds.includes(id));
        if (validAvailablePlayerIds.length !== availablePlayerIds.length) {
          console.warn(`Filtered invalid player IDs: ${availablePlayerIds.filter(id => !teamPlayerIds.includes(id))}`);
        }

        // Use PostgreSQL UPSERT (INSERT ... ON CONFLICT) for better performance
        if (teamPlayerIds.length > 0) {
          const values = teamPlayerIds.map(playerId => {
            const isAvailable = validAvailablePlayerIds.includes(playerId);
            return `(${gameId}, ${playerId}, ${isAvailable}, NOW(), NOW())`;
          }).join(', ');

          await tx.execute(sql.raw(`
            INSERT INTO player_availability (game_id, player_id, is_available, created_at, updated_at)
            VALUES ${values}
            ON CONFLICT (game_id, player_id) 
            DO UPDATE SET 
              is_available = EXCLUDED.is_available,
              updated_at = EXCLUDED.updated_at
          `));
        }

        console.log(`Upserted ${teamPlayerIds.length} availability records for game ${gameId} in ${Date.now() - startTime}ms`);
        return true;
      });

      return result;
    } catch (error) {
      console.error(`Error setting player availability for game ${gameId}:`, error);
      return false;
    }
  }

  async updatePlayerAvailability(gameId: number, playerId: number, isAvailable: boolean): Promise<boolean> {
    try {
      console.log(`Updating availability for game ${gameId}, player ${playerId}: ${isAvailable ? 'available' : 'unavailable'}`);

      // Check if record exists first
      const existingRecord = await db.execute(sql`
        SELECT id FROM player_availability 
        WHERE game_id = ${gameId} AND player_id = ${playerId}
      `);

      if (existingRecord.rows.length > 0) {
        // Update existing record
        const updateResult = await db.execute(sql`
          UPDATE player_availability 
          SET is_available = ${isAvailable}, updated_at = NOW()
          WHERE game_id = ${gameId} AND player_id = ${playerId}
        `);
        console.log(`Updated existing availability record: ${updateResult.rowCount || 0} rows affected`);
      } else {
        // Insert new record
        await db.execute(sql`
          INSERT INTO player_availability (game_id, player_id, is_available, created_at, updated_at)
          VALUES (${gameId}, ${playerId}, ${isAvailable}, NOW(), NOW())
        `);
        console.log(`Created new availability record for game ${gameId}, player ${playerId}`);
      }

      return true;
    } catch (error) {
      console.error('Error updating player availability:', error);
      return false;
    }
  }

  async clearAvailabilityForGame(gameId: number): Promise<boolean> {
    try {
      console.log(`Clearing all availability records for game ${gameId}`);
      const result = await db.execute(sql`
        DELETE FROM player_availability WHERE game_id = ${gameId}
      `);
      console.log(`Cleared ${result.rowCount || 0} availability records for game ${gameId}`);
      return true;
    } catch (error) {
      console.error('Error clearing game availability:', error);
      return false;
    }
  }
}

export const playerAvailabilityStorage = new PlayerAvailabilityStorage();