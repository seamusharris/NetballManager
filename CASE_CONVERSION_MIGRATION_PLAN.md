# Case Conversion Migration Plan

## Executive Summary
The bidirectional case conversion system is causing widespread issues across the application. This document outlines a systematic approach to fix the problems while maintaining system stability.

## Current Problems

### 1. Critical Issues
- **Player-to-Team Assignment**: `playerId` becomes `player_id`, causing null constraint violations
- **Game Creation**: Field name mismatches causing form submission failures
- **Statistics Recording**: Data loss due to field name conversion

### 2. Root Causes
- **Inconsistent Implementation**: Some endpoints expect camelCase, others snake_case
- **Drizzle ORM Conflicts**: ORM uses snake_case fields but receives camelCase data
- **Skip List Maintenance**: Reactive approach leads to missed endpoints

## Migration Strategy

### Phase 1: Immediate Stabilization (This Week)

#### Step 1.1: Disable Global Conversion
```typescript
// server/api-standards.ts
export function standardCaseConversion() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body && typeof req.body === 'object') {
      // TEMPORARILY DISABLED - causing widespread issues
      // Will re-enable with proper endpoint-specific configuration
      // req.body = snakecaseKeys(req.body, { deep: true });
    }

    // Keep response conversion - this works well
    const originalJson = res.json;
    res.json = function(data: any) {
      if (data && typeof data === 'object') {
        const camelData = camelcaseKeys(data, { deep: true });
        return originalJson.call(this, camelData);
      }
      return originalJson.call(this, data);
    };

    next();
  };
}
```

#### Step 1.2: Add Defensive Programming to Critical Endpoints
```typescript
// Pattern for handling both cases during transition
const playerId = req.body.playerId || req.body.player_id;
const isRegular = req.body.isRegular || req.body.is_regular;
const homeTeamId = req.body.homeTeamId || req.body.home_team_id;
```

**Priority Endpoints for Defensive Programming:**
1. `/api/teams/:teamId/players` (POST) - ✅ Already done
2. `/api/teams/:teamId/games/:gameId/availability` (POST) - ✅ Already done
3. `/api/games` (POST/PATCH) - Needs implementation
4. `/api/players` (POST/PATCH) - Needs implementation
5. `/api/clubs` (POST/PATCH) - Needs implementation

### Phase 2: Endpoint-Specific Configuration (Next Sprint)

#### Step 2.1: Create Endpoint Configuration System
```typescript
// server/endpoint-config.ts
export interface EndpointConfig {
  convertRequest: boolean;
  convertResponse: boolean;
  fieldMappings?: Record<string, string>;
}

export const endpointConfigs: Record<string, EndpointConfig> = {
  // Batch endpoints - working well with current setup
  '/api/games/stats/batch': {
    convertRequest: false,
    convertResponse: true
  },
  
  // CRUD endpoints - need request conversion
  '/api/teams/*/players': {
    convertRequest: true,
    convertResponse: true,
    description: 'Automatic camelCase → snake_case conversion'
  },
  
  // Legacy endpoints - maintain current behavior
  '/api/game/*/team/*/stats': {
    convertRequest: false,
    convertResponse: true
  }
};
```

#### Step 2.2: Implement Smart Conversion Middleware
```typescript
export function smartCaseConversion() {
  return (req: Request, res: Response, next: NextFunction) => {
    const config = getEndpointConfig(req.path);
    
    if (config?.convertRequest && req.body && typeof req.body === 'object') {
      // Always use automatic snake_case conversion for requests
      // This converts camelCase from client to snake_case for server/database
      req.body = snakecaseKeys(req.body, { deep: true });
    }

    // Response conversion (keep existing logic)
    if (config?.convertResponse !== false) {
      const originalJson = res.json;
      res.json = function(data: any) {
        if (data && typeof data === 'object') {
          const camelData = camelcaseKeys(data, { deep: true });
          return originalJson.call(this, camelData);
        }
        return originalJson.call(this, data);
      };
    }

    next();
  };
}
```

### Phase 3: Systematic Endpoint Migration (Following Sprints)

#### Step 3.1: Endpoint Categories for Migration

**Category A: High-Impact CRUD Operations**
- `/api/players` (POST/PATCH)
- `/api/teams` (POST/PATCH)
- `/api/games` (POST/PATCH)
- `/api/clubs` (POST/PATCH)

**Category B: Statistics and Batch Operations**
- `/api/games/*/stats` (POST)
- `/api/games/*/rosters` (POST)
- All batch endpoints

**Category C: Specialized Operations**
- `/api/teams/*/players` (POST)
- `/api/games/*/availability` (POST)
- `/api/games/*/permissions` (POST)

**Category D: Legacy Endpoints**
- `/api/game/*/team/*` (All methods)
- Deprecated endpoints

#### Step 3.2: Migration Process per Endpoint
1. **Analyze Current Usage**
   - Check client-side calls
   - Identify field names used
   - Test current behavior

2. **Implement Conversion**
   - Add to endpoint configuration
   - Update server-side handling
   - Add field mappings if needed

3. **Test Thoroughly**
   - Unit tests for endpoint
   - Integration tests with frontend
   - Manual testing of forms

4. **Deploy and Monitor**
   - Deploy with feature flag
   - Monitor for errors
   - Rollback if issues found

### Phase 4: Cleanup and Optimization (Future)

#### Step 4.1: Remove Defensive Programming
Once all endpoints are properly configured, remove the dual field handling:
```typescript
// Remove this pattern:
const playerId = req.body.playerId || req.body.player_id;

// Replace with:
const { player_id: playerId } = req.body;
```

#### Step 4.2: Standardize Database Operations
Ensure all Drizzle ORM operations use consistent field names:
```typescript
// Standardize on snake_case for database operations
await db.insert(teamPlayers).values({
  team_id: teamId,
  player_id: playerId,
  is_regular: isRegular
});
```

## Implementation Timeline

### Week 1: Emergency Fixes
- [ ] Disable global bidirectional conversion
- [ ] Add defensive programming to critical endpoints
- [ ] Test and verify fixes

### Week 2-3: Configuration System
- [ ] Implement endpoint configuration system
- [ ] Create smart conversion middleware
- [ ] Test with pilot endpoints

### Week 4-6: Systematic Migration
- [ ] Migrate Category A endpoints
- [ ] Migrate Category B endpoints
- [ ] Migrate Category C endpoints

### Week 7-8: Legacy Cleanup
- [ ] Handle legacy endpoints
- [ ] Remove defensive programming
- [ ] Performance optimization

## Testing Strategy

### 1. Automated Testing
```typescript
// Example test for endpoint conversion
describe('POST /api/teams/:teamId/players', () => {
  it('should handle camelCase input', async () => {
    const response = await request(app)
      .post('/api/teams/123/players')
      .send({ playerId: 456, isRegular: true });
    
    expect(response.status).toBe(201);
  });

  it('should handle snake_case input', async () => {
    const response = await request(app)
      .post('/api/teams/123/players')
      .send({ player_id: 456, is_regular: true });
    
    expect(response.status).toBe(201);
  });
});
```

### 2. Integration Testing
- Test all forms in the frontend
- Verify data integrity
- Check API response formats

### 3. Manual Testing Checklist
- [ ] Player creation and editing
- [ ] Team management
- [ ] Game creation and editing
- [ ] Statistics recording
- [ ] Availability management

## Risk Mitigation

### 1. Rollback Plan
- Keep defensive programming until migration complete
- Feature flags for endpoint-specific conversion
- Database backups before major changes

### 2. Monitoring
- Log conversion errors
- Track endpoint usage patterns
- Monitor performance impact

### 3. Communication
- Document changes for team
- Update API documentation
- Notify frontend developers of changes

## Success Criteria

### Phase 1 Success
- [ ] No more null constraint violations
- [ ] Forms submit successfully
- [ ] Data integrity maintained

### Phase 2 Success
- [ ] Endpoint configuration system working
- [ ] Pilot endpoints migrated successfully
- [ ] No performance degradation

### Final Success
- [ ] All endpoints properly configured
- [ ] Consistent case handling across system
- [ ] No defensive programming needed
- [ ] Clean, maintainable codebase

---
*Document Version: 1.0*
*Last Updated: 2025-07-19*
*Next Review: Weekly during migration*