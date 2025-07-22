# Team Routes Migration Plan

## Overview
Several team-related routes are still in the main `server/routes.ts` file and should be moved to `server/team-routes.ts` to complete the separation, similar to what was done for clubs and players.

## Routes to Move

### 1. Team Games Routes
- `GET /api/teams/:teamId/games/simplified` (lines ~1105-1150)
- `GET /api/teams/:teamId/games` (lines ~1274-1350)

### 2. Team Availability Routes
- `GET /api/teams/:teamId/games/:gameId/availability` (lines ~1729-1740)
- `POST /api/teams/:teamId/games/:gameId/availability` (lines ~1758-1790)
- `PATCH /api/teams/:teamId/games/:gameId/availability/:playerId` (lines ~1832-1850)

### 3. Team Roster Routes
- `GET /api/teams/:teamId/games/:gameId/rosters` (lines ~3316-3390)
- `DELETE /api/teams/:teamId/games/:gameId/rosters` (lines ~3392-3410)
- `POST /api/teams/:teamId/games/:gameId/rosters/batch` (lines ~3416-3500)
- `POST /api/clubs/:clubId/teams/:teamId/games/:gameId/rosters/batch` (lines ~3547-3600)

### 4. Other Team-Related Routes
- `GET /api/players/:playerId/teams` (lines ~2231-2250)
- `GET /api/game/:gameId/team/:teamId/rosters` (lines ~2466-2487)
- `GET /api/games/:gameId/team-awards` (lines ~2488-2554)
- `POST /api/games/:gameId/team-awards` (lines ~2555-2624)
- `GET /api/games/:gameId/team-notes` (lines ~2625-2675)
- `POST /api/games/:gameId/team-notes` (lines ~2676-2750)

### 5. Duplicate Routes to Remove
- `GET /api/teams/all` - This exists in both files, keep the one in team-routes.ts
- `GET /api/teams` - This exists in both files as deprecated, keep the one in team-routes.ts

## Implementation Steps

1. **Move team games routes** from main routes to team-routes.ts
2. **Move team availability routes** from main routes to team-routes.ts
3. **Move team roster routes** from main routes to team-routes.ts
4. **Move other team-related routes** from main routes to team-routes.ts
5. **Remove duplicate routes** from main routes file
6. **Test all moved routes** to ensure they work correctly
7. **Update any imports** that might be needed

## Dependencies to Check
- Ensure all required imports are available in team-routes.ts
- Check for any shared utilities that need to be imported
- Verify authentication middleware is properly imported

## Testing
- Test all moved routes to ensure they work correctly
- Verify no functionality is broken after the move
- Check that duplicate routes are properly removed