# API Response Standardization - Client Implementation Guide

## Overview

This guide outlines how to update client components to handle the standardized API response format. All server-side endpoints now return responses in the following format:

```typescript
// Success Response
{
  "success": true,
  "data": <actual_data>,
  "meta": {
    "timestamp": "2025-07-22T03:05:23.548Z"
  }
}

// Error Response
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  },
  "meta": {
    "timestamp": "2025-07-22T03:05:23.548Z"
  }
}
```

## Implementation Approach

### 1. Use the New API Response Handler

We've created a new utility module `apiResponseHandler.ts` that provides functions for handling standardized API responses:

```typescript
import { fetchApi } from "@/lib/apiResponseHandler";

// Example usage
const data = await fetchApi<YourDataType>('/api/endpoint');
```

### 2. Update React Query Components

For components using React Query:

```typescript
// Before
const { data } = useQuery({
  queryKey: ['key'],
  queryFn: async () => {
    const response = await fetch('/api/endpoint');
    if (!response.ok) throw new Error('Failed');
    return response.json();
  }
});

// After
const { data } = useQuery({
  queryKey: ['key'],
  queryFn: async () => {
    return fetchApi<YourDataType>('/api/endpoint');
  }
});
```

### 3. Update Direct Fetch Calls

For components making direct fetch calls:

```typescript
// Before
const response = await fetch('/api/endpoint');
const data = await response.json();

// After
const data = await fetchApi<YourDataType>('/api/endpoint');
```

### 4. Update Mutation Calls

For mutation operations:

```typescript
// Before
const response = await fetch('/api/endpoint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
const result = await response.json();

// After
const result = await fetchApi('/api/endpoint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

## Components to Update

### High Priority

1. **Statistics.tsx**
   - Update fetch calls for rosters and game stats

2. **GameDetails.tsx**
   - Update fetch call for team awards

3. **PrintableStatsSheet.tsx**
   - Update fetch calls for rosters and players

4. **PlayerPerformance.tsx** and **PerformanceCharts.tsx**
   - Update fetch calls for rosters and stats

### Medium Priority

1. **DataManagement.tsx** and **Settings.tsx**
   - Update multiple direct fetch calls

2. **StatsDebug.tsx**
   - Update fetch call for game stats

3. **Preparation2.tsx**
   - Update fetch call for game rosters

### Low Priority

1. **Components using apiClient**
   - The apiClient already handles standardized responses, but verify that it's working correctly

## Testing

After updating each component:

1. Test the component to ensure it correctly displays data
2. Verify that error handling works correctly
3. Check that all functionality (add, update, delete) works as expected

## Example: Updated PlayerTeamsManager Component

```typescript
import { fetchApi } from "@/lib/apiResponseHandler";

// Fetch player's current teams
const { data: playerTeams = [], isLoading: isTeamsLoading } = useQuery<Team[]>({
  queryKey: ['players', player.id, 'teams'],
  queryFn: async () => {
    return fetchApi<Team[]>(`/api/players/${player.id}/teams`);
  },
  enabled: !!player?.id,
});

// Add player to team
await fetchApi(`/api/teams/${teamId}/players`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    playerId: player.id,
    isRegular: true 
  })
});

// Remove player from team
await fetchApi(`/api/teams/${teamId}/players/${player.id}`, {
  method: 'DELETE',
});
```