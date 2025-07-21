# API Migration Plan: Standardizing Case Conversion

## Current State Analysis

Our APIs currently have **inconsistent case handling**:

1. **Response-only conversion**: Smart response middleware converts responses to camelCase
2. **Mixed request handling**: Some endpoints expect camelCase, some snake_case, some handle both
3. **No systematic request conversion**: Frontend sends camelCase but backend handling varies

## Target Architecture

**Option A: Response-Only (Current Majority)**
- Frontend sends: camelCase
- Backend expects: camelCase in req.body
- Database uses: snake_case
- Responses converted: snake_case → camelCase

**Option B: Full Bidirectional**
- Frontend sends: camelCase
- Middleware converts: camelCase → snake_case
- Backend expects: snake_case in req.body
- Database uses: snake_case
- Responses converted: snake_case → camelCase

## Recommendation: Option A (Response-Only)

**Reasons:**
1. **Least Breaking Changes**: Most endpoints already expect camelCase
2. **Frontend Consistency**: Frontend always works with camelCase
3. **Simpler Architecture**: No request conversion complexity
4. **Existing Pattern**: Matches current majority implementation

## Migration Strategy

### Phase 1: Audit and Categorize (Current)
- ✅ Identify endpoints expecting camelCase
- ✅ Identify endpoints expecting snake_case
- ✅ Identify endpoints handling both

### Phase 2: Standardize High-Impact Endpoints
**Priority Order:**
1. **Authentication & Core**: Login, user management
2. **Game Management**: Create/edit games, scores, stats
3. **Player Management**: Create/edit players, availability
4. **Team Management**: Create/edit teams, rosters
5. **Reporting & Analytics**: Batch endpoints, statistics

### Phase 3: Update Inconsistent Endpoints
**Target Pattern:**
```typescript
// Standard pattern - expect camelCase
app.post('/api/endpoint', async (req, res) => {
  const { camelCaseField, anotherField } = req.body;
  
  // Convert to snake_case for database operations
  const dbData = {
    camel_case_field: camelCaseField,
    another_field: anotherField
  };
  
  // Database operations...
  const result = await db.insert(table).values(dbData);
  
  // Response automatically converted to camelCase
  res.json(result);
});
```

### Phase 4: Frontend Validation
- Test all forms and API calls
- Ensure consistent camelCase usage
- Update any snake_case remnants

## Endpoints Requiring Updates

### Currently Expecting snake_case (Need to change to camelCase):

1. **Age Groups/Sections Routes** (`server/age-groups-sections-routes.ts`)
   - `display_name`, `is_active` → `displayName`, `isActive`

2. **Some Game Stats Routes** (`server/game-stats-routes.ts`)
   - Mixed patterns, some already use camelCase

### Currently Handling Both (Simplify to camelCase only):

1. **Game Scores Routes** (`server/game-scores-routes.ts`)
   - Remove `camelcaseKeys(req.body)` conversions
   - Expect camelCase directly

2. **Batch Endpoints** (`server/routes.ts`)
   - Standardize on camelCase input

## Implementation Steps

### Step 1: Update Age Groups/Sections (Low Risk) ✅ COMPLETED
- ✅ Changed `display_name` → `displayName`
- ✅ Changed `is_active` → `isActive`
- ✅ Updated division creation endpoint
- ✅ Updated sections CRUD endpoints
- ✅ Proper camelCase to snake_case conversion for database operations

### Step 2: Update Game Management (Medium Risk) ✅ MOSTLY COMPLETED
- ✅ Game creation/editing already using camelCase consistently
- ✅ Batch endpoints simplified (removed dual camelCase/snake_case handling)
- ✅ Score recording endpoints already using camelCase
- ✅ Removed `camelcaseKeys(req.body)` from batch scores endpoint
- ✅ Removed `camelcaseKeys(req.body)` from batch stats endpoint
- ✅ Removed `camelcaseKeys(req.body)` from batch rosters endpoint

### Step 3: Update Player Management (Medium Risk)
- Standardize player creation/editing
- Update availability endpoints
- Test player workflows

### Step 4: Update Batch Endpoints (High Risk)
- Remove dual handling
- Standardize on camelCase
- Test statistics and reporting

## Testing Strategy

1. **Unit Tests**: Update API endpoint tests
2. **Integration Tests**: Test full workflows
3. **Frontend Tests**: Verify form submissions
4. **Manual Testing**: Test critical user journeys

## Rollback Plan

- Keep git commits small and focused
- Test each endpoint change individually
- Have database backups ready
- Document any breaking changes

## Success Criteria

- ✅ All endpoints expect camelCase in req.body
- ✅ All responses converted to camelCase
- ✅ Database continues using snake_case
- ✅ Frontend works consistently with camelCase
- ✅ No breaking changes for existing functionality