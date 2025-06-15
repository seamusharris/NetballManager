
export interface WinRateResult {
  wins: number;
  losses: number;
  draws: number;
  totalGames: number;
  winRate: number;
}

export interface GameWithStats {
  id: number;
  statusIsCompleted: boolean;
  statusAllowsStatistics: boolean;
  homeClubId: number;
  awayClubId?: number;
  homeTeamId: number;
  awayTeamId?: number;
  statusTeamGoals?: number;
  statusOpponentGoals?: number;
}

/**
 * Calculate win rate for a team based on completed games with statistics
 * Only counts games that are completed AND allow statistics (excludes BYEs, forfeits, etc.)
 */
export function calculateTeamWinRate(
  games: GameWithStats[],
  teamId: number,
  clubId: number,
  centralizedStats: Record<number, any[]> = {}
): WinRateResult {
  // Filter to only games where this team played and statistics are available
  const validGames = games.filter(game => 
    game.statusIsCompleted && 
    game.statusAllowsStatistics &&
    (game.homeTeamId === teamId || game.awayTeamId === teamId)
  );

  let wins = 0;
  let losses = 0;
  let draws = 0;

  for (const game of validGames) {
    const isHome = game.homeTeamId === teamId;
    const gameStats = centralizedStats[game.id] || [];

    let ourScore = 0;
    let theirScore = 0;

    if (gameStats.length > 0) {
      // Use centralized statistics - filter to only this team's stats
      const teamStats = gameStats.filter(stat => stat.teamId === teamId);
      teamStats.forEach(stat => {
        ourScore += stat.goalsFor || 0;
        theirScore += stat.goalsAgainst || 0;
      });
    } else {
      // Fallback to game status scores
      ourScore = isHome ? (game.statusTeamGoals || 0) : (game.statusOpponentGoals || 0);
      theirScore = isHome ? (game.statusOpponentGoals || 0) : (game.statusTeamGoals || 0);
    }

    if (ourScore > theirScore) {
      wins++;
    } else if (ourScore < theirScore) {
      losses++;
    } else {
      draws++;
    }
  }

  const totalGames = validGames.length;
  const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

  return {
    wins,
    losses,
    draws,
    totalGames,
    winRate
  };
}

/**
 * Calculate club-wide win rate across all teams
 */
export function calculateClubWinRate(
  games: GameWithStats[],
  clubId: number,
  centralizedStats: Record<number, any[]> = {}
): WinRateResult {
  // Filter to only games where this club played and statistics are available
  const validGames = games.filter(game => 
    game.statusIsCompleted && 
    game.statusAllowsStatistics &&
    (game.homeClubId === clubId || game.awayClubId === clubId)
  );

  let wins = 0;
  let losses = 0;
  let draws = 0;

  for (const game of validGames) {
    const isHome = game.homeClubId === clubId;
    const gameStats = centralizedStats[game.id] || [];

    let ourScore = 0;
    let theirScore = 0;

    if (gameStats.length > 0) {
      // Use centralized statistics - sum all goals for/against for our club
      gameStats.forEach(stat => {
        ourScore += stat.goalsFor || 0;
        theirScore += stat.goalsAgainst || 0;
      });
    } else {
      // Fallback to game status scores
      ourScore = isHome ? (game.statusTeamGoals || 0) : (game.statusOpponentGoals || 0);
      theirScore = isHome ? (game.statusOpponentGoals || 0) : (game.statusTeamGoals || 0);
    }

    if (ourScore > theirScore) {
      wins++;
    } else if (ourScore < theirScore) {
      losses++;
    } else {
      draws++;
    }
  }

  const totalGames = validGames.length;
  const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

  return {
    wins,
    losses,
    draws,
    totalGames,
    winRate
  };
}
