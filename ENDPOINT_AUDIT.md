# Comprehensive API Endpoint Audit

## Overview
This document provides a complete audit of all API endpoints in the system, analyzing their case handling patterns, request/response formats, and migration requirements.

## Audit Methodology
- Scanned all server files for endpoint definitions
- Analyzed request body handling patterns
- Identified case conversion requirements
- Categorized by risk level and migration priority

## Endpoint Categories

### 1. HEALTH & DEBUG ENDPOINTS
| Endpoint | Method | File | Request Body | Case Handling | Status |
|----------|--------|------|--------------|---------------|--------|
| `/api/health` | GET | index.ts | None | N/A | ✅ Safe |
| `/api/debug/case-conversion` | GET/POST | debug-routes.ts | Test data | Mixed | 🔧 Debug only |
| `/api/admin/usage-stats` | GET | smart-response-middleware.ts | None | N/A | ✅ Safe |

### 2. PLAYER MANAGEMENT ENDPOINTS
| Endpoint | Method | File | Request Body | Case Handling | Status |
|----------|--------|------|--------------|---------------|--------|
| `/api/players` | GET/POST | routes.ts | Player data | camelCase expected | ⚠️ Needs review |
| `/api/players/:id` | GET/PATCH/DELETE | routes.ts | Player data | camelCase expected | ⚠️ Needs review |
| `/api/players/:id/seasons` | POST | routes.ts | Season data | camelCase expected | ⚠️ Needs review |
| `/api/players/:id/clubs` | POST | routes.ts | Club data | camelCase expected | ⚠️ Needs review |
| `/api/direct/players/:id` | PATCH | routes.ts | Player data | camelCase expected | ⚠️ Needs review |

### 3. TEAM MANAGEMENT ENDPOINTS
| Endpoint | Method | File | Request Body | Case Handling | Status |
|----------|--------|------|--------------|---------------|--------|
| `/api/teams` | GET/POST | team-routes.ts | Team data | Mixed | 🚨 BROKEN |
| `/api/teams/:id` | GET/PATCH/DELETE | team-routes.ts | Team data | Mixed | ⚠️ Needs review |
| `/api/teams/:teamId/players` | GET/POST | team-routes.ts | Player assignment | 🚨 CASE ISSUE | 🚨 BROKEN |
| `/api/teams/:teamId/players/:playerId` | PATCH/DELETE | team-routes.ts | Player data | Mixed | ⚠️ Needs review |
| `/api/clubs/:clubId/teams` | GET | team-routes.ts | None | N/A | ✅ Safe |

### 4. GAME MANAGEMENT ENDPOINTS
| Endpoint | Method | File | Request Body | Case Handling | Status |
|----------|--------|------|--------------|---------------|--------|
| `/api/games` | GET/POST | routes.ts | Game data | camelCase expected | ⚠️ Needs review |
| `/api/games/:id` | GET/PATCH/DELETE | routes.ts | Game data | camelCase expected | ⚠️ Needs review |
| `/api/games/:gameId/award` | POST | routes.ts | Award data | camelCase expected | ⚠️ Needs review |
| `/api/games/:gameId/notes` | POST | routes.ts | Notes data | camelCase expected | ⚠️ Needs review |

### 5. STATISTICS ENDPOINTS
| Endpoint | Method | File | Request Body | Case Handling | Status |
|----------|--------|------|--------------|---------------|--------|
| `/api/games/stats/batch` | POST | game-stats-routes.ts | Game IDs | ✅ SKIP LIST | ✅ Safe |
| `/api/clubs/:clubId/games/stats/batch` | POST | game-stats-routes.ts | Game IDs | ✅ SKIP LIST | ✅ Safe |
| `/api/games/:gameId/stats` | GET/POST | routes.ts | Stats data | camelCase expected | ⚠️ Needs review |
| `/api/teams/:teamId/games/:gameId/stats` | GET | game-stats-routes.ts | None | N/A | ✅ Safe |

### 6. SCORES ENDPOINTS
| Endpoint | Method | File | Request Body | Case Handling | Status |
|----------|--------|------|--------------|---------------|--------|
| `/api/games/scores/batch` | POST | game-scores-routes.ts | Game IDs | ✅ SKIP LIST | ✅ Safe |
| `/api/clubs/:clubId/games/scores/batch` | POST | game-scores-routes.ts | Game IDs | ✅ SKIP LIST | ✅ Safe |
| `/api/games/:gameId/scores` | GET/POST | game-scores-routes.ts | Score data | Mixed | ⚠️ Needs review |

### 7. ROSTER ENDPOINTS
| Endpoint | Method | File | Request Body | Case Handling | Status |
|----------|--------|------|--------------|---------------|--------|
| `/api/games/rosters/batch` | POST | routes.ts | Game IDs | camelCase expected | ⚠️ Needs review |
| `/api/games/:gameId/rosters` | GET/POST | routes.ts | Roster data | camelCase expected | ⚠️ Needs review |
| `/api/teams/:teamId/games/:gameId/rosters` | GET | standardized-routes.ts | None | N/A | ✅ Safe |

### 8. AVAILABILITY ENDPOINTS
| Endpoint | Method | File | Request Body | Case Handling | Status |
|----------|--------|------|--------------|---------------|--------|
| `/api/teams/:teamId/games/:gameId/availability` | GET/POST | routes.ts | Player IDs | ✅ SKIP LIST + DEFENSIVE | ✅ Fixed |
| `/api/games/:gameId/availability` | GET/POST | routes.ts | Player IDs | camelCase expected | ⚠️ Needs review |

### 9. LEGACY ENDPOINTS (TO BE DEPRECATED)
| Endpoint | Method | File | Request Body | Case Handling | Status |
|----------|--------|------|--------------|---------------|--------|
| `/api/game/:gameId/team/:teamId` | GET | game-stats-routes.ts | None | N/A | 🔄 Legacy |
| `/api/game/:gameId/team/:teamId/stats` | GET/POST | game-stats-routes.ts | Stats data | Mixed | 🔄 Legacy |
| `/api/game/:gameId/team/:teamId/rosters` | GET/POST | game-stats-routes.ts | Roster data | Mixed | 🔄 Legacy |

### 10. ADMINISTRATIVE ENDPOINTS
| Endpoint | Method | File | Request Body | Case Handling | Status |
|----------|--------|------|--------------|---------------|--------|
| `/api/seasons` | GET/POST | routes.ts | Season data | camelCase expected | ⚠️ Needs review |
| `/api/seasons/active` | GET | routes.ts | None | N/A | ✅ Safe |
| `/api/game-statuses` | GET | game-status-routes.ts | None | N/A | ✅ Safe |
| `/api/clubs` | GET/POST | routes.ts | Club data | camelCase expected | ⚠️ Needs review |
| `/api/clubs/:id` | GET/PATCH/DELETE | routes.ts | Club data | camelCase expected | ⚠️ Needs review |

## Risk Assessment

### 🚨 CRITICAL ISSUES (Immediate Fix Required)
1. **`/api/teams/:teamId/players` (POST)** - Player ID becomes null due to case conversion
2. **Team management endpoints** - Mixed case handling causing data corruption

### ⚠️ HIGH RISK (Needs Review)
1. **All player CRUD endpoints** - Potential data integrity issues
2. **Game creation/editing endpoints** - Form submissions may fail
3. **Statistics recording endpoints** - Data loss potential

### 🔧 MEDIUM RISK (Monitor)
1. **Batch endpoints not in skip list** - Performance impact
2. **Legacy endpoints** - Inconsistent behavior

### ✅ LOW RISK (Stable)
1. **GET endpoints with no request body** - Safe
2. **Endpoints in skip list** - Protected
3. **Debug/health endpoints** - Non-critical

## Migration Strategy Recommendations

### Phase 1: Emergency Fixes (This Week)
1. **Disable bidirectional conversion temporarily**
2. **Add defensive programming to critical endpoints**
3. **Expand skip list for known working endpoints**

### Phase 2: Systematic Migration (Next Sprint)
1. **Audit each endpoint individually**
2. **Create endpoint-specific configuration**
3. **Implement gradual rollout with feature flags**

### Phase 3: Clean Implementation (Future)
1. **Remove defensive programming**
2. **Standardize on snake_case for database operations**
3. **Remove skip list in favor of proper implementation**

## Current Skip List Status
```typescript
const skipConversionPaths = [
  '/api/games/stats/batch',                    // ✅ Working
  '/api/games/scores/batch',                   // ✅ Working  
  '/api/clubs/*/games/stats/batch',           // ✅ Working
  '/api/clubs/*/games/scores/batch',          // ✅ Working
  '/api/teams/*/games/*/availability',        // ✅ Fixed
  '/api/teams/*/players'                      // 🚨 Still broken
];
```

## Immediate Action Items
1. [ ] Disable bidirectional conversion globally
2. [ ] Fix `/api/teams/:teamId/players` endpoint
3. [ ] Add defensive programming to high-risk endpoints
4. [ ] Create endpoint-specific migration plan
5. [ ] Implement comprehensive testing strategy

---
*Last Updated: 2025-07-19*
*Next Review: Weekly until migration complete*