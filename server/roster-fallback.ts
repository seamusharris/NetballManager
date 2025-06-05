// This file is no longer needed since stats are recorded directly against positions
// without requiring roster assignments. Position-based stats work independently
// of player assignments and rosters are only used for display purposes.

export function createFallbackRoster() {
  console.log('Roster fallback system removed - stats work with positions only');
}

export function ensurePositionContext() {
  console.log('Position context no longer required - stats recorded against positions directly');
  return null;
}