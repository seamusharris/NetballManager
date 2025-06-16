
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
 * Calculate win rate for a team based on completed games with official scores
 * Priority: 1) Official scores, 2) Game status fixed scores, 3) Skip game
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
    
    let ourScore = 0;
    let theirScore = 0;
    let hasValidScore = false;

    // Priority 1: Try official scores first
    if (gameScores.length > 0) {
      const isHome = game.homeTeamId === teamId;
      const ourTeamId = teamId;
      const theirTeamId = isHome ? game.awayTeamId : game.homeTeamId;

      // Sum up scores for each team from official scores
      gameScores.forEach(score => {
        if (score.teamId === ourTeamId) {
          ourScore += score.score;
        } else if (score.teamId === theirTeamId) {
          theirScore += score.score;
        }
      });

      // Check if we have scores for both teams
      const ourTeamHasScores = gameScores.some(s => s.teamId === ourTeamId);
      const theirTeamHasScores = gameScores.some(s => s.teamId === theirTeamId);
      
      hasValidScore = ourTeamHasScores && theirTeamHasScores;
    }

    // Priority 2: Fall back to game status fixed scores if no official scores
    if (!hasValidScore && 
        typeof game.statusTeamGoals === 'number' && 
        typeof game.statusOpponentGoals === 'number') {
      
      const isHome = game.homeTeamId === teamId;
      
      if (isHome) {
        ourScore = game.statusTeamGoals;
        theirScore = game.statusOpponentGoals;
      } else {
        ourScore = game.statusOpponentGoals;
        theirScore = game.statusTeamGoals;
      }
      
      hasValidScore = true;
    }

    // Only count games where we have valid scores
    if (hasValidScore) {
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
 * Calculate club-wide win rate across all teams using official scores
 * For inter-club games, each team's performance counts as a separate game
 * Priority: 1) Official scores, 2) Game status fixed scores, 3) Skip game
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
    const isHomeClub = game.homeClubId === clubId;
    const isAwayClub = game.awayClubId === clubId;
    const isInterClubGame = game.homeClubId === clubId && game.awayClubId === clubId;

    let homeScore = 0;
    let awayScore = 0;
    let hasValidScore = false;

    // Priority 1: Try official scores first
    if (gameScores.length > 0) {
      // Calculate scores for both teams
      gameScores.forEach(score => {
        if (score.teamId === game.homeTeamId) {
          homeScore += score.score;
        } else if (score.teamId === game.awayTeamId) {
          awayScore += score.score;
        }
      });

      // Check if we have scores for both teams
      const homeTeamHasScores = gameScores.some(s => s.teamId === game.homeTeamId);
      const awayTeamHasScores = gameScores.some(s => s.teamId === game.awayTeamId);
      
      hasValidScore = homeTeamHasScores && awayTeamHasScores;
    }

    // Priority 2: Fall back to game status fixed scores if no official scores
    if (!hasValidScore && 
        typeof game.statusTeamGoals === 'number' && 
        typeof game.statusOpponentGoals === 'number') {
      
      homeScore = game.statusTeamGoals;
      awayScore = game.statusOpponentGoals;
      hasValidScore = true;
    }

    // Only count games where we have valid scores
    if (hasValidScore) {
      if (isInterClubGame) {
        // Inter-club game: each team counts as a separate game
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
      } else {
        // Regular game against another club: count as one game
        const ourScore = isHomeClub ? homeScore : awayScore;
        const theirScore = isHomeClub ? awayScore : homeScore;
        
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
