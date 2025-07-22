# Client Components to Update for Standardized API Response Format

## Overview
The following client components need to be updated to handle the new standardized API response format (`{ success: true, data: [...] }`). These components currently expect direct data responses and need to extract data from the `data` property of the standardized response.

## High Priority Components

### Pages with Direct API Calls
1. **Statistics.tsx**
   - `fetch('/api/games/${selectedGameId}/rosters')`
   - `fetch('/api/games/${selectedGameId}/stats')`

2. **GameDetails.tsx**
   - `fetch('/api/games/${gameId}/team-awards')`

3. **DataManagement.tsx** and **Settings.tsx**
   - Multiple direct fetch calls to various endpoints

4. **PrintableStatsSheet.tsx**
   - `fetch('/api/games/${game.id}/rosters')`
   - `fetch('/api/players')`

### Components Using React Query
1. **PlayerTeamsManager.tsx**
   - `fetch('/api/players/${player.id}/teams')`
   - `fetch('/api/teams/all')`

2. **PlayerClubsManager.tsx**
   - `fetch('/api/clubs')`
   - `fetch('/api/players/${player.id}/clubs')`

3. **PlayerSeasonsManager.tsx**
   - `fetch('/api/players/${player.id}/seasons')`

4. **PlayerPerformance.tsx** and **PerformanceCharts.tsx**
   - `fetch('/api/games/${gameId}/rosters')`
   - `fetch('/api/games/${gameId}/stats')`

## Medium Priority Components

### Components Using apiClient
Most components using `apiClient.get()` may already handle the standardized format if the apiClient is configured to extract the data property. These should be checked:

1. **ClubDashboard.tsx**
2. **PlayerAvailability.tsx**
3. **StatsRecorder.tsx**
4. **Preparation.tsx**
5. **Teams.tsx**

## Recommended Update Pattern

### For Direct fetch Calls
```typescript
// Before
const data = await response.json();

// After
const result = await response.json();
const data = result.data || result; // Handle both formats for backward compatibility
```

### For React Query
```typescript
// Before
queryFn: async () => {
  const response = await fetch('/api/endpoint');
  return response.json();
}

// After
queryFn: async () => {
  const response = await fetch('/api/endpoint');
  const result = await response.json();
  return result.data || result; // Handle both formats
}
```

### For apiClient
Check if apiClient already handles the standardized format. If not, update it:

```typescript
// In apiClient.ts
const get = async (url) => {
  const response = await fetch(url);
  const result = await response.json();
  return result.data || result; // Extract data property if available
}
```

## Testing Strategy
1. Test each updated component to ensure it correctly handles the standardized response format
2. Verify that components work with both old and new response formats for backward compatibility
3. Focus on critical components first (those handling core data like teams, players, games)
4. Update apiClient if needed to handle the standardized format globally