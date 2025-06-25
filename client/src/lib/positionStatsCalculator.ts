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
  // Simplified calculation - assume stats are already filtered by the API for the correct team
  let gsGoalsFor = 0;
  let gaGoalsFor = 0;
  let gdGoalsAgainst = 0;
  let gkGoalsAgainst = 0;
  let gamesWithPositionStats = 0;

  games.forEach(game => {
    const gameStats = batchStats[game.id.toString()] || batchStats[game.id];

    if (!gameStats || gameStats.length === 0) {
      return;
    }

    let hasPositionStats = false;

    gameStats.forEach(stat => {
      if (stat.position === 'GS' && typeof stat.goalsFor === 'number') {
        gsGoalsFor += stat.goalsFor;
        hasPositionStats = true;
      }
      if (stat.position === 'GA' && typeof stat.goalsFor === 'number') {
        gaGoalsFor += stat.goalsFor;
        hasPositionStats = true;
      }
      if (stat.position === 'GD' && typeof stat.goalsAgainst === 'number') {
        gdGoalsAgainst += stat.goalsAgainst;
        hasPositionStats = true;
      }
      if (stat.position === 'GK' && typeof stat.goalsAgainst === 'number') {
        gkGoalsAgainst += stat.goalsAgainst;
        hasPositionStats = true;
      }
    });

    if (hasPositionStats) {
      gamesWithPositionStats++;
    }
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