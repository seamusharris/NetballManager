
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
  games: Game[],
  batchStats: Record<string, GameStat[]>,
  currentTeamId: number | null
): PositionAverages {
  const positionTotals: PositionTotals = {
    'GS': { goalsFor: 0, games: 0 },
    'GA': { goalsFor: 0, games: 0 },
    'GD': { goalsAgainst: 0, games: 0 },
    'GK': { goalsAgainst: 0, games: 0 }
  };

  let gamesWithPositionStats = 0;

  // Aggregate actual position stats from games
  games.forEach(game => {
    // Only include games that allow statistics (excludes forfeit games, BYE games, etc.)
    if (!game.statusAllowsStatistics) return;

    const gameStats = batchStats?.[game.id] || [];
    if (gameStats.length > 0) {
      gamesWithPositionStats++;

      // Process stats for current team only
      const teamStats = gameStats.filter(stat => 
        (game.homeTeamId === currentTeamId && stat.teamId === currentTeamId) ||
        (game.awayTeamId === currentTeamId && stat.teamId === currentTeamId)
      );

      teamStats.forEach(stat => {
        if (stat.position === 'GS' || stat.position === 'GA') {
          positionTotals[stat.position].goalsFor += stat.goalsFor || 0;
          positionTotals[stat.position].games++;
        } else if (stat.position === 'GD' || stat.position === 'GK') {
          positionTotals[stat.position].goalsAgainst += stat.goalsAgainst || 0;
          positionTotals[stat.position].games++;
        }
      });
    }
  });

  // Calculate averages - divide by number of games with position stats, not position instances
  const gsAvgGoalsFor = gamesWithPositionStats > 0 ? positionTotals['GS'].goalsFor / gamesWithPositionStats : 0;
  const gaAvgGoalsFor = gamesWithPositionStats > 0 ? positionTotals['GA'].goalsFor / gamesWithPositionStats : 0;
  const gdAvgGoalsAgainst = gamesWithPositionStats > 0 ? positionTotals['GD'].goalsAgainst / gamesWithPositionStats : 0;
  const gkAvgGoalsAgainst = gamesWithPositionStats > 0 ? positionTotals['GK'].goalsAgainst / gamesWithPositionStats : 0;

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
