# API Standardization Audit Report

## Overview
This audit identifies endpoints and components that are not using the standardized response format (`createSuccessResponse`/`createErrorResponse`) or not properly handling it on the client side.

## Server-Side Endpoints NOT Using Standardized Format

### 1. Game Status Routes (`server/game-status-routes.ts`)
- `GET /api/game-statuses` - Returns raw array
- `GET /api/game-statuses/:id` - Returns raw object
- `PATCH /api/game-statuses/:id` - Returns raw object
- `DELETE /api/game-statuses/:id` - Returns plain message object

### 2. Player Borrowing Routes (`server/player-borrowing-routes.ts`)
- `GET /api/clubs/:clubId/borrowing-requests` - Uses `transformToApiFormat` only
- `POST /api/borrowing-requests` - Returns plain message object
- `PATCH /api/borrowing-requests/:id` - Returns plain message object
- `DELETE /api/borrowing-requests/:id` - Returns plain message object
- `GET /api/clubs/:clubId/players/available-for-borrowing` - Uses `transformToApiFormat` only
- `GET /api/games/:gameId/borrowed-players` - Uses `transformToApiFormat` only

### 3. Season Routes (`server/season-routes.ts`)
- `PATCH /api/seasons/:id` - Uses `transformToApiFormat` only
- `POST /api/seasons/:id/activate` - Returns raw object
- `DELETE /api/seasons/:id` - Returns plain success object

### 4. Player Season Routes (`server/player-season-routes.ts`)
- `POST /api/players/:playerId/seasons` - Returns plain success object
- `GET /api/players/:playerId/seasons` - Returns raw array

### 5. Team Routes (`server/team-routes.ts`)
**Multiple endpoints using only `transformToApiFormat`:**
- `GET /api/seasons/:seasonId/teams`
- `GET /api/seasons/:seasonId/team-assignments`
- `GET /api/seasons/:seasonId/default-team`
- `GET /api/teams` (deprecated)
- `PATCH /api/teams/:id` - Uses `camelcaseKeys` only
- `DELETE /api/teams/:id` - Returns plain success object
- `POST /api/teams/:teamId/players`
- `PATCH /api/teams/:teamId/players/:playerId`
- `GET /api/teams/:teamId/stats`
- `GET /api/teams/:teamId/roster/:gameId`
- `GET /api/teams/:teamId/games/:gameId`
- `GET /api/teams/:teamId/availability/:gameId`
- `GET /api/teams/:teamId/available-players`
- `GET /api/teams/:teamId/games/simplified`
- `GET /api/teams/:teamId/games/:gameId/rosters`
- `DELETE /api/teams/:teamId/games/:gameId/rosters` - Returns plain success object
- `POST /api/teams/:teamId/games/:gameId/rosters/batch` - Returns plain success object

### 6. Game Permissions Routes (`server/game-permissions-routes.ts`)
- `GET /api/games/:gameId/permissions` - Returns raw array
- `POST /api/game-permissions` - Returns plain message object
- `POST /api/game-permissions/bulk` - Returns plain message object
- `DELETE /api/game-permissions/:id` - Returns plain message object
- `GET /api/game-permissions/available-clubs` - Returns raw array

### 7. Game Stats Routes (`server/game-stats-routes.ts`)
- `PATCH /api/games/:gameId/stats/:statId` - Uses `transformToApiFormat` only
- `POST /api/games/:gameId/stats/batch` - Uses `transformToApiFormat` only
- `GET /api/teams/:teamId/games/:gameId/stats` - Uses `transformToApiFormat` only
- `POST /api/games/stats/batch` - Uses `transformToApiFormat` only

### 8. Game Scores Routes (`server/game-scores-routes.ts`)
- `POST /api/games/scores/batch` - Uses `transformToApiFormat` only
- `GET /api/games/:gameId/scores` - Returns empty object or uses `transformToApiFormat`

### 9. Game Routes (`server/game-routes.ts`)
- `GET /api/clubs/:clubId/games` - Uses `transformToApiFormat` only
- `GET /api/clubs/:clubId/games/simplified` - Uses `transformToApiFormat` only
- `GET /api/teams/:teamId/games/simplified` - Uses `transformToApiFormat` only
- `GET /api/games` - Uses `transformToApiFormat` only
- `GET /api/games/:id` - Uses `transformToApiFormat` only
- `PATCH /api/games/:id` - Uses `transformToApiFormat` only

### 10. Debug/Admin Routes
- `server/debug-routes.ts` - All debug endpoints return plain objects
- `server/usage-tracker.ts` - Returns raw stats object
- `server/index.ts` - Health check returns plain object
- `server/age-groups-sections-routes.ts` - Test endpoint returns plain object

## Client-Side Components NOT Handling Standardized Format

### 1. Components expecting raw arrays/objects:
- `client/src/pages/Statistics.tsx` - Multiple fetch calls expecting raw data
- `client/src/pages/DataManagement.tsx` - Cleanup operations expecting raw arrays
- `client/src/pages/Settings.tsx` - Cleanup operations expecting raw arrays
- `client/src/components/stats/PrintableStatsSheet.tsx` - Expecting raw data
- `client/src/components/dashboard/BatchScoreDisplay.tsx` - May need format handling
- `client/src/components/dashboard/PlayerPerformance.tsx` - Expecting raw rosters
- `client/src/components/dashboard/PerformanceCharts.tsx` - Expecting raw stats
- `client/src/components/players/PlayerTeamsManager.tsx` - Multiple endpoints
- `client/src/components/players/PlayerClubsManager.tsx` - Multiple endpoints

### 2. Components that may need updates:
- `client/src/pages/GameDetails.tsx` - Team awards endpoint
- `client/src/pages/StatsDebug.tsx` - Game stats endpoint
- `client/src/components/games/GamesList.tsx` - Batch rosters endpoint
- `client/src/components/players/PlayerSeasonsManager.tsx` - Player seasons endpoint

## Recommendations

### High Priority (Breaking Changes)
1. **Update all team-routes.ts endpoints** to use standardized format
2. **Update game-stats-routes.ts endpoints** to use standardized format
3. **Update game-permissions-routes.ts endpoints** to use standardized format

### Medium Priority
1. **Update season-routes.ts** remaining endpoints
2. **Update player-borrowing-routes.ts** endpoints
3. **Update game-status-routes.ts** endpoints

### Low Priority
1. Debug and admin endpoints (can remain as-is for internal use)
2. Health check endpoint (standard format not necessary)

### Client-Side Updates Needed
1. **Update all components** to handle `{ data: [...] }` format
2. **Add error handling** for standardized error responses
3. **Create utility functions** for consistent API response handling

## Implementation Strategy
1. Start with server-side endpoints that have the most client usage
2. Update client components in parallel with server changes
3. Use feature flags or gradual rollout for critical endpoints
4. Add comprehensive tests for both old and new formats during transition