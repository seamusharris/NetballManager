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

  games.forEach((game, gameIndex) => {
    const gameStats = batchStats[game.id.toString()] || batchStats[game.id];

    if (!gameStats || gameStats.length === 0) {
      return;
    }

    let hasPositionStats = false;
    let gameGsGoals = 0;
    let gameGaGoals = 0;
    let gameGdGoals = 0;
    let gameGkGoals = 0;

    // Filter to current team only
    const teamStats = gameStats.filter(stat => Number(stat.teamId) === Number(currentTeamId));

    teamStats.forEach(stat => {
      if (stat.position === 'GS' && typeof stat.goalsFor === 'number') {
        gsGoalsFor += stat.goalsFor;
        gameGsGoals += stat.goalsFor;
        hasPositionStats = true;
      }
      if (stat.position === 'GA' && typeof stat.goalsFor === 'number') {
        gaGoalsFor += stat.goalsFor;
        gameGaGoals += stat.goalsFor;
        hasPositionStats = true;
      }
      if (stat.position === 'GD' && typeof stat.goalsAgainst === 'number') {
        gdGoalsAgainst += stat.goalsAgainst;
        gameGdGoals += stat.goalsAgainst;
        hasPositionStats = true;
      }
      if (stat.position === 'GK' && typeof stat.goalsAgainst === 'number') {
        gkGoalsAgainst += stat.goalsAgainst;
        gameGkGoals += stat.goalsAgainst;
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

  const result = {
    gsAvgGoalsFor,
    gaAvgGoalsFor,
    gdAvgGoalsAgainst,
    gkAvgGoalsAgainst,
    attackingPositionsTotal,
    defendingPositionsTotal,
    gamesWithPositionStats
  };

  return result;
}

/**
 * Create shared position performance display component
 */
export interface PositionPerformanceDisplayProps {
  averages: PositionAverages;
  label?: string;
  className?: string;
}

/**
 * Calculate quarter-by-quarter attack/defense statistics from position-based game stats
 * @param games - Array of games to analyze
 * @param batchStats - Stats data keyed by game ID
 * @param currentTeamId - ID of the team to calculate stats for
 * @returns Array of quarter data with position-specific goals
 */
export function calculateQuarterByQuarterStats(
  games: any[],
  batchStats: Record<string, any[]>,
  currentTeamId: number
): Array<{
  quarter: number;
  gsGoalsFor: number;
  gaGoalsFor: number;
  gdGoalsAgainst: number;
  gkGoalsAgainst: number;
  gamesWithQuarterData: number;
}> {
  const quarters = [1, 2, 3, 4];
  
  return quarters.map(quarter => {
    let gsGoalsFor = 0;
    let gaGoalsFor = 0;
    let gdGoalsAgainst = 0;
    let gkGoalsAgainst = 0;
    let gamesWithQuarterData = 0;

    games.forEach(game => {
      const gameStats = batchStats[game.id.toString()] || batchStats[game.id];
      
      if (!gameStats || gameStats.length === 0) {
        return;
      }

      // Filter to current team and specific quarter
      const teamStats = gameStats.filter(stat => 
        Number(stat.teamId) === Number(currentTeamId) && 
        stat.quarter === quarter
      );

      let hasQuarterData = false;
      
      teamStats.forEach(stat => {
        if (stat.position === 'GS' && typeof stat.goalsFor === 'number') {
          gsGoalsFor += stat.goalsFor;
          hasQuarterData = true;
        }
        if (stat.position === 'GA' && typeof stat.goalsFor === 'number') {
          gaGoalsFor += stat.goalsFor;
          hasQuarterData = true;
        }
        if (stat.position === 'GD' && typeof stat.goalsAgainst === 'number') {
          gdGoalsAgainst += stat.goalsAgainst;
          hasQuarterData = true;
        }
        if (stat.position === 'GK' && typeof stat.goalsAgainst === 'number') {
          gkGoalsAgainst += stat.goalsAgainst;
          hasQuarterData = true;
        }
      });

      if (hasQuarterData) {
        gamesWithQuarterData++;
      }
    });

    // Calculate averages per quarter
    const avgGsGoalsFor = gamesWithQuarterData > 0 ? gsGoalsFor / gamesWithQuarterData : 0;
    const avgGaGoalsFor = gamesWithQuarterData > 0 ? gaGoalsFor / gamesWithQuarterData : 0;
    const avgGdGoalsAgainst = gamesWithQuarterData > 0 ? gdGoalsAgainst / gamesWithQuarterData : 0;
    const avgGkGoalsAgainst = gamesWithQuarterData > 0 ? gkGoalsAgainst / gamesWithQuarterData : 0;

    return {
      quarter,
      gsGoalsFor: avgGsGoalsFor,
      gaGoalsFor: avgGaGoalsFor,
      gdGoalsAgainst: avgGdGoalsAgainst,
      gkGoalsAgainst: avgGkGoalsAgainst,
      gamesWithQuarterData
    };
  });
}