import { GameStat, Game, Roster, Position, Player, allPositions, GameStatus } from '@shared/schema';
import { apiRequest } from './queryClient';
import { isForfeitGame, getForfeitGameScore } from './utils';
import { 
  getCachedScores, 
  cacheScores, 
  clearGameCache, 
  invalidateGameCache 
} from './scoresCache';

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
   * Fetch game statistics from the API - with mandatory cache bypass
   */
  async getGameStats(gameId: number): Promise<GameStat[]> {
    try {
      // Add timestamp to force a fresh network request every time
      const timestamp = new Date().getTime();
      const res = await apiRequest('GET', `/api/games/${gameId}/stats?_t=${timestamp}`);
      const stats = await res.json();
      console.log(`Fetched ${stats.length} fresh stats for game ${gameId}`);
      return stats;
    } catch (error) {
      console.error(`Error fetching stats for game ${gameId}:`, error);
      return [];
    }
  }
  
  /**
   * Fetch statistics for multiple games at once using the batch endpoint
   * This significantly reduces the number of network requests when loading multiple games
   */
  async getBatchGameStats(gameIds: number[]): Promise<Record<number, GameStat[]>> {
    try {
      // If no game IDs are provided, return an empty object
      if (!gameIds.length) {
        return {};
      }
      
      // Format the IDs for the query parameter
      const idsParam = gameIds.join(',');
      const timestamp = new Date().getTime(); // For cache busting if needed
      
      try {
        // Use the correct query parameter format - the backend expects 'gameIds' not 'ids'
        const url = `/api/games/stats/batch?gameIds=${idsParam}&_t=${timestamp}`;
        const statsMap = await apiRequest('GET', url);
        
        console.log(`Fetched batch stats for ${gameIds.length} games in a single request`);
        return statsMap;
      } catch (fetchError) {
        console.warn(`Batch stats fetch failed, falling back to individual fetches: ${fetchError}`);
        
        // Fallback to fetching each game's stats individually if batch fails
        const statsMap: Record<number, GameStat[]> = {};
        
        // Use Promise.allSettled to prevent one failure from breaking everything
        const results = await Promise.allSettled(
          gameIds.map(async (gameId) => {
            try {
              const stats = await apiRequest('GET', `/api/games/${gameId}/stats`);
              return { gameId, stats };
            } catch (individualError) {
              console.warn(`Failed to fetch stats for game ${gameId}: ${individualError}`);
              return { gameId, stats: [] };
            }
          })
        );
        
        // Process successful results
        results.forEach((result) => {
          if (result.status === 'fulfilled') {
            const { gameId, stats } = result.value;
            statsMap[gameId] = stats;
          }
        });
        
        console.log(`Completed fallback fetches for ${gameIds.length} games`);
        return statsMap;
      }
    } catch (error) {
      console.error(`Error in batch stats operation: ${error}`);
      return {};
    }
  }
  
  /**
   * Fetch game rosters from the API
   */
  async getGameRosters(gameId: number): Promise<Roster[]> {
    return apiRequest('GET', `/api/games/${gameId}/rosters`);
  }
  
  /**
   * Calculate game scores (for and against) by quarter and final
   * This is the critical function that updates scores everywhere
   * Now with enhanced global caching support
   */
  async calculateGameScores(gameId: number, forceRefresh: boolean = false): Promise<GameScores> {
    // Try to get from global cache first if not forcing refresh
    if (!forceRefresh) {
      const cachedScores = getCachedScores(gameId);
      if (cachedScores) {
        console.log(`Using cached scores for game ${gameId} from global cache`);
        return cachedScores;
      }
    }
    
    // First check if this is a forfeit game
    const game = await apiRequest('GET', `/api/games/${gameId}`);
    
    // Special handling for forfeit games - return scores based on forfeit type
    if (isForfeitGame(game)) {
      console.log(`Forfeit game detected (ID: ${gameId}, status: ${game.status}), returning appropriate forfeit score`);
      const forfeitScore = getForfeitGameScore(game);
      
      // Cache the forfeit score with game status for future use
      cacheScores(gameId, forfeitScore, undefined, game.status);
      
      return forfeitScore;
    }
    
    // For non-forfeit games, proceed with normal calculation
    // Only force a fresh data fetch if explicitly requested
    let stats;
    if (forceRefresh) {
      const timestamp = new Date().getTime();
      stats = await apiRequest('GET', `/api/games/${gameId}/stats?_t=${timestamp}`);
      console.log(`Calculating scores with ${stats.length} fresh stats for game ${gameId}`);
    } else {
      stats = await apiRequest('GET', `/api/games/${gameId}/stats`);
      console.log(`Calculating scores with ${stats.length} cached stats for game ${gameId}`);
    }
    
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
    stats.forEach((stat: GameStat) => {
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
    Object.values(latestPositionStats).forEach((stat: GameStat) => {
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
    
    const scores = {
      quarterScores,
      finalScore
    };
    
    // Cache the newly calculated scores for future use
    cacheScores(gameId, scores, stats);
    
    return scores;
  }
  
  /**
   * Get position-based statistics for a game
   */
  async getPositionStats(gameId: number, forceRefresh: boolean = false): Promise<Record<string, PositionStats>> {
    // First check if this is a forfeit game
    const game = await apiRequest('GET', `/api/games/${gameId}`);
    
    // Return empty stats for forfeit games
    if (isForfeitGame(game)) {
      console.log(`Forfeit game detected (ID: ${gameId}), returning empty position stats`);
      return {};
    }
    
    // Only force a fresh data fetch if explicitly requested
    let stats;
    if (forceRefresh) {
      const timestamp = new Date().getTime();
      stats = await apiRequest('GET', `/api/games/${gameId}/stats?_t=${timestamp}`);
      console.log(`Calculating position stats with ${stats.length} fresh stats for game ${gameId}`);
    } else {
      stats = await apiRequest('GET', `/api/games/${gameId}/stats`);
      console.log(`Calculating position stats with ${stats.length} cached stats for game ${gameId}`);
    }
    
    // Create a map of the latest stats for each position/quarter combination
    const positionStats: Record<string, PositionStats> = {};
    
    // Find the latest stat for each position/quarter combination
    stats.forEach((stat: GameStat) => {
      if (!stat || !stat.quarter || !stat.position) return;
      
      const key = `${stat.position}-${stat.quarter}`;
      
      // Skip if we already have a newer stat for this position/quarter
      if (positionStats[key] && stat.id) {
        // Skip this stat if we already have a newer one
        const existingStat = stats.find((s: GameStat) => 
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
  async mapStatsToPlayers(gameId: number, forceRefresh: boolean = false): Promise<Record<number, GameStat[]>> {
    // First check if this is a forfeit game
    const game = await apiRequest('GET', `/api/games/${gameId}`);
    
    // Return empty stats map for forfeit games
    if (isForfeitGame(game)) {
      console.log(`Forfeit game detected (ID: ${gameId}), returning empty player stats mapping`);
      return {};
    }
    
    // Only force a fresh data fetch if explicitly requested
    let stats, rosters;
    if (forceRefresh) {
      const timestamp = new Date().getTime();
      stats = await apiRequest('GET', `/api/games/${gameId}/stats?_t=${timestamp}`);
      rosters = await apiRequest('GET', `/api/games/${gameId}/rosters?_t=${timestamp}`);
      console.log(`Mapping ${stats.length} fresh stats to players for game ${gameId}`);
    } else {
      stats = await apiRequest('GET', `/api/games/${gameId}/stats`);
      rosters = await apiRequest('GET', `/api/games/${gameId}/rosters`);
      console.log(`Mapping ${stats.length} cached stats to players for game ${gameId}`);
    }
    
    // Group stats by player
    const statsByPlayer: Record<number, GameStat[]> = {};
    
    // Process each stat and map to the player who played that position
    stats.forEach((stat: GameStat) => {
      // Only process stats with valid position
      if (!stat.position) return;
      
      // Find which player was in this position for this quarter
      const playerInPosition = rosters.find((r: Roster) => 
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
    const allGames = gameIds 
      ? await Promise.all(gameIds.map(id => apiRequest('GET', `/api/games/${id}`)))
      : await apiRequest('GET', '/api/games');
    
    // Filter out forfeit games (they don't count for player statistics)
    const validGames = allGames.filter((g: Game) => !isForfeitGame(g));
    
    // Get IDs of non-forfeit games only
    const games = validGames.map((g: Game) => g.id);
    
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
      return apiRequest('PATCH', `/api/games/stats/${existingStat.id}`, statUpdate);
    } else {
      // Create new stat
      return apiRequest('POST', '/api/games/stats', statUpdate);
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

// Calculate game scores from statistics
export function calculateGameScores(stats: GameStat[]) {
  if (!stats || stats.length === 0) {
    return { teamScore: 0, opponentScore: 0 };
  }
  
  // For forfeit games, return standard 0-10 score
  if (stats.length > 0 && isForfeitGame({ id: stats[0].gameId } as Game)) {
    return { teamScore: 0, opponentScore: 10 };
  }
  
  // Calculate regular game scores
  const teamScore = stats.reduce((total, stat) => 
    total + (stat.goalsFor || 0), 0);
  
  const opponentScore = stats.reduce((total, stat) => 
    total + (stat.goalsAgainst || 0), 0);
  
  return { teamScore, opponentScore };
}

// Get appropriate color for game status
export function getGameStatusColor(status: GameStatus): string {
  const colorMap = {
    'upcoming': 'blue',
    'in-progress': 'amber',
    'completed': 'green',
    'forfeit-win': 'orange',
    'forfeit-loss': 'red'
  };
  
  return colorMap[status] || 'gray';
}

// Create a singleton instance for use throughout the app
export const statisticsService = new StatisticsService();