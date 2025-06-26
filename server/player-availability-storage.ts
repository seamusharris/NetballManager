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
  // Cache team players to avoid repeated queries
  private teamPlayersCache = new Map<number, { playerIds: number[], timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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
      }

      // Return existing availability records - only those marked as available
      const result = await db.execute(sql`
        SELECT player_id 
        FROM player_availability 
        WHERE game_id = ${gameId} AND is_available = true
      `);

      const playerIds = result.rows.map(row => row.player_id as number);
      const uniquePlayerIds = [...new Set(playerIds)];
      console.log(`Returning ${uniquePlayerIds.length} available players for game ${gameId} (from existing records)`);
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

  private async getTeamPlayers(gameId: number): Promise<number[]> {
    const cached = this.teamPlayersCache.get(gameId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log(`📋 Using cached team players for game ${gameId}: ${cached.playerIds.length} players`);
      return cached.playerIds;
    }

    console.log(`🔍 Fetching team players for game ${gameId}`);
    const startTime = Date.now();

    // Step 1: Get home team ID (fast single table lookup)
    const gameResult = await db.execute(sql`
      SELECT home_team_id FROM games WHERE id = ${gameId}
    `);

    if (gameResult.rows.length === 0) {
      console.warn(`Game ${gameId} not found`);
      return [];
    }

    const homeTeamId = gameResult.rows[0].home_team_id as number;

    // Step 2: Get team players (fast with proper indexes)
    const playersResult = await db.execute(sql`
      SELECT p.id 
      FROM players p
      JOIN team_players tp ON p.id = tp.player_id
      WHERE tp.team_id = ${homeTeamId} AND p.active = true
      ORDER BY p.id
    `);

    const playerIds = playersResult.rows.map(row => row.id as number);

    // Cache the result
    this.teamPlayersCache.set(gameId, {
      playerIds,
      timestamp: Date.now()
    });

    console.log(`✅ Fetched ${playerIds.length} team players for game ${gameId} in ${Date.now() - startTime}ms`);
    return playerIds;
  }

  async setPlayerAvailabilityForGame(gameId: number, availablePlayerIds: number[]): Promise<boolean> {
    const startTime = Date.now();
    console.log(`🚀 Setting availability for game ${gameId}: ${availablePlayerIds.length} players available`);

    try {
      // Get team players (cached and optimized)
      const teamPlayerIds = await this.getTeamPlayers(gameId);

      if (teamPlayerIds.length === 0) {
        console.warn(`No team players found for game ${gameId}`);
        return true;
      }

      // Filter to only valid player IDs
      const validAvailablePlayerIds = availablePlayerIds.filter(id => teamPlayerIds.includes(id));

      // Use transaction with proper UPSERT to prevent race conditions
      await db.transaction(async (tx) => {
        // Step 1: Delete existing records for this game only
        console.log(`🗑️ Deleting existing availability records for game ${gameId}`);
        await tx.execute(sql`DELETE FROM player_availability WHERE game_id = ${gameId}`);

        // Step 2: Insert new records using proper UPSERT to handle concurrent access
        if (validAvailablePlayerIds.length > 0) {
          console.log(`💾 Upserting ${validAvailablePlayerIds.length} availability records`);

          // Insert each player individually to avoid constraint violations
          for (const playerId of validAvailablePlayerIds) {
            await tx.execute(sql`
              INSERT INTO player_availability (game_id, player_id, is_available, created_at, updated_at)
              VALUES (${gameId}, ${playerId}, true, NOW(), NOW())
              ON CONFLICT (game_id, player_id) 
              DO UPDATE SET 
                is_available = true,
                updated_at = NOW()
            `);
          }
        }
      });

      const duration = Date.now() - startTime;
      console.log(`✅ Updated availability for ${validAvailablePlayerIds.length}/${teamPlayerIds.length} players in game ${gameId} in ${duration}ms`);

      // Clear cache for this game to ensure consistency
      this.teamPlayersCache.delete(gameId);

      return true;
    } catch (error) {
      console.error(`❌ Error setting player availability for game ${gameId}:`, error);
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

  async setExplicitlyEmptyAvailability(gameId: number): Promise<boolean> {
    const startTime = Date.now();
    console.log(`🚫 Setting explicitly empty availability for game ${gameId} (Select None)`);

    try {
      // Get team players to create explicit unavailable records
      const teamPlayerIds = await this.getTeamPlayers(gameId);

      if (teamPlayerIds.length === 0) {
        console.warn(`No team players found for game ${gameId}`);
        return true;
      }

      // Use transaction to set all players as explicitly unavailable
      await db.transaction(async (tx) => {
        // Step 1: Delete existing records for this game
        console.log(`🗑️ Deleting existing availability records for game ${gameId}`);
        await tx.execute(sql`DELETE FROM player_availability WHERE game_id = ${gameId}`);

        // Step 2: Create explicit unavailable records for all team players
        console.log(`💾 Creating explicit unavailable records for ${teamPlayerIds.length} players`);
        
        for (const playerId of teamPlayerIds) {
          await tx.execute(sql`
            INSERT INTO player_availability (game_id, player_id, is_available, created_at, updated_at)
            VALUES (${gameId}, ${playerId}, false, NOW(), NOW())
          `);
        }
      });

      const duration = Date.now() - startTime;
      console.log(`✅ Set explicitly empty availability for ${teamPlayerIds.length} players in game ${gameId} in ${duration}ms`);

      // Clear cache for this game to ensure consistency
      this.teamPlayersCache.delete(gameId);

      return true;
    } catch (error) {
      console.error(`❌ Error setting explicitly empty availability for game ${gameId}:`, error);
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