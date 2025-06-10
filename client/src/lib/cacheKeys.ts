
export const CACHE_KEYS = {
  // Base entities - consistent patterns
  players: (clubId: number, teamId?: number) => 
    teamId ? ['players', clubId, teamId] : ['players', clubId],
  
  teams: (clubId: number) => ['teams', clubId],
  
  seasons: (clubId: number) => ['seasons', clubId],
  activeSeason: (clubId: number) => ['seasons', 'active', clubId],
  
  userClubs: () => ['user-clubs'],
  
  gameStatuses: (clubId: number) => ['game-statuses', clubId],
  
  // Games with consistent team handling
  games: (clubId: number, teamId?: number, isClubWide?: boolean) => {
    if (isClubWide) return ['games', clubId, 'club-wide'];
    return teamId ? ['games', clubId, teamId] : ['games', clubId, 'all-teams'];
  },
  
  game: (gameId: number) => ['game', gameId],
  
  // Batch operations with normalized IDs
  batchGameData: (clubId: number, teamId: number | null, gameIds: number[]) => [
    'batch-game-data', 
    clubId, 
    teamId || 'all-teams', 
    normalizeGameIds(gameIds)
  ],
  
  // Rosters with team context
  gameRoster: (gameId: number, teamId?: number) => 
    teamId ? ['roster', gameId, teamId] : ['roster', gameId],
  
  batchRosters: (clubId: number, gameIds: number[]) => 
    ['batch-rosters', clubId, normalizeGameIds(gameIds)],
  
  // Statistics
  gameStats: (gameId: number) => ['stats', gameId],
  
  batchStats: (clubId: number, gameIds: number[]) => 
    ['batch-stats', clubId, normalizeGameIds(gameIds)],
  
  // Scores
  gameScores: (gameId: number) => ['scores', gameId],
  
  batchScores: (clubId: number, gameIds: number[]) => 
    ['batch-scores', clubId, normalizeGameIds(gameIds)],
  
  // Dashboard aggregations
  dashboardData: (clubId: number, teamId: number | null) => 
    ['dashboard', clubId, teamId || 'all-teams'],
};

// Helper to ensure consistent gameIds sorting
export const normalizeGameIds = (gameIds: number[]): string => 
  [...gameIds].sort((a, b) => a - b).join(',');

// Cache invalidation helpers
export const invalidateGameRelated = (queryClient: any, gameId: number) => {
  queryClient.invalidateQueries({ 
    predicate: (query: any) => {
      const key = query.queryKey;
      return key.includes('game') && (key.includes(gameId) || key.includes(gameId.toString()));
    }
  });
};

export const invalidateTeamRelated = (queryClient: any, clubId: number, teamId: number) => {
  queryClient.invalidateQueries({
    predicate: (query: any) => {
      const key = query.queryKey;
      return key.includes(clubId) && key.includes(teamId);
    }
  });
};
