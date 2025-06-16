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
 * Calculate win rate for a team based on completed games with official scores only
 * Only counts games that are completed AND have official scores entered
 */
export function calculateTeamWinRate(
  games: GameWithStats[],
  teamId: number,
  clubId: number,
  centralizedStats: Record<number, any[]> = {}
): WinRateResult {
  // Filter to only games where this team played and have official scores
  const validGames = games.filter(game => 
    game.statusIsCompleted && 
    game.statusAllowsStatistics &&
    (game.homeTeamId === teamId || game.awayTeamId === teamId) &&
    game.statusTeamGoals !== null && 
    game.statusOpponentGoals !== null
  );

  let wins = 0;
  let losses = 0;
  let draws = 0;

  for (const game of validGames) {
    const isHome = game.homeTeamId === teamId;

    // Use only official scores from game status
    const ourScore = isHome ? (game.statusTeamGoals || 0) : (game.statusOpponentGoals || 0);
    const theirScore = isHome ? (game.statusOpponentGoals || 0) : (game.statusTeamGoals || 0);

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
 * Calculate club-wide win rate across all teams using official scores only
 * For inter-club games, each team's performance counts as a separate game
 */
export function calculateClubWinRate(
  games: GameWithStats[],
  clubId: number,
  centralizedStats: Record<number, any[]> = {}
): WinRateResult {
  // Filter to only games where this club played and have official scores
  const validGames = games.filter(game => 
    game.statusIsCompleted && 
    game.statusAllowsStatistics &&
    (game.homeClubId === clubId || game.awayClubId === clubId) &&
    game.statusTeamGoals !== null && 
    game.statusOpponentGoals !== null
  );

  let wins = 0;
  let losses = 0;
  let draws = 0;
  let totalGames = 0;

  for (const game of validGames) {
    const isHomeClub = game.homeClubId === clubId;
    const isAwayClub = game.awayClubId === clubId;
    const isInterClubGame = game.homeClubId === clubId && game.awayClubId === clubId;

    if (isInterClubGame) {
      // Inter-club game: each team counts as a separate game
      // Home team result
      if (game.statusTeamGoals! > game.statusOpponentGoals!) {
        wins++;
      } else if (game.statusTeamGoals! < game.statusOpponentGoals!) {
        losses++;
      } else {
        draws++;
      }
      totalGames++;

      // Away team result (opposite of home team)
      if (game.statusOpponentGoals! > game.statusTeamGoals!) {
        wins++;
      } else if (game.statusOpponentGoals! < game.statusTeamGoals!) {
        losses++;
      } else {
        draws++;
      }
      totalGames++;
    } else {
      // Regular game against another club: count as one game
      const ourScore = isHomeClub ? (game.statusTeamGoals || 0) : (game.statusOpponentGoals || 0);
      const theirScore = isHomeClub ? (game.statusOpponentGoals || 0) : (game.statusTeamGoals || 0);

      if (ourScore > theirScore) {
        wins++;
      } else if (ourScore < theirScore) {
        losses++;
      } else {
        draws++;
      }
      totalGames++;
    }
  }

  const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

  return {
    wins,
    losses,
    draws,
    totalGames,
    winRate
  };
}