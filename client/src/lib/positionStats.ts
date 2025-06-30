
export function hasPositionStats(gameStats: any[] | undefined | null): boolean {
  return !!(gameStats && gameStats.length > 0);
}

export function hasPositionStatsForTeam(gameStats: any[] | undefined | null, teamId: number): boolean {
  if (!gameStats || gameStats.length === 0) {
    return false;
  }
  return gameStats.some(stat => stat.teamId === teamId);
}

export function getPositionStatsCount(gameStats: any[] | undefined | null): number {
  return gameStats?.length || 0;
}

export function getPositionStatsCountForTeam(gameStats: any[] | undefined | null, teamId: number): number {
  if (!gameStats || gameStats.length === 0) {
    return 0;
  }
  return gameStats.filter(stat => stat.teamId === teamId).length;
}
