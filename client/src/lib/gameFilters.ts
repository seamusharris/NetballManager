/**
 * Check if a single game is valid for statistical analysis
 */
export function isGameValidForStatistics(game: Game): boolean {
  // Must have a game status
  if (!game.gameStatus) return false;

  // Must be completed
  if (!game.gameStatus.isCompleted) return false;

  // Must allow statistics (this covers forfeit games, BYE games, etc.)
  if (!game.gameStatus.allowsStatistics) return false;

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
