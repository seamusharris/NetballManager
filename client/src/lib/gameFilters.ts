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