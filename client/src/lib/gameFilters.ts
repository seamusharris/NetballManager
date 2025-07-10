
/**
 * Unified Game Filtering System
 * Single source of truth for all game filtering logic
 */

import { Game } from '@shared/schema';

// Core filter predicates - building blocks for all filters
export const gamePredicates = {
  isCompleted: (game: Game): boolean => game.statusIsCompleted === true,
  allowsStatistics: (game: Game): boolean => game.statusAllowsStatistics === true,
  isNotBye: (game: Game): boolean => !game.isBye && game.statusName !== 'bye',
  isNotAbandoned: (game: Game): boolean => game.statusName !== 'abandoned',
  isUpcoming: (game: Game): boolean => game.statusIsCompleted !== true,
  hasValidDate: (game: Game): boolean => !!game.date,
  isInCurrentSeason: (game: Game, seasonId?: number): boolean => 
    !seasonId || game.seasonId === seasonId
};

// Standard filter combinations - used across all components
export const standardFilters = {
  // For dashboard widgets showing recent activity
  completedGames: (games: Game[]): Game[] => 
    games.filter(game => 
      gamePredicates.isCompleted(game) && 
      gamePredicates.isNotBye(game) && 
      gamePredicates.isNotAbandoned(game)
    ),

  // For statistics calculations (stricter requirements)
  statisticsEligibleGames: (games: Game[]): Game[] => 
    games.filter(game => 
      gamePredicates.isCompleted(game) && 
      gamePredicates.allowsStatistics(game) && 
      gamePredicates.isNotBye(game) && 
      gamePredicates.isNotAbandoned(game)
    ),

  // For win/loss records (includes forfeits but excludes abandoned)
  recordEligibleGames: (games: Game[]): Game[] => 
    games.filter(game => 
      gamePredicates.isCompleted(game) && 
      gamePredicates.isNotBye(game) && 
      gamePredicates.isNotAbandoned(game)
    ),

  // For upcoming games display
  upcomingGames: (games: Game[]): Game[] => 
    games.filter(game => 
      gamePredicates.isUpcoming(game) && 
      gamePredicates.isNotBye(game) && 
      gamePredicates.hasValidDate(game)
    ),

  // For recent form (last N completed games regardless of stats eligibility)
  recentForm: (games: Game[], limit: number = 5): Game[] => 
    standardFilters.completedGames(games)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit)
};

// Context-aware filtering (team vs club perspective)
export const contextualFilters = {
  forTeam: (games: Game[], teamId: number) => ({
    completed: () => standardFilters.completedGames(games).filter(game => 
      game.homeTeamId === teamId || game.awayTeamId === teamId
    ),
    upcoming: () => standardFilters.upcomingGames(games).filter(game => 
      game.homeTeamId === teamId || game.awayTeamId === teamId
    ),
    recent: (limit?: number) => standardFilters.recentForm(
      games.filter(game => game.homeTeamId === teamId || game.awayTeamId === teamId), 
      limit
    )
  }),

  forClub: (games: Game[], clubId: number) => ({
    completed: () => standardFilters.completedGames(games).filter(game => 
      game.homeClubId === clubId || game.awayClubId === clubId
    ),
    upcoming: () => standardFilters.upcomingGames(games).filter(game => 
      game.homeClubId === clubId || game.awayClubId === clubId
    ),
    recent: (limit?: number) => standardFilters.recentForm(
      games.filter(game => game.homeClubId === clubId || game.awayClubId === clubId), 
      limit
    )
  })
};

// Legacy function mappings for backward compatibility (will be removed in Phase 2)
export const getCompletedGamesForStats = standardFilters.statisticsEligibleGames;
export const getCompletedGamesForRecords = standardFilters.recordEligibleGames;
export const getUpcomingGames = standardFilters.upcomingGames;

// Individual game validation function
export const isGameValidForStatistics = (game: Game): boolean => {
  return gamePredicates.isCompleted(game) && 
         gamePredicates.allowsStatistics(game) && 
         gamePredicates.isNotBye(game) && 
         gamePredicates.isNotAbandoned(game);
};

// Status-based filtering for game lists
export function filterGamesByStatus(
  games: Game[],
  statusFilter: string,
  searchQuery?: string
): Game[] {
  return games.filter(game => {
    // Apply search filter
    let matchesSearch = true;
    if (searchQuery?.trim()) {
      const query = searchQuery.toLowerCase();
      matchesSearch = 
        game.opponent?.teamName?.toLowerCase().includes(query) ||
        game.round?.toString().includes(query) ||
        new Date(game.date).toLocaleDateString().includes(query);
    }

    // Apply status filter
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'completed') return matchesSearch && gamePredicates.isCompleted(game);
    if (statusFilter === 'upcoming') return matchesSearch && gamePredicates.isUpcoming(game);
    
    return matchesSearch && game.gameStatus?.name === statusFilter;
  });
}
