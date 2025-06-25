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
  console.log(`🔍 POSITION CALCULATOR - Starting calculation for team ${currentTeamId}`, {
    gamesCount: games.length,
    gameIds: games.map(g => g.id),
    batchStatsKeys: Object.keys(batchStats),
    batchStatsSize: Object.keys(batchStats).length
  });

  // Simplified calculation - assume stats are already filtered by the API for the correct team
  let gsGoalsFor = 0;
  let gaGoalsFor = 0;
  let gdGoalsAgainst = 0;
  let gkGoalsAgainst = 0;
  let gamesWithPositionStats = 0;
  let debugInfo = [];

  games.forEach((game, index) => {
    const gameStats = batchStats[game.id.toString()] || batchStats[game.id];
    
    console.log(`🔍 POSITION CALCULATOR - Game ${game.id} (${index + 1}/${games.length}):`, {
      gameId: game.id,
      hasStats: !!gameStats,
      statsCount: gameStats?.length || 0,
      statsTeamIds: gameStats?.map(s => s.teamId) || [],
      currentTeamId
    });

    if (!gameStats || gameStats.length === 0) {
      debugInfo.push({
        gameId: game.id,
        status: 'NO_STATS',
        reason: 'No stats in batch data'
      });
      return;
    }

    // Filter stats for current team only
    const teamStats = gameStats.filter(stat => Number(stat.teamId) === Number(currentTeamId));
    console.log(`🔍 POSITION CALCULATOR - Game ${game.id} team filtering:`, {
      allStatsCount: gameStats.length,
      teamStatsCount: teamStats.length,
      teamStats: teamStats.map(s => ({ position: s.position, goalsFor: s.goalsFor, goalsAgainst: s.goalsAgainst }))
    });

    if (teamStats.length === 0) {
      debugInfo.push({
        gameId: game.id,
        status: 'NO_TEAM_STATS',
        reason: `No stats found for team ${currentTeamId}`,
        availableTeamIds: gameStats.map(s => s.teamId)
      });
      return;
    }

    let hasPositionStats = false;
    let gamePositionData = {};

    teamStats.forEach(stat => {
      if (stat.position === 'GS' && typeof stat.goalsFor === 'number') {
        gsGoalsFor += stat.goalsFor;
        hasPositionStats = true;
        gamePositionData['GS'] = stat.goalsFor;
      }
      if (stat.position === 'GA' && typeof stat.goalsFor === 'number') {
        gaGoalsFor += stat.goalsFor;
        hasPositionStats = true;
        gamePositionData['GA'] = stat.goalsFor;
      }
      if (stat.position === 'GD' && typeof stat.goalsAgainst === 'number') {
        gdGoalsAgainst += stat.goalsAgainst;
        hasPositionStats = true;
        gamePositionData['GD'] = stat.goalsAgainst;
      }
      if (stat.position === 'GK' && typeof stat.goalsAgainst === 'number') {
        gkGoalsAgainst += stat.goalsAgainst;
        hasPositionStats = true;
        gamePositionData['GK'] = stat.goalsAgainst;
      }
    });

    if (hasPositionStats) {
      gamesWithPositionStats++;
      debugInfo.push({
        gameId: game.id,
        status: 'HAS_POSITION_STATS',
        positionData: gamePositionData
      });
    } else {
      debugInfo.push({
        gameId: game.id,
        status: 'NO_POSITION_STATS',
        reason: 'No valid position stats found',
        teamStatsPositions: teamStats.map(s => s.position)
      });
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

  console.log(`🔍 POSITION CALCULATOR - Final calculation for team ${currentTeamId}:`, {
    inputGames: games.length,
    gamesWithPositionStats,
    totals: {
      gsGoalsFor,
      gaGoalsFor,
      gdGoalsAgainst,
      gkGoalsAgainst
    },
    averages: {
      gsAvgGoalsFor,
      gaAvgGoalsFor,
      gdAvgGoalsAgainst,
      gkAvgGoalsAgainst
    },
    attackingPositionsTotal,
    defendingPositionsTotal,
    debugInfo
  });

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