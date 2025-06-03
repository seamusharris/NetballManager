/**
 * Check if a single game is valid for statistical analysis using the game status table
 */
export function isGameValidForStatistics(game: Game): boolean {
  // Must be completed
  if (!game.statusIsCompleted) return false;

  // Must allow statistics (this covers forfeit games, BYE games, etc.)
  if (!game.statusAllowsStatistics) return false;

  // Exclude abandoned games from statistics
  if (game.statusName === 'abandoned') return false;

  return true;
}

/**
 * Dashboard-specific filters using the game status table
 */
export function getCompletedGamesForStats(games: Game[]): Game[] {
  return games.filter(game => 
    game.statusIsCompleted === true && 
    game.statusAllowsStatistics === true &&
    game.statusName !== 'abandoned'
  );
}

export function getCompletedGamesForRecords(games: Game[]): Game[] {
  return games.filter(game => 
    game.statusIsCompleted === true &&
    game.statusName !== 'abandoned'
  );
}

export function getUpcomingGames(games: Game[]): Game[] {
  return games.filter(game => 
    game.statusIsCompleted !== true
  );
}

/**
 * Check if a single game counts for win/loss records (excludes abandoned games)
 */
export function isGameValidForRecords(game: Game): boolean {
  // Must have a game status
  if (!game.gameStatus) return false;

  // Must be completed
  if (!game.gameStatus.isCompleted) return false;

  // Exclude abandoned games from win/loss records
  if (game.gameStatus.name === 'abandoned') return false;

  return true;
}

/**
 * Check if a single game counts for points/ladder calculations (includes abandoned games with points)
 */
export function isGameValidForPoints(game: Game): boolean {
  // Must have a game status
  if (!game.gameStatus) return false;

  // Must be completed
  if (!game.gameStatus.isCompleted) return false;

  // Include all completed games for points calculation (even abandoned games if they award points)
  return true;
}


/**
 * Filter games by status using database-driven game status logic
 * @param games Array of games to filter
 * @param statusFilter The status filter value ('all', 'completed', 'upcoming', or exact status name)
 * @param searchQuery Optional search query to filter by opponent name, round, or date
 * @returns Filtered array of games
 */
export function filterGamesByStatus(
  games: Game[],
  statusFilter: string,
  searchQuery?: string
): Game[] {
  return games.filter(game => {
    // Apply search filter if provided
    let matchesSearch = true;
    if (searchQuery && searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      matchesSearch = 
        game.opponent?.teamName?.toLowerCase().includes(query) ||
        game.round?.toString().includes(query) ||
        new Date(game.date).toLocaleDateString().includes(query);
    }

    // If 'all' status filter, only apply search filter
    if (statusFilter === 'all') {
      return matchesSearch;
    }

    // Handle special filters using gameStatus.isCompleted
    if (statusFilter === 'completed') {
      return matchesSearch && game.gameStatus?.isCompleted === true;
    }
    
    if (statusFilter === 'upcoming') {
      return matchesSearch && game.gameStatus?.isCompleted !== true;
    }

    // Match exact status name from database
    return matchesSearch && game.gameStatus?.name === statusFilter;
  });
}
