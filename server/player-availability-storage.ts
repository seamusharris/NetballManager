
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
      // Check if record exists first, then update or insert accordingly
      const existingRecord = await db.execute(sql`
        SELECT id FROM player_availability 
        WHERE game_id = ${gameId} AND player_id = ${playerId}
      `);
      
      if (existingRecord.rows.length > 0) {
        // Update existing record
        await db.execute(sql`
          UPDATE player_availability 
          SET is_available = ${isAvailable}, updated_at = NOW()
          WHERE game_id = ${gameId} AND player_id = ${playerId}
        `);
      } else {
        // Insert new record
        await db.execute(sql`
          INSERT INTO player_availability (game_id, player_id, is_available, created_at, updated_at)
          VALUES (${gameId}, ${playerId}, ${isAvailable}, NOW(), NOW())
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
