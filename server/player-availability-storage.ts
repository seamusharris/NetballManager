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

  async getPlayerAvailabilityForGame(gameId: number): Promise<number[]> {
    try {
      // First check if any availability records exist for this game
      const existingRecords = await db.execute(sql`
        SELECT COUNT(*) as count FROM player_availability WHERE game_id = ${gameId}
      `);

      const hasExistingRecords = parseInt(existingRecords.rows[0].count) > 0;

      if (!hasExistingRecords) {
        console.log(`No availability records found for game ${gameId}, creating default records...`);

        // Get all active players to create default availability records
        const playersResult = await db.execute(sql`
          SELECT id FROM players WHERE active = true
        `);

        console.log(`Found ${playersResult.rows.length} active players to create availability records for`);

        // Create availability records for all active players (default to available)
        // This applies to both upcoming and completed games that lack availability data
        for (const player of playersResult.rows) {
          try {
            // Use INSERT with WHERE NOT EXISTS to avoid duplicates
            const insertResult = await db.execute(sql`
              INSERT INTO player_availability (game_id, player_id, is_available, created_at, updated_at)
              SELECT ${gameId}, ${player.id}, true, NOW(), NOW()
              WHERE NOT EXISTS (
                SELECT 1 FROM player_availability 
                WHERE game_id = ${gameId} AND player_id = ${player.id}
              )
            `);
            
            // Check if a row was actually inserted
            if (insertResult.rowCount && insertResult.rowCount > 0) {
              console.log(`Created availability record for game ${gameId}, player ${player.id} (available by default)`);
            } else {
              console.log(`Availability record already exists for game ${gameId}, player ${player.id}`);
            }
          } catch (error: any) {
            // Handle any remaining errors gracefully
            console.error(`Error handling availability record for game ${gameId}, player ${player.id}:`, error.message);
            // Continue processing other players instead of stopping
            continue;
          }
        }

        console.log(`Created default availability records for game ${gameId}`);

        // Return all active player IDs as available
        return playersResult.rows.map(row => row.id as number);
      } else {
        console.log(`Found existing availability records for game ${gameId}`);
      }

      // Return existing availability records
      const result = await db.execute(sql`
        SELECT player_id 
        FROM player_availability 
        WHERE game_id = ${gameId} AND is_available = true
      `);

      return result.rows.map(row => row.player_id as number);
    } catch (error) {
      console.error('Error fetching player availability:', error);
      return [];
    }
  }

  async setPlayerAvailabilityForGame(gameId: number, availablePlayerIds: number[]): Promise<boolean> {
    try {
      // Start transaction
      await db.execute(sql`BEGIN`);

      // Get all active players to determine who should be marked as unavailable
      const allPlayersResult = await db.execute(sql`
        SELECT id FROM players WHERE active = true
      `);
      const allActivePlayerIds = allPlayersResult.rows.map(row => row.id as number);

      // Clear existing availability for this game
      await db.execute(sql`
        DELETE FROM player_availability WHERE game_id = ${gameId}
      `);

      // Insert records for all active players
      for (const playerId of allActivePlayerIds) {
        const isAvailable = availablePlayerIds.includes(playerId);
        await db.execute(sql`
          INSERT INTO player_availability (game_id, player_id, is_available, created_at, updated_at)
          VALUES (${gameId}, ${playerId}, ${isAvailable}, NOW(), NOW())
        `);
      }

      // Commit transaction
      await db.execute(sql`COMMIT`);
      return true;
    } catch (error) {
      // Rollback on error
      await db.execute(sql`ROLLBACK`);
      console.error('Error setting player availability:', error);
      return false;
    }
  }

  async updatePlayerAvailability(gameId: number, playerId: number, isAvailable: boolean): Promise<boolean> {
    try {
      // Try to update first
      const updateResult = await db.execute(sql`
        UPDATE player_availability 
        SET is_available = ${isAvailable}, updated_at = NOW()
        WHERE game_id = ${gameId} AND player_id = ${playerId}
      `);

      // If no rows were affected, insert a new record
      if (updateResult.rowCount === 0) {
        await db.execute(sql`
          INSERT INTO player_availability (game_id, player_id, is_available, created_at, updated_at)
          SELECT ${gameId}, ${playerId}, ${isAvailable}, NOW(), NOW()
          WHERE NOT EXISTS (
            SELECT 1 FROM player_availability 
            WHERE game_id = ${gameId} AND player_id = ${playerId}
          )
        `);
      }

      return true;
    } catch (error) {
      console.error('Error updating player availability:', error);
      return false;
    }
  }

  async clearAvailabilityForGame(gameId: number): Promise<boolean> {
    try {
      await db.execute(sql`
        DELETE FROM player_availability WHERE game_id = ${gameId}
      `);
      return true;
    } catch (error) {
      console.error('Error clearing game availability:', error);
      return false;
    }
  }
}

export const playerAvailabilityStorage = new PlayerAvailabilityStorage();