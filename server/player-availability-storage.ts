` tags.

```text
The code has been modified to fix the fallback logic to return all active players instead of an empty array when the primary query fails.
```

```
<replit_final_file>
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
      console.log(`Checking for existing availability records for game ${gameId}`);

      // First check if any availability records exist for this game
      const existingRecords = await db.execute(sql`
        SELECT COUNT(*) as count FROM player_availability WHERE game_id = ${gameId}
      `);

      const hasExistingRecords = parseInt(existingRecords.rows[0].count) > 0;

      if (!hasExistingRecords) {
        console.log(`No availability records found for game ${gameId}, returning all active players as available by default`);

        // Get all active players and return them as available (don't create records)
        const playersResult = await db.execute(sql`
          SELECT id FROM players WHERE active = true
        `);

        console.log(`Returning ${playersResult.rows.length} active players as available by default for game ${gameId}`);
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

      console.log(`Returning ${result.rows.length} available players for game ${gameId}`);
      return result.rows.map(row => row.player_id as number);

    } catch (error) {
      console.error('Error fetching player availability:', error);

      // Fallback: return all active players as available
      try {
        const playersResult = await db.execute(sql`
          SELECT id FROM players WHERE active = true
        `);

        console.log(`Fallback: returning ${playersResult.rows.length} active players as available`);
        return playersResult.rows.map(row => row.id as number);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        return [];
      }
    }
  }

  async setPlayerAvailabilityForGame(gameId: number, availablePlayerIds: number[]): Promise<boolean> {
    try {
      console.log(`Setting availability for game ${gameId}: ${availablePlayerIds.length} players available`);

      // Start transaction
      await db.execute(sql`BEGIN`);

      try {
        // Get all active players to determine who should be marked as unavailable
        const allPlayersResult = await db.execute(sql`
          SELECT id FROM players WHERE active = true
        `);
        const allActivePlayerIds = allPlayersResult.rows.map(row => row.id as number);
        console.log(`Found ${allActivePlayerIds.length} active players total`);

        // Clear existing availability for this game
        const deleteResult = await db.execute(sql`
          DELETE FROM player_availability WHERE game_id = ${gameId}
        `);
        console.log(`Deleted ${deleteResult.rowCount || 0} existing availability records for game ${gameId}`);

        // Insert records for all active players
        let insertedCount = 0;
        for (const playerId of allActivePlayerIds) {
          const isAvailable = availablePlayerIds.includes(playerId);
          await db.execute(sql`
            INSERT INTO player_availability (game_id, player_id, is_available, created_at, updated_at)
            VALUES (${gameId}, ${playerId}, ${isAvailable}, NOW(), NOW())
          `);
          insertedCount++;
        }

        console.log(`Inserted ${insertedCount} availability records for game ${gameId}`);

        // Commit transaction
        await db.execute(sql`COMMIT`);
        return true;
      } catch (error) {
        // Rollback on error
        await db.execute(sql`ROLLBACK`);
        throw error;
      }
    } catch (error) {
      console.error('Error setting player availability:', error);
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