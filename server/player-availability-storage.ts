
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
      
      // Clear existing availability for this game
      await db.execute(sql`
        DELETE FROM player_availability WHERE game_id = ${gameId}
      `);
      
      // Insert new availability records
      if (availablePlayerIds.length > 0) {
        for (const playerId of availablePlayerIds) {
          await db.execute(sql`
            INSERT INTO player_availability (game_id, player_id, is_available, created_at, updated_at)
            VALUES (${gameId}, ${playerId}, true, NOW(), NOW())
          `);
        }
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
      if (isAvailable) {
        // Insert or update to available
        await db.execute(sql`
          INSERT INTO player_availability (game_id, player_id, is_available, created_at, updated_at)
          VALUES (${gameId}, ${playerId}, true, NOW(), NOW())
          ON CONFLICT (game_id, player_id) 
          DO UPDATE SET is_available = true, updated_at = NOW()
        `);
      } else {
        // Remove availability record (not available)
        await db.execute(sql`
          DELETE FROM player_availability 
          WHERE game_id = ${gameId} AND player_id = ${playerId}
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
