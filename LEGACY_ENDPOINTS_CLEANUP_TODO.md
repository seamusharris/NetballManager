# Legacy Endpoints Cleanup TODO

## Overview
During the case conversion system implementation, we identified several legacy endpoints that need auditing and cleanup. These endpoints work but have technical debt that should be addressed.

## Priority: Medium
These endpoints are functional but need refactoring for maintainability and consistency.

## Legacy Endpoints Requiring Cleanup

### 1. Game-Team Stats Endpoint
**Location:** `server/game-stats-routes.ts`
**Endpoint:** `POST /api/game/:gameId/team/:teamId/stats`

**Issues Found:**
- Uses array-based data structure (`{ stats: [...] }`) instead of direct object
- Mixed SQL query patterns (some use Drizzle ORM, others use raw SQL)
- Inconsistent error handling patterns
- Returns 200 OK instead of 201 Created for POST operations

**Cleanup Tasks:**
- [ ] Standardize data structure expectations
- [ ] Convert all queries to use Drizzle ORM consistently
- [ ] Implement proper HTTP status codes (201 for creation)
- [ ] Add comprehensive error handling
- [ ] Add proper validation schemas
- [ ] Consider deprecation in favor of standardized endpoints

### 2. Game-Team Rosters Endpoint
**Location:** `server/game-stats-routes.ts`
**Endpoint:** `POST /api/game/:gameId/team/:teamId/rosters`

**Issues Found:**
- Originally tried to use non-existent `team_id` field in rosters table
- Complex team association logic through player relationships
- Inconsistent with other roster endpoints
- Array-based data structure requirement

**Cleanup Tasks:**
- [ ] Simplify team association logic
- [ ] Standardize with other roster endpoints
- [ ] Improve error messages for team/player validation
- [ ] Add proper transaction handling for roster updates
- [ ] Consider consolidating with main roster endpoints

### 3. General Legacy Endpoint Issues

**Cross-cutting Concerns:**
- [ ] **Authentication Patterns:** Some legacy endpoints use different auth middleware
- [ ] **Response Formatting:** Inconsistent use of `transformToApiFormat`
- [ ] **Error Handling:** Mix of different error response patterns
- [ ] **Validation:** Some endpoints lack proper input validation
- [ ] **Documentation:** Missing or outdated API documentation
- [ ] **Testing:** Limited test coverage for edge cases

## Recommended Approach

### Phase 1: Audit and Document
- [ ] Create comprehensive inventory of all legacy endpoints
- [ ] Document current behavior and dependencies
- [ ] Identify which endpoints are still actively used by frontend
- [ ] Map legacy endpoints to their modern equivalents

### Phase 2: Standardize
- [ ] Apply consistent authentication patterns
- [ ] Standardize error handling and response formats
- [ ] Implement proper HTTP status codes
- [ ] Add comprehensive input validation

### Phase 3: Migrate or Deprecate
- [ ] For endpoints with modern equivalents: plan deprecation
- [ ] For unique functionality: migrate to standardized patterns
- [ ] Update frontend code to use standardized endpoints
- [ ] Add deprecation warnings to legacy endpoints

### Phase 4: Remove
- [ ] Remove deprecated endpoints after migration period
- [ ] Clean up related test code
- [ ] Update documentation

## Impact Assessment
- **Risk Level:** Low (endpoints are functional)
- **User Impact:** None (internal refactoring)
- **Development Impact:** Improved maintainability and consistency
- **Timeline:** Can be done incrementally alongside other features

## Related Files
- `server/game-stats-routes.ts` - Main legacy endpoints
- `server/endpoint-config.ts` - Case conversion configuration
- `tests/api/case-conversion.test.ts` - Test coverage
- `server/api-patterns.ts` - URL pattern mappings
- `server/api-standards.ts` - Standardization guidelines

## Notes
- These endpoints were fixed during case conversion implementation but retain technical debt
- All endpoints are currently passing tests and functional
- Cleanup can be done incrementally without breaking changes
- Consider this work as part of broader API standardization effort