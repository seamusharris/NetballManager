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
  console.log(`🎯 POSITION CALC START: ${games.length} games, currentTeamId=${currentTeamId}`);
  console.log(`🎯 POSITION CALC batchStats keys:`, Object.keys(batchStats));

  // Simplified calculation - assume stats are already filtered by the API for the correct team
  let gsGoalsFor = 0;
  let gaGoalsFor = 0;
  let gdGoalsAgainst = 0;
  let gkGoalsAgainst = 0;
  let gamesWithPositionStats = 0;

  games.forEach((game, gameIndex) => {
    const gameStats = batchStats[game.id.toString()] || batchStats[game.id];

    console.log(`🎯 GAME ${game.id} (${gameIndex + 1}/${games.length}): Found ${gameStats?.length || 0} stats`);

    if (!gameStats || gameStats.length === 0) {
      console.log(`🎯 GAME ${game.id}: No stats found, skipping`);
      return;
    }

    let hasPositionStats = false;
    let gameGsGoals = 0;
    let gameGaGoals = 0;
    let gameGdGoals = 0;
    let gameGkGoals = 0;

    // Log team breakdown
    const teamBreakdown = {};
    gameStats.forEach(stat => {
      if (!teamBreakdown[stat.teamId]) teamBreakdown[stat.teamId] = 0;
      teamBreakdown[stat.teamId]++;
    });
    console.log(`🎯 GAME ${game.id} team breakdown:`, teamBreakdown);

    // Filter to current team only
    const teamStats = gameStats.filter(stat => Number(stat.teamId) === Number(currentTeamId));
    console.log(`🎯 GAME ${game.id}: ${teamStats.length} stats for team ${currentTeamId}`);

    if (teamStats.length > 0) {
      console.log(`🎯 GAME ${game.id} team stats positions:`, teamStats.map(s => `${s.position}:F${s.goalsFor}/A${s.goalsAgainst}`));
    }

    teamStats.forEach(stat => {
      if (stat.position === 'GS' && typeof stat.goalsFor === 'number') {
        gsGoalsFor += stat.goalsFor;
        gameGsGoals += stat.goalsFor;
        hasPositionStats = true;
        console.log(`🎯 GAME ${game.id}: GS added ${stat.goalsFor} goals (total now ${gsGoalsFor})`);
      }
      if (stat.position === 'GA' && typeof stat.goalsFor === 'number') {
        gaGoalsFor += stat.goalsFor;
        gameGaGoals += stat.goalsFor;
        hasPositionStats = true;
        console.log(`🎯 GAME ${game.id}: GA added ${stat.goalsFor} goals (total now ${gaGoalsFor})`);
      }
      if (stat.position === 'GD' && typeof stat.goalsAgainst === 'number') {
        gdGoalsAgainst += stat.goalsAgainst;
        gameGdGoals += stat.goalsAgainst;
        hasPositionStats = true;
        console.log(`🎯 GAME ${game.id}: GD added ${stat.goalsAgainst} goals against (total now ${gdGoalsAgainst})`);
      }
      if (stat.position === 'GK' && typeof stat.goalsAgainst === 'number') {
        gkGoalsAgainst += stat.goalsAgainst;
        gameGkGoals += stat.goalsAgainst;
        hasPositionStats = true;
        console.log(`🎯 GAME ${game.id}: GK added ${stat.goalsAgainst} goals against (total now ${gkGoalsAgainst})`);
      }
    });

    if (hasPositionStats) {
      gamesWithPositionStats++;
      console.log(`🎯 GAME ${game.id}: HAS POSITION STATS - GS:${gameGsGoals}, GA:${gameGaGoals}, GD:${gameGdGoals}, GK:${gameGkGoals} (games with stats: ${gamesWithPositionStats})`);
    } else {
      console.log(`🎯 GAME ${game.id}: NO POSITION STATS FOUND`);
    }
  });

  const gsAvgGoalsFor = gamesWithPositionStats > 0 ? gsGoalsFor / gamesWithPositionStats : 0;
  const gaAvgGoalsFor = gamesWithPositionStats > 0 ? gaGoalsFor / gamesWithPositionStats : 0;
  const gdAvgGoalsAgainst = gamesWithPositionStats > 0 ? gdGoalsAgainst / gamesWithPositionStats : 0;
  const gkAvgGoalsAgainst = gamesWithPositionStats > 0 ? gkGoalsAgainst / gamesWithPositionStats : 0;

  const attackingPositionsTotal = gsAvgGoalsFor + gaAvgGoalsFor;
  const defendingPositionsTotal = gdAvgGoalsAgainst + gkAvgGoalsAgainst;

  console.log(`🎯 POSITION CALC FINAL: Team ${currentTeamId}`);
  console.log(`🎯 TOTALS: GS=${gsGoalsFor}, GA=${gaGoalsFor}, GD=${gdGoalsAgainst}, GK=${gkGoalsAgainst}`);
  console.log(`🎯 AVERAGES: GS=${gsAvgGoalsFor.toFixed(2)}, GA=${gaAvgGoalsFor.toFixed(2)}, GD=${gdAvgGoalsAgainst.toFixed(2)}, GK=${gkAvgGoalsAgainst.toFixed(2)}`);
  console.log(`🎯 COMBINED: Attack=${attackingPositionsTotal.toFixed(2)}, Defense=${defendingPositionsTotal.toFixed(2)}, Games=${gamesWithPositionStats}`);

  const result = {
    gsAvgGoalsFor,
    gaAvgGoalsFor,
    gdAvgGoalsAgainst,
    gkAvgGoalsAgainst,
    attackingPositionsTotal,
    defendingPositionsTotal,
    gamesWithPositionStats
  };

  console.log(`🎯 POSITION CALC RESULT:`, result);
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