
import { GameStat, Player, Roster } from '@shared/schema';

export interface PlayerGamePerformance {
  gameId: number;
  date: string;
  opponent: string;
  goals: number;
  goalsAgainst: number;
  missedGoals: number;
  rebounds: number;
  intercepts: number;
  badPass: number;
  handlingError: number;
  pickUp: number;
  infringement: number;
  positionsPlayed: string[];
  quartersPlayed: number;
}

export interface PlayerSeasonStats {
  playerId: number;
  totalGames: number;
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
  quartersByPosition: Record<string, number>;
  gamePerformances: PlayerGamePerformance[];
}

/**
 * Shared service for calculating player statistics from position-based data
 */
export class PlayerStatsService {
  
  /**
   * Calculate detailed player statistics for a specific player across multiple games
   */
  static calculatePlayerDetailedStats(
    playerId: number,
    gameStatsMap: Record<number, GameStat[]>,
    gameRostersMap: Record<number, Roster[]>,
    gamesData: any[] = []
  ): PlayerSeasonStats {
    
    const stats: PlayerSeasonStats = {
      playerId,
      totalGames: 0,
      goals: 0,
      goalsAgainst: 0,
      missedGoals: 0,
      rebounds: 0,
      intercepts: 0,
      badPass: 0,
      handlingError: 0,
      pickUp: 0,
      infringement: 0,
      rating: 5.0,
      quartersByPosition: {
        'GS': 0, 'GA': 0, 'WA': 0, 'C': 0, 'WD': 0, 'GD': 0, 'GK': 0
      },
      gamePerformances: []
    };

    const gamesPlayed = new Set<number>();

    // Process each game
    Object.entries(gameStatsMap).forEach(([gameIdStr, gameStats]) => {
      const gameId = parseInt(gameIdStr);
      const gameRosters = gameRostersMap[gameId] || [];
      const gameData = gamesData.find(g => g.id === gameId);

      // Find player's roster entries for this game
      const playerRosters = gameRosters.filter((r: Roster) => r.playerId === playerId);
      
      if (playerRosters.length === 0) return;

      gamesPlayed.add(gameId);

      // Build position mapping for this player in this game
      const positionsByQuarter: Record<number, string> = {};
      const positionsPlayed = new Set<string>();

      playerRosters.forEach((roster: Roster) => {
        positionsByQuarter[roster.quarter] = roster.position;
        positionsPlayed.add(roster.position);
        stats.quartersByPosition[roster.position]++;
      });

      // Calculate game performance
      const gamePerformance: PlayerGamePerformance = {
        gameId,
        date: gameData?.date || '',
        opponent: gameData?.opponentName || 'Unknown',
        goals: 0,
        goalsAgainst: 0,
        missedGoals: 0,
        rebounds: 0,
        intercepts: 0,
        badPass: 0,
        handlingError: 0,
        pickUp: 0,
        infringement: 0,
        positionsPlayed: Array.from(positionsPlayed),
        quartersPlayed: playerRosters.length
      };

      // Map stats for positions this player actually played
      gameStats.forEach(stat => {
        if (!stat || !stat.position || !stat.quarter) return;

        const positionPlayed = positionsByQuarter[stat.quarter];

        if (positionPlayed && stat.position === positionPlayed && stat.gameId === gameId) {
          // Add to game performance
          gamePerformance.goals += stat.goalsFor || 0;
          gamePerformance.goalsAgainst += stat.goalsAgainst || 0;
          gamePerformance.missedGoals += stat.missedGoals || 0;
          gamePerformance.rebounds += stat.rebounds || 0;
          gamePerformance.intercepts += stat.intercepts || 0;
          gamePerformance.badPass += stat.badPass || 0;
          gamePerformance.handlingError += stat.handlingError || 0;
          gamePerformance.pickUp += stat.pickUp || 0;
          gamePerformance.infringement += stat.infringement || 0;

          // Add to season totals
          stats.goals += stat.goalsFor || 0;
          stats.goalsAgainst += stat.goalsAgainst || 0;
          stats.missedGoals += stat.missedGoals || 0;
          stats.rebounds += stat.rebounds || 0;
          stats.intercepts += stat.intercepts || 0;
          stats.badPass += stat.badPass || 0;
          stats.handlingError += stat.handlingError || 0;
          stats.pickUp += stat.pickUp || 0;
          stats.infringement += stat.infringement || 0;
        }
      });

      stats.gamePerformances.push(gamePerformance);
    });

    stats.totalGames = gamesPlayed.size;
    
    return stats;
  }

  /**
   * Validate that a stat belongs to a specific player based on roster data
   */
  static validateStatForPlayer(
    stat: GameStat,
    playerId: number,
    gameRosters: Roster[]
  ): boolean {
    if (!stat.position || !stat.quarter || !stat.gameId) {
      return false;
    }

    const rosterEntry = gameRosters.find((r: Roster) => 
      r.position === stat.position && 
      r.quarter === stat.quarter &&
      r.playerId === playerId
    );

    return !!rosterEntry;
  }

  /**
   * Get positions played by a player in a specific game
   */
  static getPlayerPositionsInGame(
    playerId: number,
    gameRosters: Roster[]
  ): Record<number, string> {
    const positionsByQuarter: Record<number, string> = {};

    gameRosters
      .filter((r: Roster) => r.playerId === playerId)
      .forEach((roster: Roster) => {
        positionsByQuarter[roster.quarter] = roster.position;
      });

    return positionsByQuarter;
  }
}
