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

    // Prioritize official scores from game status, then fall back to calculated stats
    if (game.statusTeamGoals !== null && game.statusOpponentGoals !== null) {
      // Use official scores from game status
      ourScore = isHome ? (game.statusTeamGoals || 0) : (game.statusOpponentGoals || 0);
      theirScore = isHome ? (game.statusOpponentGoals || 0) : (game.statusTeamGoals || 0);
    } else if (gameStats.length > 0) {
      // Use centralized statistics - filter to only this team's stats
      const teamStats = gameStats.filter(stat => stat.teamId === teamId);
      teamStats.forEach(stat => {
        ourScore += stat.goalsFor || 0;
        theirScore += stat.goalsAgainst || 0;
      });
    } else {
      // No scores available
      ourScore = 0;
      theirScore = 0;
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
 * For inter-club games, each team's performance counts as a separate game
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
  let totalGames = 0;

  for (const game of validGames) {
    const isHomeClub = game.homeClubId === clubId;
    const isAwayClub = game.awayClubId === clubId;
    const isInterClubGame = game.homeClubId === clubId && game.awayClubId === clubId;
    const gameStats = centralizedStats[game.id] || [];

    if (isInterClubGame) {
      // Inter-club game: each team counts as a separate game
      // Get stats for each team and calculate their individual results
      const homeTeamStats = gameStats.filter(stat => stat.teamId === game.homeTeamId);
      const awayTeamStats = gameStats.filter(stat => stat.teamId === game.awayTeamId);

      // Calculate home team result
      if (homeTeamStats.length > 0) {
        let homeScore = 0;
        let homeOpponentScore = 0;
        homeTeamStats.forEach(stat => {
          homeScore += stat.goalsFor || 0;
          homeOpponentScore += stat.goalsAgainst || 0;
        });

        if (homeScore > homeOpponentScore) {
          wins++;
        } else if (homeScore < homeOpponentScore) {
          losses++;
        } else {
          draws++;
        }
        totalGames++;
      }

      // Calculate away team result
      if (awayTeamStats.length > 0) {
        let awayScore = 0;
        let awayOpponentScore = 0;
        awayTeamStats.forEach(stat => {
          awayScore += stat.goalsFor || 0;
          awayOpponentScore += stat.goalsAgainst || 0;
        });

        if (awayScore > awayOpponentScore) {
          wins++;
        } else if (awayScore < awayOpponentScore) {
          losses++;
        } else {
          draws++;
        }
        totalGames++;
      }
    } else {
      // Regular game against another club: count as one game
      let ourScore = 0;
      let theirScore = 0;

      // Prioritize official scores from game status, then fall back to calculated stats
      if (game.statusTeamGoals !== null && game.statusOpponentGoals !== null) {
        // Use official scores from game status
        ourScore = isHomeClub ? (game.statusTeamGoals || 0) : (game.statusOpponentGoals || 0);
        theirScore = isHomeClub ? (game.statusOpponentGoals || 0) : (game.statusTeamGoals || 0);
      } else if (gameStats.length > 0) {
        // Use all stats from our club's teams in this game
        gameStats.forEach(stat => {
          ourScore += stat.goalsFor || 0;
          theirScore += stat.goalsAgainst || 0;
        });
      } else {
        // No scores available - skip this game
        continue;
      }

      // Count the result
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