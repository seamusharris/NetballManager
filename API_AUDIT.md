# API Standardization Audit

## Current Working Endpoints (DO NOT BREAK)

### ✅ Club Games (Working)
- `GET /api/clubs/:clubId/games` - **WORKING** (40+ games)
- `POST /api/clubs/:clubId/games/scores/batch` - **WORKING** (after fallback fix)
- `POST /api/clubs/:clubId/games/stats/batch` - **WORKING**
- `POST /api/clubs/:clubId/games/rosters/batch` - **WORKING**

### ✅ Team Games (Working)  
- `GET /api/teams/:teamId/games` - **WORKING**
- Score display on team dashboard - **WORKING** (after fix)

### ✅ Individual Game Access (Working)
- `GET /api/games/:gameId` - **WORKING**
- `GET /api/games/:gameId/stats` - **WORKING**
- `GET /api/games/:gameId/scores` - **WORKING**

## Legacy Patterns to Migrate (Carefully)

### 🔄 Game-Centric Legacy Patterns
- `/api/game/:gameId/team/:teamId` → `/api/teams/:teamId/games/:gameId`
- `/api/game/:gameId/team/:teamId/stats` → `/api/teams/:teamId/games/:gameId/stats`
- `/api/game/:gameId/team/:teamId/rosters` → `/api/teams/:teamId/games/:gameId/rosters`

### 🔄 Stats Legacy Patterns  
- `/api/game-stats/:id` → `/api/games/stats/:id`
- `/api/gamestats/:id` → `/api/games/stats/:id`

## Standardization Strategy

### Phase 1: Non-Breaking Additions
1. ✅ Fix data fetching issues (COMPLETED)
2. 📝 Document current patterns (IN PROGRESS)
3. 🔧 Add new standardized endpoints alongside existing ones
4. 🧪 Test new endpoints thoroughly

### Phase 2: Gradual Migration  
1. 🔄 Update frontend to use new endpoints (one at a time)
2. 🧪 Test each change thoroughly
3. 📊 Monitor for regressions
4. 🗑️ Remove old endpoints only after full migration

### Phase 3: Cleanup
1. 🧹 Remove legacy endpoints
2. 📚 Update documentation
3. 🎉 Complete standardization

## Key Principles

1. **Never break working functionality**
2. **Test each change incrementally**  
3. **Keep fallbacks for critical paths**
4. **Monitor performance impact**
5. **Document everything**

## Current Status

- ✅ **Score display issue FIXED** (removed 10-game limit)
- ✅ **All existing endpoints working**
- 🚧 **API standardization in progress**
- ⚠️ **Middleware temporarily disabled** (needs careful reimplementation)