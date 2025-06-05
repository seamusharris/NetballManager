
// Roster fallback system removed - stats are now recorded directly against positions
// without requiring player assignments. Position-based stats work independently.

export function createFallbackRoster() {
  console.log('Roster fallback system removed - stats work with positions only');
  return Promise.resolve();
}

export function ensurePositionContext() {
  console.log('Position context no longer required - stats recorded against positions directly');
  return Promise.resolve(null);
}

// Legacy function - no longer needed
export async function createMinimalRosterAssignment() {
  console.log('Minimal roster assignments no longer created - position-based stats only');
  return null;
}
