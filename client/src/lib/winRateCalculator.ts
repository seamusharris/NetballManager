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

export interface OfficialScore {
  id: number;
  gameId: number;
  teamId: number;
  quarter: number;
  score: number;
}

/**
 * Calculate win rate for a team based on completed games with official scores only
 * Only counts games that are completed AND have official scores entered
 */
export function calculateTeamWinRate(
  games: GameWithStats[],
  teamId: number,
  clubId: number,
  officialScores: Record<number, OfficialScore[]> = {}
): WinRateResult {
  // Filter to only games where this team played and are completed
  const eligibleGames = games.filter(game => 
    game.statusIsCompleted && 
    game.statusAllowsStatistics &&
    (game.homeTeamId === teamId || game.awayTeamId === teamId)
  );

  let wins = 0;
  let losses = 0;
  let draws = 0;
  let totalGames = 0;

  for (const game of eligibleGames) {
    const gameScores = officialScores[game.id] || [];
    
    // Only count games that have official scores
    if (gameScores.length === 0) {
      continue;
    }

    // Calculate total scores for each team from official scores
    let ourScore = 0;
    let theirScore = 0;

    const isHome = game.homeTeamId === teamId;
    const ourTeamId = teamId;
    const theirTeamId = isHome ? game.awayTeamId : game.homeTeamId;

    // Sum up scores for our team
    gameScores.forEach(score => {
      if (score.teamId === ourTeamId) {
        ourScore += score.score;
      } else if (score.teamId === theirTeamId) {
        theirScore += score.score;
      }
    });

    // Only count if we have scores for both teams
    if (ourScore > 0 || theirScore > 0) {
      totalGames++;
      
      if (ourScore > theirScore) {
        wins++;
      } else if (ourScore < theirScore) {
        losses++;
      } else {
        draws++;
      }
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

/**
 * Calculate club-wide win rate across all teams using official scores only
 * For inter-club games, each team's performance counts as a separate game
 */
export function calculateClubWinRate(
  games: GameWithStats[],
  clubId: number,
  officialScores: Record<number, OfficialScore[]> = {}
): WinRateResult {
  // Filter to only games where this club played and are completed
  const eligibleGames = games.filter(game => 
    game.statusIsCompleted && 
    game.statusAllowsStatistics &&
    (game.homeClubId === clubId || game.awayClubId === clubId)
  );

  let wins = 0;
  let losses = 0;
  let draws = 0;
  let totalGames = 0;

  for (const game of eligibleGames) {
    const gameScores = officialScores[game.id] || [];
    
    // Only count games that have official scores
    if (gameScores.length === 0) {
      continue;
    }

    const isHomeClub = game.homeClubId === clubId;
    const isAwayClub = game.awayClubId === clubId;
    const isInterClubGame = game.homeClubId === clubId && game.awayClubId === clubId;

    if (isInterClubGame) {
      // Inter-club game: each team counts as a separate game
      // Calculate scores for both teams
      let homeScore = 0;
      let awayScore = 0;

      gameScores.forEach(score => {
        if (score.teamId === game.homeTeamId) {
          homeScore += score.score;
        } else if (score.teamId === game.awayTeamId) {
          awayScore += score.score;
        }
      });

      // Only count if we have scores
      if (homeScore > 0 || awayScore > 0) {
        // Home team result
        if (homeScore > awayScore) {
          wins++;
        } else if (homeScore < awayScore) {
          losses++;
        } else {
          draws++;
        }
        totalGames++;

        // Away team result (opposite of home team)
        if (awayScore > homeScore) {
          wins++;
        } else if (awayScore < homeScore) {
          losses++;
        } else {
          draws++;
        }
        totalGames++;
      }
    } else {
      // Regular game against another club: count as one game
      const ourTeamId = isHomeClub ? game.homeTeamId : game.awayTeamId;
      const theirTeamId = isHomeClub ? game.awayTeamId : game.homeTeamId;
      
      let ourScore = 0;
      let theirScore = 0;

      gameScores.forEach(score => {
        if (score.teamId === ourTeamId) {
          ourScore += score.score;
        } else if (score.teamId === theirTeamId) {
          theirScore += score.score;
        }
      });

      // Only count if we have scores
      if (ourScore > 0 || theirScore > 0) {
        totalGames++;
        
        if (ourScore > theirScore) {
          wins++;
        } else if (ourScore < theirScore) {
          losses++;
        } else {
          draws++;
        }
      }
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