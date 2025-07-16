# API Standardization Migration Plan

## Overview
This document outlines the step-by-step migration from current inconsistent API patterns to standardized RESTful patterns.

## Current State Analysis

### Inconsistent Patterns Found:
```javascript
// Mixed URL patterns:
'/api/game/:gameId/team/:teamId'           // Legacy singular
'/api/games/:gameId/stats'                 // Standard plural
'/api/clubs/:clubId/games'                 // Good pattern
'/api/players'                             // Missing club context

// Case conversion issues:
- Some endpoints expect camelCase
- Others auto-convert to snake_case
- Response conversion inconsistent

// Response format variations:
{ data: [...] }                    // Some endpoints
{ success: true, data: [...] }     // Others
[...]                              // Direct arrays
```

## Migration Strategy

### Phase 1: Foundation (Week 1)
**Goal**: Set up standardization infrastructure without breaking existing functionality

#### Day 1-2: Middleware Setup
- [x] Create `server/api-patterns.ts` - URL pattern registry
- [x] Create `server/api-middleware.ts` - Standardization middleware
- [ ] Add middleware to main app (non-breaking)
- [ ] Test middleware with existing endpoints

#### Day 3-4: URL Redirects
- [ ] Implement legacy URL redirect middleware
- [ ] Test redirects for major legacy patterns:
  - `/api/game/:gameId/team/:teamId` → `/api/teams/:teamId/games/:gameId`
  - `/api/game-stats/:id` → `/api/games/stats/:id`
- [ ] Monitor redirect logs

#### Day 5: Case Conversion
- [ ] Enable automatic case conversion middleware
- [ ] Test with batch endpoints (should skip conversion)
- [ ] Verify frontend still receives camelCase responses

### Phase 2: Core Game APIs (Week 2)
**Goal**: Standardize the most critical game-related endpoints

#### Day 1-2: Game Stats API
Current patterns to standardize:
```javascript
// Current (inconsistent):
'/api/game/:gameId/team/:teamId/stats'     // Legacy
'/api/games/:gameId/stats'                 // Neutral view
'/api/clubs/:clubId/games/stats/batch'     // Batch

// Target (standardized):
'/api/games/:gameId/stats'                 // Neutral view ✓
'/api/teams/:teamId/games/:gameId/stats'   // Team perspective
'/api/clubs/:clubId/games/stats/batch'     // Club batch ✓
```

#### Day 3-4: Game Rosters API
```javascript
// Current:
'/api/game/:gameId/team/:teamId/rosters'   // Legacy
'/api/games/:gameId/rosters'               // Neutral

// Target:
'/api/games/:gameId/rosters'               // Neutral view
'/api/teams/:teamId/games/:gameId/rosters' // Team perspective
```

#### Day 5: Game Scores API
```javascript
// Current:
'/api/games/:gameId/scores'                // Good ✓

// Target:
'/api/games/:gameId/scores'                // Neutral view ✓
'/api/clubs/:clubId/games/scores/batch'    // Club batch ✓
```

### Phase 3: Team & Player APIs (Week 3)
**Goal**: Standardize team and player endpoints

#### Day 1-2: Team APIs
```javascript
// Current:
'/api/teams/:teamId/games'                 // Good ✓

// Target:
'/api/teams/:teamId'                       // Individual team
'/api/teams/:teamId/players'               // Team players
'/api/teams/:teamId/games'                 // Team games ✓
'/api/clubs/:clubId/teams'                 // Club teams
```

#### Day 3-4: Player APIs
```javascript
// Current:
'/api/players'                             // Missing context
'/api/players/:id'                         // Individual player

// Target:
'/api/players/:playerId'                   // Individual player ✓
'/api/players/:playerId/seasons'           // Player seasons ✓
'/api/clubs/:clubId/players'               // Club players
'/api/teams/:teamId/players'               // Team players
```

### Phase 4: Specialized APIs (Week 4)
**Goal**: Standardize remaining specialized endpoints

#### Day 1-2: Availability API
```javascript
// Current:
'/api/games/:gameId/availability'          // Game availability

// Target:
'/api/games/:gameId/availability'          // Neutral view ✓
'/api/teams/:teamId/games/:gameId/availability' // Team perspective
```

#### Day 3-4: Permissions & Borrowing
```javascript
// Current:
'/api/games/:gameId/permissions'           // Good ✓
'/api/clubs/:clubId/player-borrowing'      // Good ✓

// Target: (no changes needed)
'/api/games/:gameId/permissions'           // ✓
'/api/clubs/:clubId/player-borrowing'      // ✓
```

## Implementation Steps

### Step 1: Add Middleware to Main App
```javascript
// In server/index.ts or main app file
import { 
  standardCaseConversion, 
  extractRequestContext, 
  standardizeUrls 
} from './api-middleware';

// Add middleware (order matters!)
app.use('/api', standardizeUrls());        // URL redirects first
app.use('/api', extractRequestContext());  // Extract context
app.use('/api', standardCaseConversion()); // Case conversion last
```

### Step 2: Create New Standardized Routes
```javascript
// Create new route files following patterns:
// server/routes/games-api.ts
// server/routes/teams-api.ts  
// server/routes/clubs-api.ts
// server/routes/players-api.ts
```

### Step 3: Update Frontend Gradually
```javascript
// Update frontend API calls one endpoint at a time
// Use feature flags to switch between old/new endpoints
// Monitor for errors and rollback if needed
```

### Step 4: Remove Legacy Routes
```javascript
// After all frontend code uses new endpoints:
// 1. Remove legacy route handlers
// 2. Remove redirect middleware
// 3. Clean up old code
```

## Testing Strategy

### Automated Tests
- [ ] Unit tests for middleware functions
- [ ] Integration tests for URL redirects
- [ ] API response format validation tests
- [ ] Case conversion tests

### Manual Testing
- [ ] Test all major user flows
- [ ] Verify game perspective calculations
- [ ] Check batch operations still work
- [ ] Validate error responses

### Monitoring
- [ ] Log all redirect usage
- [ ] Monitor API response times
- [ ] Track error rates during migration
- [ ] Set up alerts for breaking changes

## Rollback Plan

### If Issues Arise:
1. **Disable middleware**: Comment out middleware in main app
2. **Revert frontend changes**: Use git to revert API client changes
3. **Monitor logs**: Check for specific error patterns
4. **Gradual re-enable**: Enable one middleware at a time

### Success Criteria:
- [ ] All existing functionality works unchanged
- [ ] New standardized endpoints return correct data
- [ ] Game perspectives calculate correctly
- [ ] Performance impact < 5%
- [ ] No increase in error rates

## Next Steps

1. **Review this plan** with team
2. **Set up development branch** for migration work
3. **Implement Phase 1** middleware
4. **Test thoroughly** before proceeding
5. **Get approval** before each phase

Would you like me to start with Phase 1 implementation?