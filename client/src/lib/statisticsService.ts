import { GameStat, Game, Roster, Position } from '@shared/schema';
import { apiRequest } from './queryClient';

/**
 * Interface for game score information
 */
export interface GameScores {
  quarterScores: {
    '1': { for: number, against: number },
    '2': { for: number, against: number },
    '3': { for: number, against: number },
    '4': { for: number, against: number }
  };
  finalScore: {
    for: number,
    against: number
  };
}

/**
 * Interface for position-based statistics
 */
export interface PositionStats {
  gameId: number;
  quarter: number;
  position: Position;
  goalsFor: number;
  goalsAgainst: number;
  missedGoals: number;
  rebounds: number;
  intercepts: number;
  badPass: number;
  handlingError: number;
  pickUp: number;
  infringement: number;
  rating: number | null;
}

/**
 * Interface for player performance statistics
 */
export interface PlayerPerformance {
  playerId: number;
  gamesPlayed: number;
  goals: number;
  goalsAgainst: number;
  missedGoals: number;
  rebounds: number;
  intercepts: number;
  badPass: number;
  handlingError: number;
  pickUp: number;
  infringement: number;
  rating: number;
  quartersByPosition: Record<Position, number>;
}

/**
 * Interface for game statistics update
 */
export interface StatUpdate {
  id?: number;
  gameId: number;
  position: Position;
  quarter: number;
  goalsFor?: number;
  goalsAgainst?: number;
  missedGoals?: number;
  rebounds?: number;
  intercepts?: number;
  badPass?: number;
  handlingError?: number;
  pickUp?: number;
  infringement?: number;
  rating?: number | null;
}

/**
 * Centralized service for all statistics calculations and operations
 */
export class StatisticsService {
  
  /**
   * Fetch game statistics from the API
   */
  async getGameStats(gameId: number): Promise<GameStat[]> {
    try {
      const stats = await apiRequest(`/api/games/${gameId}/stats`);
      console.log(`Fetched ${stats.length} stats for game ${gameId}`);
      // Force refresh the cache to ensure we have the latest data
      setTimeout(() => {
        console.log(`Refreshing statistics data for game ${gameId}`);
      }, 1000);
      return stats;
    } catch (error) {
      console.error(`Error fetching stats for game ${gameId}:`, error);
      return [];
    }
  }
  
  /**
   * Fetch game rosters from the API
   */
  async getGameRosters(gameId: number): Promise<Roster[]> {
    return apiRequest(`/api/games/${gameId}/rosters`);
  }
  
  /**
   * Calculate game scores (for and against) by quarter and final
   */
  async calculateGameScores(gameId: number): Promise<GameScores> {
    const stats = await this.getGameStats(gameId);
    
    // Initialize score structure
    const quarterScores = {
      '1': { for: 0, against: 0 },
      '2': { for: 0, against: 0 },
      '3': { for: 0, against: 0 },
      '4': { for: 0, against: 0 }
    };
    
    // Create a map of the latest stats for each position/quarter combination
    const latestPositionStats: Record<string, GameStat> = {};
    
    // Find the latest stat for each position/quarter combination
    stats.forEach(stat => {
      if (!stat || !stat.quarter) return;
      
      // For position-based stats (with valid position)
      if (stat.position) {
        const key = `${stat.position}-${stat.quarter}`;
        
        // Always use the data with the highest ID value for each position/quarter
        if (!latestPositionStats[key] || stat.id > latestPositionStats[key].id) {
          latestPositionStats[key] = stat;
        }
      }
      // For legacy stats (with null position but valid data)
      else {
        // Only include legacy stats if they have valid goal data
        if (typeof stat.goalsFor === 'number' || typeof stat.goalsAgainst === 'number') {
          // Use a special key format for legacy stats
          const key = `legacy-${stat.id}-${stat.quarter}`;
          latestPositionStats[key] = stat;
        }
      }
    });
    
    // Sum up goals from all positions for each quarter
    Object.values(latestPositionStats).forEach(stat => {
      if (stat && stat.quarter >= 1 && stat.quarter <= 4) {
        const quarterKey = stat.quarter.toString() as '1' | '2' | '3' | '4';
        quarterScores[quarterKey].for += (stat.goalsFor || 0);
        quarterScores[quarterKey].against += (stat.goalsAgainst || 0);
      }
    });
    
    // Calculate final score
    const finalScore = {
      for: quarterScores['1'].for + quarterScores['2'].for + 
           quarterScores['3'].for + quarterScores['4'].for,
      against: quarterScores['1'].against + quarterScores['2'].against +
               quarterScores['3'].against + quarterScores['4'].against
    };
    
    return {
      quarterScores,
      finalScore
    };
  }
  
  /**
   * Get position-based statistics for a game
   */
  async getPositionStats(gameId: number): Promise<Record<string, PositionStats>> {
    const stats = await this.getGameStats(gameId);
    
    // Create a map of the latest stats for each position/quarter combination
    const positionStats: Record<string, PositionStats> = {};
    
    // Find the latest stat for each position/quarter combination
    stats.forEach(stat => {
      if (!stat || !stat.quarter || !stat.position) return;
      
      const key = `${stat.position}-${stat.quarter}`;
      
      // Skip if we already have a newer stat for this position/quarter
      if (positionStats[key] && stat.id) {
        // Skip this stat if we already have a newer one
        const existingStat = stats.find(s => 
          s.position === stat.position && 
          s.quarter === stat.quarter && 
          s.id > stat.id
        );
        if (existingStat) return;
      }
      
      // Convert to PositionStats interface
      positionStats[key] = {
        gameId: stat.gameId,
        quarter: stat.quarter,
        position: stat.position,
        goalsFor: stat.goalsFor || 0,
        goalsAgainst: stat.goalsAgainst || 0,
        missedGoals: stat.missedGoals || 0,
        rebounds: stat.rebounds || 0,
        intercepts: stat.intercepts || 0,
        badPass: stat.badPass || 0,
        handlingError: stat.handlingError || 0,
        pickUp: stat.pickUp || 0,
        infringement: stat.infringement || 0,
        rating: stat.rating
      };
    });
    
    return positionStats;
  }
  
  /**
   * Map position-based statistics to player statistics using roster information
   */
  async mapStatsToPlayers(gameId: number): Promise<Record<number, GameStat[]>> {
    const stats = await this.getGameStats(gameId);
    const rosters = await this.getGameRosters(gameId);
    
    // Group stats by player
    const statsByPlayer: Record<number, GameStat[]> = {};
    
    // Process each stat and map to the player who played that position
    stats.forEach(stat => {
      // Only process stats with valid position
      if (!stat.position) return;
      
      // Find which player was in this position for this quarter
      const playerInPosition = rosters.find(r => 
        r.quarter === stat.quarter && 
        r.position === stat.position &&
        r.gameId === gameId
      );
      
      // If we found the player, add this stat to their collection
      if (playerInPosition) {
        const playerId = playerInPosition.playerId;
        
        if (!statsByPlayer[playerId]) {
          statsByPlayer[playerId] = [];
        }
        
        statsByPlayer[playerId].push(stat);
      }
    });
    
    return statsByPlayer;
  }
  
  /**
   * Calculate player performance statistics across all games
   */
  async calculatePlayerPerformance(playerId: number, gameIds?: number[]): Promise<PlayerPerformance> {
    // Get all games if not specified
    const games = gameIds || (await apiRequest('/api/games')).map((g: Game) => g.id);
    
    // Initialize player performance
    const performance: PlayerPerformance = {
      playerId,
      gamesPlayed: 0,
      goals: 0,
      goalsAgainst: 0,
      missedGoals: 0,
      rebounds: 0,
      intercepts: 0,
      badPass: 0,
      handlingError: 0,
      pickUp: 0,
      infringement: 0,
      rating: 0,
      quartersByPosition: {
        'GS': 0, 'GA': 0, 'WA': 0, 'C': 0, 'WD': 0, 'GD': 0, 'GK': 0
      }
    };
    
    // Track games this player participated in
    const gamesPlayed = new Set<number>();
    let totalRating = 0;
    let ratingCount = 0;
    
    // Process each game
    for (const gameId of games) {
      // Get rosters for this game to determine positions played
      const rosters = await this.getGameRosters(gameId);
      
      // Find the positions this player played in this game
      const playerPositions = rosters.filter(r => r.playerId === playerId);
      
      // If player didn't play in this game, skip it
      if (playerPositions.length === 0) continue;
      
      // Mark this game as played
      gamesPlayed.add(gameId);
      
      // Count quarters by position
      playerPositions.forEach(roster => {
        performance.quartersByPosition[roster.position]++;
      });
      
      // Get stats for this game
      const gameStats = await this.getGameStats(gameId);
      
      // Find the stats for positions this player played
      playerPositions.forEach(roster => {
        const playerStat = gameStats.find(s => 
          s.position === roster.position && 
          s.quarter === roster.quarter
        );
        
        if (playerStat) {
          // Add to performance totals
          performance.goals += playerStat.goalsFor || 0;
          performance.goalsAgainst += playerStat.goalsAgainst || 0;
          performance.missedGoals += playerStat.missedGoals || 0;
          performance.rebounds += playerStat.rebounds || 0;
          performance.intercepts += playerStat.intercepts || 0;
          performance.badPass += playerStat.badPass || 0;
          performance.handlingError += playerStat.handlingError || 0;
          performance.pickUp += playerStat.pickUp || 0;
          performance.infringement += playerStat.infringement || 0;
          
          // Only include ratings from quarter 1
          if (playerStat.quarter === 1 && playerStat.rating !== null) {
            totalRating += playerStat.rating;
            ratingCount++;
          }
        }
      });
    }
    
    // Calculate final values
    performance.gamesPlayed = gamesPlayed.size;
    performance.rating = ratingCount > 0 ? Math.round(totalRating / ratingCount) : 5;
    
    return performance;
  }
  
  /**
   * Create or update game statistics
   */
  async updateGameStats(statUpdate: StatUpdate): Promise<GameStat> {
    // Check if we have an existing stat
    const existingStats = await this.getGameStats(statUpdate.gameId);
    const existingStat = existingStats.find(s => 
      s.position === statUpdate.position && 
      s.quarter === statUpdate.quarter
    );
    
    if (existingStat) {
      // Update existing stat
      return apiRequest(`/api/gamestats/${existingStat.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(statUpdate)
      });
    } else {
      // Create new stat
      return apiRequest('/api/gamestats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(statUpdate)
      });
    }
  }
  
  /**
   * Batch update multiple game statistics
   */
  async batchUpdateGameStats(statUpdates: StatUpdate[]): Promise<GameStat[]> {
    const results: GameStat[] = [];
    
    for (const update of statUpdates) {
      const result = await this.updateGameStats(update);
      results.push(result);
    }
    
    return results;
  }
}

// Create a singleton instance for use throughout the app
export const statisticsService = new StatisticsService();