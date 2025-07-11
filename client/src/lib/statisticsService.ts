import { GameStat, Game, Roster, Position, Player, allPositions, GameStatus } from '@shared/schema';
import { apiRequest } from './apiClient';
import { isForfeitGame, getForfeitGameScore } from './utils';
import { 
  getCachedScores, 
  cacheScores, 
  clearGameCache, 
  invalidateGameCache 
} from './scoresCache';
import { invalidateAfterStatsSave, invalidateAfterScoreUpdate } from './cacheInvalidation';
import { safeInvalidate } from './cacheInvalidationErrorHandler';

/**
 * Unified Statistics Service - handles all game statistics operations
 */
class UnifiedStatisticsService {
  // Cache for batch operations to avoid duplicate requests
  private batchCache = new Map<string, Promise<any>>();
  // Cache for frequently accessed data
  private frequentDataCache = new Map<string, { data: any; timestamp: number }>();
  private readonly FREQUENT_CACHE_TTL = 2 * 60 * 1000; // 2 minutes

  /**
   * Clear all batch caches
   */
  clearBatchCache(): void {
    this.batchCache.clear();
    this.frequentDataCache.clear();
  }

  /**
   * Calculate scores directly from provided stats without API calls
   * Delegates to gameScoreService for consistency
   */
  async calculateScoresFromStats(stats: GameStat[], gameId: number): Promise<GameScores> {
    // Import gameScoreService dynamically to avoid circular dependencies
    const { gameScoreService } = await import('./gameScoreService');
    
    // Use synchronous version for consistency
    const gameScores = gameScoreService.calculateGameScoresSync(stats, undefined, undefined, false, undefined, undefined, undefined, undefined);
    
    // Convert to legacy format for backward compatibility
    const quarterScores: Record<string, { for: number; against: number }> = {};
    gameScores.quarterScores.forEach(q => {
      quarterScores[q.quarter.toString()] = { for: q.teamScore, against: q.opponentScore };
    });

    return {
      quarterScores,
      finalScore: { for: gameScores.totalTeamScore, against: gameScores.totalOpponentScore }
    };
  }

  /**
   * Calculate position stats directly from provided stats without API calls
   */
  async calculatePositionStatsFromStats(stats: GameStat[], gameId: number): Promise<any> {
    if (!stats || stats.length === 0) {
      return {};
    }

    // Group stats by position and quarter
    const positionStats: Record<string, Record<number, any>> = {};

    stats.forEach(stat => {
      if (!positionStats[stat.position]) {
        positionStats[stat.position] = {};
      }
      if (!positionStats[stat.position][stat.quarter]) {
        positionStats[stat.position][stat.quarter] = {
          goalsFor: 0,
          goalsAgainst: 0,
          missedGoals: 0,
          rebounds: 0,
          intercepts: 0,
          deflections: 0,
          turnovers: 0,
          gains: 0,
          receives: 0,
          penalties: 0,
          totalRating: 0,
          ratingCount: 0
        };
      }

      const quarterStats = positionStats[stat.position][stat.quarter];
      quarterStats.goalsFor += stat.goalsFor || 0;
      quarterStats.goalsAgainst += stat.goalsAgainst || 0;
      quarterStats.missedGoals += stat.missedGoals || 0;
      quarterStats.rebounds += stat.rebounds || 0;
      quarterStats.intercepts += stat.intercepts || 0;
      quarterStats.deflections += stat.deflections || 0;
      quarterStats.turnovers += stat.turnovers || 0;
      quarterStats.gains += stat.gains || 0;
      quarterStats.receives += stat.receives || 0;
      quarterStats.penalties += stat.penalties || 0;

      if (stat.rating !== null && stat.rating !== undefined) {
        quarterStats.totalRating += stat.rating;
        quarterStats.ratingCount += 1;
      }
    });

    return positionStats;
  }

  /**
   * Map stats to players directly from provided stats without API calls
   */
  async mapStatsToPlayersFromStats(stats: GameStat[], gameId: number): Promise<any> {
    if (!stats || stats.length === 0) {
      return {};
    }

    // For now, return the stats grouped by position since we don't have player mapping in the stats
    // This would need roster data to properly map to players
    const playerMapping: Record<string, any[]> = {};

    stats.forEach(stat => {
      const key = `${stat.position}-Q${stat.quarter}`;
      if (!playerMapping[key]) {
        playerMapping[key] = [];
      }
      playerMapping[key].push(stat);
    });

    return playerMapping;
  }

  /**
   * Get frequently accessed data from cache
   */
  private getFrequentCache<T>(key: string): T | null {
    const cached = this.frequentDataCache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.FREQUENT_CACHE_TTL) {
      return cached.data;
    }
    return null;
  }

  /**
   * Set frequently accessed data in cache
   */
  private setFrequentCache(key: string, data: any): void {
    this.frequentDataCache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Get stats for multiple games efficiently using batch endpoint
   */
  async getBatchGameStats(gameIds: number[]): Promise<Record<number, GameStat[]>> {
    console.log(`🚀 BATCH STATS CALLED with games:`, gameIds);
    if (!gameIds || gameIds.length === 0) {
      return {};
    }

    // Filter out invalid IDs
    const validIds = gameIds.filter(id => id && typeof id === 'number' && id > 0 && !isNaN(id));
    if (validIds.length === 0) {
      return {};
    }

    try {
      // Use POST method with proper authentication via apiRequest
      const result = await apiRequest('POST', '/api/games/stats/batch', { gameIds: validIds });
      console.log(`🔍 RAW BATCH STATS RESULT for games ${validIds}:`, result);
      
      // ALWAYS process through opponent perspective to ensure Matrix team gets stats
      console.log(`🎯 ABOUT TO PROCESS OPPONENT PERSPECTIVE - Raw result:`, result);
      const processedResult = await this.processStatsWithOpponentPerspective(result || {});
      console.log(`✅ PROCESSED BATCH STATS RESULT: Found stats for ${Object.keys(processedResult).length} games`);
      
      // Special check for game 80 Matrix team
      if (processedResult[80]) {
        const team1Stats = processedResult[80].filter(s => s.teamId === 1);
        const team123Stats = processedResult[80].filter(s => s.teamId === 123);
        console.log(`🏀 GAME 80 FINAL CHECK: Team 1 has ${team1Stats.length} stats, Team 123 has ${team123Stats.length} stats`);
      }
      
      return processedResult;
    } catch (error) {
      console.error('getBatchGameStats: Error fetching batch stats:', error);
      // Fallback to individual requests using apiRequest
      return this.fallbackIndividualFetch(validIds);
    }
  }

  /**
   * Process stats to generate missing team perspectives from opponent data
   */
  private async processStatsWithOpponentPerspective(statsMap: Record<number, GameStat[]>): Promise<Record<number, GameStat[]>> {
    console.log(`🎯 PROCESSING OPPONENT PERSPECTIVE for ${Object.keys(statsMap).length} games`);
    const processedStats: Record<number, GameStat[]> = {};

    for (const [gameIdStr, stats] of Object.entries(statsMap)) {
      const gameId = parseInt(gameIdStr);
      processedStats[gameId] = [...stats]; // Start with existing stats

      console.log(`🏀 Processing game ${gameId} with ${stats.length} stats`);
      
      if (stats.length === 0) {
        console.log(`⚠️ Skipping game ${gameId} - no stats found`);
        continue;
      }

      // Get game information to determine teams
      try {
        const gameInfo = await apiRequest('GET', `/api/games/${gameId}`);
        const homeTeamId = gameInfo.homeTeamId;
        const awayTeamId = gameInfo.awayTeamId;

        if (!homeTeamId || !awayTeamId) {
          continue; // Skip BYE games or incomplete data
        }

        // Check which teams have recorded stats and their completeness
        const teamsWithStats = new Set(stats.map(stat => stat.teamId));
        
        // Check if teams have complete offensive AND defensive stats
        const teamStatsCompletion = {};
        for (const teamId of [homeTeamId, awayTeamId]) {
          const teamStats = stats.filter(s => s.teamId === teamId);
          const hasOffensive = teamStats.some(s => s.position === 'GA' || s.position === 'GS');
          const hasDefensive = teamStats.some(s => s.position === 'GD' || s.position === 'GK');
          teamStatsCompletion[teamId] = { hasOffensive, hasDefensive, total: teamStats.length };
        }
        
        // Check for teams with zero stats to force opponent perspective
        const homeTeamStats = stats.filter(s => s.teamId === homeTeamId);
        const awayTeamStats = stats.filter(s => s.teamId === awayTeamId);
        
        // Ensure teams with 0 stats get processed
        if (!teamStatsCompletion[homeTeamId]) {
          teamStatsCompletion[homeTeamId] = { hasOffensive: false, hasDefensive: false, total: 0 };
        }
        if (!teamStatsCompletion[awayTeamId]) {
          teamStatsCompletion[awayTeamId] = { hasOffensive: false, hasDefensive: false, total: 0 };
        }

        console.log(`🔍 Game ${gameId}: Team stats completion:`, teamStatsCompletion);

        // Force Matrix team issue fix: Check if Team 1 has no stats but Team 123 has stats
        if (gameId === 80) {
          const team1Stats = stats.filter(s => s.teamId === 1);
          const team123Stats = stats.filter(s => s.teamId === 123);
          console.log(`🎯 MATRIX GAME 80 CHECK: Team 1 has ${team1Stats.length} stats, Team 123 has ${team123Stats.length} stats`);
          
          if (team1Stats.length === 0 && team123Stats.length > 0) {
            console.log(`🚨 MATRIX ISSUE DETECTED! Generating Team 1 stats from Team 123 opponent data`);
            
            // Generate Matrix team stats from WNC Emus data with correct position mapping
            const generatedStats = [];
            team123Stats.forEach(stat => {
              // Generate Matrix offensive stats from opponent defensive stats
              if (stat.position === 'GD' || stat.position === 'GK') {
                const matrixStat: GameStat = {
                  id: -(gameId * 1000 + stat.id),
                  gameId: gameId,
                  teamId: 1, // Matrix team
                  position: stat.position === 'GD' ? 'GA' : 'GS', // GD defends GA, GK defends GS
                  quarter: stat.quarter,
                  goalsFor: stat.goalsAgainst || 0, // Goals they conceded = goals Matrix scored
                  goalsAgainst: 0,
                  missedGoals: 0,
                  rebounds: 0,
                  intercepts: 0,
                  badPass: 0,
                  handlingError: 0,
                  pickUp: 0,
                  infringement: 0,
                  rating: null
                };
                generatedStats.push(matrixStat);
              }
              
              // Generate Matrix defensive stats from opponent offensive stats
              if (stat.position === 'GA' || stat.position === 'GS') {
                const matrixDefensiveStat: GameStat = {
                  id: -(gameId * 1000 + stat.id + 1000),
                  gameId: gameId,
                  teamId: 1, // Matrix team
                  position: stat.position === 'GA' ? 'GD' : 'GK', // GA attacks GD, GS attacks GK
                  quarter: stat.quarter,
                  goalsFor: 0,
                  goalsAgainst: stat.goalsFor || 0, // Goals they scored = goals Matrix conceded
                  missedGoals: 0,
                  rebounds: 0,
                  intercepts: 0,
                  badPass: 0,
                  handlingError: 0,
                  pickUp: 0,
                  infringement: 0,
                  rating: null
                };
                generatedStats.push(matrixDefensiveStat);
              }
            });
            
            processedStats[gameId].push(...generatedStats);
            console.log(`✨ GENERATED ${generatedStats.length} Matrix stats:`, generatedStats.map(s => `${s.position}:${s.goalsFor}/${s.goalsAgainst}`));
          }
        }

        // Generate missing stats for teams that have incomplete data
        for (const teamId of [homeTeamId, awayTeamId]) {
          const completion = teamStatsCompletion[teamId] || { hasOffensive: false, hasDefensive: false, total: 0 };
          console.log(`📊 Team ${teamId}: hasOffensive=${completion.hasOffensive}, hasDefensive=${completion.hasDefensive}, total=${completion.total}`);
          if (!completion.hasOffensive || !completion.hasDefensive || completion.total < 8) {
            // This team needs opponent perspective stats
            console.log(`🚨 TEAM ${teamId} NEEDS OPPONENT PERSPECTIVE STATS! Completion:`, completion);
            const missingTeamId = teamId;
            const opponentTeamId = missingTeamId === homeTeamId ? awayTeamId : homeTeamId;
            const opponentStats = stats.filter(stat => stat.teamId === opponentTeamId);

            console.log(`🔄 GENERATING missing stats for team ${missingTeamId} from opponent ${opponentTeamId} with ${opponentStats.length} stats`);
            
            // Special debug logging for Team 124 (Gems)
            if (missingTeamId === 124) {
              console.log(`🎯 GEMS TEAM 124 DEBUG - Game ${gameId}:`, {
                missingTeamId,
                opponentTeamId,
                opponentStatsCount: opponentStats.length,
                opponentStats: opponentStats.map(s => `${s.position} Q${s.quarter}: For=${s.goalsFor} Against=${s.goalsAgainst}`)
              });
            }

            // Clear existing stats for this team to avoid duplicates
            processedStats[gameId] = processedStats[gameId].filter(s => s.teamId !== missingTeamId);
            
            // Generate both offensive AND defensive stats for missing team
            for (const opponentStat of opponentStats) {
              // Generate our offensive stats from opponent's defensive data
              if (opponentStat.position === 'GD' || opponentStat.position === 'GK') {
                const offensiveStat: GameStat = {
                  id: -Math.abs(gameId * 1000 + missingTeamId * 10 + opponentStat.quarter), 
                  gameId: gameId,
                  teamId: missingTeamId,
                  position: opponentStat.position === 'GD' ? 'GA' : 'GS', // GD defends against GA, GK defends against GS
                  quarter: opponentStat.quarter,
                  goalsFor: opponentStat.goalsAgainst || 0, // Goals they conceded = goals we scored
                  goalsAgainst: 0,
                  missedGoals: 0,
                  rebounds: 0,
                  intercepts: 0,
                  badPass: 0,
                  handlingError: 0,
                  pickUp: 0,
                  infringement: 0,
                  rating: null
                };
                processedStats[gameId].push(offensiveStat);
                console.log(`✨ Generated offensive stat: Team ${missingTeamId} ${offensiveStat.position} Q${offensiveStat.quarter} scored ${offensiveStat.goalsFor} goals (from opponent ${opponentStat.position} conceding)`);
                
                // Special debug for Team 124 (Gems)
                if (missingTeamId === 124) {
                  console.log(`🎯 GEMS OFFENSE: Generated ${offensiveStat.position} Q${offensiveStat.quarter} with ${offensiveStat.goalsFor} goals from opponent ${opponentStat.position} conceding ${opponentStat.goalsAgainst}`);
                }
              }
              
              // Generate our defensive stats from opponent's offensive data  
              if (opponentStat.position === 'GA' || opponentStat.position === 'GS') {
                const defensiveStat: GameStat = {
                  id: -Math.abs(gameId * 1000 + missingTeamId * 100 + opponentStat.quarter),
                  gameId: gameId,
                  teamId: missingTeamId,
                  position: opponentStat.position === 'GA' ? 'GD' : 'GK', // GA attacks against GD, GS attacks against GK
                  quarter: opponentStat.quarter,
                  goalsFor: 0,
                  goalsAgainst: opponentStat.goalsFor || 0, // Goals they scored = goals we conceded
                  missedGoals: 0,
                  rebounds: 0,
                  intercepts: 0,
                  badPass: 0,
                  handlingError: 0,
                  pickUp: 0,
                  infringement: 0,
                  rating: null
                };
                processedStats[gameId].push(defensiveStat);
                console.log(`🛡️ Generated defensive stat: Team ${missingTeamId} ${defensiveStat.position} Q${defensiveStat.quarter} conceded ${defensiveStat.goalsAgainst} goals (from opponent ${opponentStat.position} scoring)`);
                
                // Special debug for Team 124 (Gems)
                if (missingTeamId === 124) {
                  console.log(`🎯 GEMS DEFENSE: Generated ${defensiveStat.position} Q${defensiveStat.quarter} with ${defensiveStat.goalsAgainst} goals against from opponent ${opponentStat.position} scoring ${opponentStat.goalsFor}`);
                }
              }
            }
          }
        }
      } catch (error) {
        console.warn(`Could not process opponent perspective for game ${gameId}:`, error);
      }
    }

    return processedStats;
  }

  private async executeBatchRequest(gameIds: number[]): Promise<Record<number, GameStat[]>> {
    if (!gameIds || !gameIds.length) {
      return {};
    }

    try {
      const validIds = gameIds.filter(id => id && id > 0);
      if (!validIds.length) {
        return {};
      }

      const idsParam = validIds.join(',');

      // Construct URL with proper query parameter handling
      const baseUrl = '/api/games/stats/batch';
      const queryParams = new URLSearchParams({ gameIds: idsParam });
      const url = `${baseUrl}?${queryParams.toString()}`;
      const statsMap = await apiRequest('GET', url);
      return statsMap || {};
    } catch (error) {
      console.warn('Batch fetch failed, falling back to individual requests:', error);
      return this.fallbackIndividualFetch(gameIds);
    }
  }

  private async fallbackIndividualFetch(gameIds: number[]): Promise<Record<number, GameStat[]>> {
    const statsMap: Record<number, GameStat[]> = {};

    // Use apiRequest for individual game stats to ensure proper authentication
    const results = await Promise.allSettled(
      gameIds.map(id => apiRequest('GET', `/api/games/${id}/stats`))
    );

    results.forEach((result, index) => {
      const gameId = gameIds[index];
      if (result.status === 'fulfilled') {
        statsMap[gameId] = result.value || [];
      } else {
        console.error(`Failed to fetch stats for game ${gameId}:`, result.reason);
        statsMap[gameId] = [];
      }
    });

    return statsMap;
  }

  /**
   * Calculate scores for multiple games efficiently
   */
  async calculateBatchGameScores(gameIds: number[]): Promise<Record<number, GameScores>> {
    const scores: Record<number, GameScores> = {};

    // Check cache first for all games
    const uncachedGameIds: number[] = [];
    for (const gameId of gameIds) {
      const cached = getCachedScores(gameId);
      if (cached) {
        scores[gameId] = cached;
      } else {
        uncachedGameIds.push(gameId);
      }
    }

    if (uncachedGameIds.length === 0) {
      return scores;
    }

    // Get stats for uncached games
    const statsMap = await this.getBatchGameStats(uncachedGameIds);

    // Calculate scores for each uncached game
    for (const gameId of uncachedGameIds) {
      const stats = statsMap[gameId] || [];
      const gameScores = this.calculateScoresFromStats(stats, gameId);
      scores[gameId] = gameScores;
      cacheScores(gameId, gameScores, stats);
    }

    return scores;
  }



  /**
   * Get position-based statistics for a game
   */
  async getPositionStats(gameId: number): Promise<Record<string, PositionStat>> {
    const statsMap = await this.getBatchGameStats([gameId]);
    const stats = statsMap[gameId] || [];

    const positionStats: Record<string, PositionStat> = {};

    stats.forEach(stat => {
      if (!stat.position || !stat.quarter) return;

      const key = `${stat.position}-${stat.quarter}`;
      positionStats[key] = {
        gameId: stat.gameId,
        quarter: stat.quarter,
        position: stat.position,
        goalsFor: stat.goalsFor || 0,
        goalsAgainst: stat.goalsAgainst || 0,
        missedGoals: 0,
        rebounds: 0,
        intercepts: 0,
        badPass: 0,
        handlingError: 0,
        pickUp: 0,
        infringement: 0,
        rating: stat.rating
      };
    });

    return positionStats;
  }

  /**
   * Map stats to players using roster information
   */
  async mapStatsToPlayers(gameId: number): Promise<Record<number, GameStat[]>> {
    const [statsMap, rosters] = await Promise.all([
      this.getBatchGameStats([gameId]),
      apiRequest('GET', `/api/games/${gameId}/rosters`)
    ]);

    const stats = statsMap[gameId] || [];
    const playerStats: Record<number, GameStat[]> = {};

    stats.forEach(stat => {
      if (!stat.position) return;

      const playerRoster = rosters.find((r: Roster) => 
        r.quarter === stat.quarter && 
        r.position === stat.position
      );

      if (playerRoster) {
        if (!playerStats[playerRoster.playerId]) {
          playerStats[playerRoster.playerId] = [];
        }
        playerStats[playerRoster.playerId].push(stat);
      }
    });

    return playerStats;
  }

  /**
   * Update game statistics
   */
  async updateGameStat(gameId: number, position: Position, quarter: number, updates: Partial<GameStat>): Promise<GameStat> {
    // Clear cache for this game
    invalidateGameCache(gameId);

    // Find existing stat
    const statsMap = await this.getBatchGameStats([gameId]);
    const stats = statsMap[gameId] || [];
    const existingStat = stats.find(s => s.position === position && s.quarter === quarter);

    if (existingStat) {
      return apiRequest('PATCH', `/api/games/${gameId}/stats/${existingStat.id}`, updates);
    } else {
      return apiRequest('POST', `/api/games/${gameId}/stats`, {
        gameId,
        position,
        quarter,
        ...updates
      });
    }
  }

  /**
   * Calculate player performance across games
   */
  async calculatePlayerPerformance(playerId: number, gameIds?: number[]): Promise<PlayerPerformance> {
    // Get all games if not specified, filter out forfeits
    const allGames = gameIds 
      ? await Promise.all(gameIds.map(id => apiRequest('GET', `/api/games/${id}`)))
      : await apiRequest('GET', '/api/games');

    const validGames = allGames.filter((g: Game) => !isForfeitGame(g));
    const validGameIds = validGames.map((g: Game) => g.id);

    // Get all stats and rosters in batch
    const [statsMap, ...rosterArrays] = await Promise.all([
      this.getBatchGameStats(validGameIds),
      ...validGameIds.map(id => apiRequest('GET', `/api/games/${id}/rosters`))
    ]);

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

    const gamesPlayed = new Set<number>();
    let totalRating = 0;
    let ratingCount = 0;

    validGameIds.forEach((gameId, index) => {
      const stats = statsMap[gameId] || [];
      const rosters = rosterArrays[index] || [];

      const playerRosters = rosters.filter((r: Roster) => r.playerId === playerId);

      if (playerRosters.length === 0) return;

      gamesPlayed.add(gameId);

      playerRosters.forEach((roster: Roster) => {
        performance.quartersByPosition[roster.position]++;

        const stat = stats.find((s: GameStat) => 
          s.position === roster.position && s.quarter === roster.quarter
        );

        if (stat) {
          performance.goals += stat.goalsFor || 0;
          performance.goalsAgainst += stat.goalsAgainst || 0;
          performance.missedGoals += stat.missedGoals || 0;
          performance.rebounds += stat.rebounds || 0;
          performance.intercepts += stat.intercepts || 0;
          performance.badPass += stat.badPass || 0;
          performance.handlingError += stat.handlingError || 0;
          performance.pickUp += stat.pickUp || 0;
          performance.infringement += stat.infringement || 0;

          if (stat.quarter === 1 && stat.rating !== null) {
            totalRating += stat.rating;
            ratingCount++;
          }
        }
      });
    });

    performance.gamesPlayed = gamesPlayed.size;
    performance.rating = ratingCount > 0 ? Math.round(totalRating / ratingCount) : 5;

    return performance;
  }

  /**
   * Save game statistics
   */
  async saveGameStatistics(gameId: number, stats: any[], useTransaction = true, confirmCompleted = false): Promise<void> {
    const response = await apiRequest.put(`/games/${gameId}/stats`, { 
      stats,
      useTransaction,
      confirmCompleted
    });

    if (!response.ok) {
      const errorData = await response.json();

      // If game is completed and confirmation required, throw special error
      if (errorData.requiresConfirmation) {
        const error = new Error(errorData.error) as any;
        error.requiresConfirmation = true;
        error.gameStatus = errorData.gameStatus;
        throw error;
      }

      throw new Error(errorData.error || 'Failed to save statistics');
    }
  }

  
  }

// Interfaces
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

export interface PositionStat {
  gameId: number;
  quarter: number;
  position: Position;
  goalsFor: number;
  goalsAgainst: number;
  missedGoals: number;
  rebounds: number;
  intercepts: number;
  deflections: number;
  turnovers: number;
  gains: number;
  receives: number;
  penalties: number;
  rating: number | null;
}

export interface PlayerPerformance {
  playerId: number;
  gamesPlayed: number;
  goals: number;
  goalsAgainst: number;
  missedGoals: number;
  rebounds: number;
  intercepts: number;
  deflections: number;
  turnovers: number;
  gains: number;
  receives: number;
  penalties: number;
  rating: number;
  quartersByPosition: Record<Position, number>;
}

// Export singleton instance
export const unifiedStatsService = new UnifiedStatisticsService();

// Export the service instance (single export)
export const statisticsService = unifiedStatsService;

// Make service available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).statisticsService = statisticsService;
}

/**
 * Utility function to invalidate all caches related to a game
 * Call this after creating, updating, or deleting game stats
 */
export function invalidateGameCaches(gameId: number): void {
  clearGameCache(gameId);

  // Also invalidate React Query caches
  import('./queryClient').then(({ queryClient }) => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey;
        // Invalidate any query that involves this game
        return queryKey.some(key => 
          typeof key === 'string' && (
            key.includes(`game-${gameId}`) ||
            key.includes(`/games/${gameId}/`) ||
            key.includes(`gameId-${gameId}`)
          )
        );
      }
    });
  });
}

/**
 * Utility to clear all statistics caches
 */
export function clearAllStatisticsCaches(): void {
  // Clear the batch cache from the service instance
  statisticsService.clearBatchCache();

  import('./queryClient').then(({ queryClient }) => {
    queryClient.clear();
  });
}

/**
 * Utility to invalidate score-related caches when scores are updated
 */
export function invalidateScoreCaches(gameId: number): void {
  // Clear local cache
  invalidateGameCache(gameId);
  
  // Clear React Query caches for this specific game
  import('./queryClient').then(({ queryClient }) => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey;
        return queryKey.some(key => 
          typeof key === 'string' && (
            key.includes(`game-${gameId}`) ||
            key.includes(`/games/${gameId}`) ||
            key.includes(`gameId-${gameId}`) ||
            key.includes('gameScores') ||
            key.includes('batchGameStats')
          )
        );
      }
    });
  });
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
    'forfeit-loss': 'red',
    'bye': 'purple',
    'abandoned': 'gray'
  };

  return colorMap[status] || 'gray';
}
export { unifiedStatsService as StatisticsService };