import { GameStat, Game } from '@shared/schema';

export interface PositionTotals {
  'GS': { goalsFor: number; games: number };
  'GA': { goalsFor: number; games: number };
  'GD': { goalsAgainst: number; games: number };
  'GK': { goalsAgainst: number; games: number };
}

export interface PositionAverages {
  gsAvgGoalsFor: number;
  gaAvgGoalsFor: number;
  gdAvgGoalsAgainst: number;
  gkAvgGoalsAgainst: number;
  attackingPositionsTotal: number;
  defendingPositionsTotal: number;
  gamesWithPositionStats: number;
}

/**
 * Calculate position-based statistics from game stats
 * @param games - Array of games to analyze
 * @param batchStats - Stats data keyed by game ID
 * @param currentTeamId - ID of the team to calculate stats for
 * @returns Calculated position averages
 */
export function calculatePositionAverages(
  games: any[],
  batchStats: Record<string, any[]>,
  currentTeamId: number
): PositionAverages {
  console.log('calculatePositionAverages called with:', { 
    gamesCount: games.length, 
    batchStatsKeys: Object.keys(batchStats), 
    currentTeamId 
  });

  let gsGoalsFor = 0;
  let gaGoalsFor = 0;
  let gdGoalsAgainst = 0;
  let gkGoalsAgainst = 0;
  let gamesWithPositionStats = 0;

  games.forEach(game => {
    const gameStats = batchStats[game.id.toString()];
    console.log(`Game ${game.id} stats:`, gameStats?.length || 0, 'records');

    if (!gameStats || gameStats.length === 0) return;

    const teamStats = gameStats.filter(stat => stat.teamId === currentTeamId);
    console.log(`Game ${game.id} team stats for team ${currentTeamId}:`, teamStats.length, 'records');

    if (teamStats.length === 0) return;

    let hasPositionStats = false;

    teamStats.forEach(stat => {
      console.log(`Game ${game.id} stat:`, { position: stat.position, goalsFor: stat.goalsFor, goalsAgainst: stat.goalsAgainst });

      if (stat.position === 'GS' && stat.goalsFor !== undefined) {
        gsGoalsFor += stat.goalsFor;
        hasPositionStats = true;
      }
      if (stat.position === 'GA' && stat.goalsFor !== undefined) {
        gaGoalsFor += stat.goalsFor;
        hasPositionStats = true;
      }
      if (stat.position === 'GD' && stat.goalsAgainst !== undefined) {
        gdGoalsAgainst += stat.goalsAgainst;
        hasPositionStats = true;
      }
      if (stat.position === 'GK' && stat.goalsAgainst !== undefined) {
        gkGoalsAgainst += stat.goalsAgainst;
        hasPositionStats = true;
      }
    });

    if (hasPositionStats) {
      gamesWithPositionStats++;
    }
  });

  console.log('Position averages calculation result:', {
    gsGoalsFor,
    gaGoalsFor,
    gdGoalsAgainst,
    gkGoalsAgainst,
    gamesWithPositionStats
  });

  const gsAvgGoalsFor = gamesWithPositionStats > 0 ? gsGoalsFor / gamesWithPositionStats : 0;
  const gaAvgGoalsFor = gamesWithPositionStats > 0 ? gaGoalsFor / gamesWithPositionStats : 0;
  const gdAvgGoalsAgainst = gamesWithPositionStats > 0 ? gdGoalsAgainst / gamesWithPositionStats : 0;
  const gkAvgGoalsAgainst = gamesWithPositionStats > 0 ? gkGoalsAgainst / gamesWithPositionStats : 0;

  const attackingPositionsTotal = gsAvgGoalsFor + gaAvgGoalsFor;
  const defendingPositionsTotal = gdAvgGoalsAgainst + gkAvgGoalsAgainst;

  return {
    gsAvgGoalsFor,
    gaAvgGoalsFor,
    gdAvgGoalsAgainst,
    gkAvgGoalsAgainst,
    attackingPositionsTotal,
    defendingPositionsTotal,
    gamesWithPositionStats
  };
}

/**
 * Create shared position performance display component
 */
export interface PositionPerformanceDisplayProps {
  averages: PositionAverages;
  label?: string;
  className?: string;
}