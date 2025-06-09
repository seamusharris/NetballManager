
export const CACHE_KEYS = {
  // Base entities
  players: (clubId: number) => ['players', clubId],
  teams: (clubId: number) => ['teams', clubId],
  seasons: () => ['seasons'],
  activeSeason: () => ['seasons', 'active'],
  userClubs: () => ['user-clubs'],
  gameStatuses: () => ['game-statuses'],
  
  // Games
  games: (clubId: number, teamId?: number) => 
    teamId ? ['games', clubId, teamId] : ['games', clubId, 'all-teams'],
  game: (gameId: number) => ['games', gameId],
  
  // Rosters
  gameRoster: (gameId: number) => ['game-rosters', gameId],
  centralizedRosters: (clubId: number, gameIds: number[]) => 
    ['centralized-rosters', clubId, gameIds.sort().join(',')],
  
  // Statistics
  gameStats: (gameId: number) => ['game-stats', gameId],
  centralizedStats: (clubId: number, gameIds: number[]) => 
    ['centralized-stats', clubId, gameIds.sort().join(',')],
  
  // Computed data
  playerPerformance: (playerId: number, gameIds: number[]) => 
    ['player-performance', playerId, gameIds.sort().join(',')],
  teamAnalysis: (clubId: number, teamId?: number) => 
    ['team-analysis', clubId, teamId || 'all'],
  opponentAnalysis: (clubId: number, opponentTeamId: number) => 
    ['opponent-analysis', clubId, opponentTeamId],
};

// Helper to ensure consistent gameIds sorting
export const normalizeGameIds = (gameIds: number[]): string => 
  [...gameIds].sort((a, b) => a - b).join(',');
