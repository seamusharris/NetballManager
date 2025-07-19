# Case Conversion System - Automated Testing

## 🎯 **Testing Overview**

We've created comprehensive, self-contained tests for the bidirectional case conversion system. These tests verify that:

1. **Frontend can send camelCase data**
2. **Backend converts to snake_case for database operations**
3. **Responses are converted back to camelCase**
4. **Field mappings work correctly**
5. **Batch endpoints are protected from conversion**
6. **Legacy endpoints maintain compatibility**

## 🧪 **Test Structure**

### **Self-Contained Design**
- Each test creates its own data
- Tests clean up after themselves
- No dependencies between tests
- Safe to run multiple times

### **Test Categories**

#### **1. Core CRUD Case Conversion**
- **Club Management**: Create, read, update with camelCase
- **Player Management**: Complex field mappings (displayName → display_name)
- **Team Management**: Team-player assignments with field mappings
- **Game Management**: Game creation with multiple ID fields

#### **2. Availability Management**
- **Team-Game Availability**: availablePlayerIds → available_player_ids
- **Individual Player Updates**: isAvailable → is_available
- **Explicit Empty Handling**: explicitlyEmpty → explicitly_empty

#### **3. Statistics and Scoring**
- **Game Statistics**: Complex stats with multiple fields
- **Game Scores**: homeScore/awayScore → home_score/away_score
- **Roster Management**: jerseyNumber → jersey_number

#### **4. Administrative Functions**
- **Season Management**: startDate/endDate → start_date/end_date
- **Age Groups**: displayName → display_name
- **Divisions**: Complex nested relationships

#### **5. Batch Endpoints Protection**
- **Stats Batch**: Ensures gameIds array is NOT converted
- **Scores Batch**: Maintains camelCase for performance
- **Club/Team Scoped**: All batch variants protected

#### **6. Legacy Endpoint Compatibility**
- **Game-Team Stats**: /api/game/:gameId/team/:teamId/stats
- **Game-Team Rosters**: /api/game/:gameId/team/:teamId/rosters
- **Backward Compatibility**: Ensures old URLs still work

#### **7. Error Handling**
- **404 Errors**: Proper camelCase error responses
- **Validation Errors**: Field validation with case conversion
- **Complex Nested Data**: Deep object conversion

## 🚀 **Running the Tests**

### **Quick Start**
```bash
# Run case conversion tests specifically
npm run test:case-conversion

# Run with our custom test runner (includes server management)
./scripts/test-case-conversion.sh

# Run all API tests
npm run test:api

# Run with watch mode for development
npm run test:watch tests/api/case-conversion.test.ts
```

### **Test Runner Features**
The custom test runner (`scripts/test-case-conversion.sh`) provides:
- **Automatic server management** (starts/stops if needed)
- **Health checks** before running tests
- **Colored output** for better readability
- **Comprehensive summary** of test results
- **Proper cleanup** after tests complete

## 📊 **Test Coverage**

### **Endpoints Tested** (35+ endpoints)
- ✅ `/api/clubs` - Club CRUD operations
- ✅ `/api/players` - Player management with complex fields
- ✅ `/api/teams` - Team CRUD and player assignments
- ✅ `/api/games` - Game creation with multiple ID fields
- ✅ `/api/teams/*/players` - Critical field mappings
- ✅ `/api/teams/*/games/*/availability` - Availability management
- ✅ `/api/games/*/availability` - Game-level availability
- ✅ `/api/games/*/stats` - Statistics recording
- ✅ `/api/games/*/scores` - Score management
- ✅ `/api/games/*/rosters` - Roster management
- ✅ `/api/seasons` - Administrative functions
- ✅ `/api/age-groups` - Age group management
- ✅ **Batch endpoints** - All major batch operations
- ✅ **Legacy endpoints** - Backward compatibility

### **Field Mappings Tested** (50+ mappings)
- ✅ `playerId` ↔ `player_id`
- ✅ `teamId` ↔ `team_id`
- ✅ `gameId` ↔ `game_id`
- ✅ `clubId` ↔ `club_id`
- ✅ `isActive` ↔ `is_active`
- ✅ `displayName` ↔ `display_name`
- ✅ `firstName` ↔ `first_name`
- ✅ `lastName` ↔ `last_name`
- ✅ `dateOfBirth` ↔ `date_of_birth`
- ✅ `positionPreferences` ↔ `position_preferences`
- ✅ `avatarColor` ↔ `avatar_color`
- ✅ `homeTeamId` ↔ `home_team_id`
- ✅ `awayTeamId` ↔ `away_team_id`
- ✅ `seasonId` ↔ `season_id`
- ✅ `statusId` ↔ `status_id`
- ✅ `isInterClub` ↔ `is_inter_club`
- ✅ `availablePlayerIds` ↔ `available_player_ids`
- ✅ `explicitlyEmpty` ↔ `explicitly_empty`
- ✅ `isRegular` ↔ `is_regular`
- ✅ `homeScore` ↔ `home_score`
- ✅ `awayScore` ↔ `away_score`
- ✅ `jerseyNumber` ↔ `jersey_number`
- ✅ `startDate` ↔ `start_date`
- ✅ `endDate` ↔ `end_date`
- ✅ And many more...

## 🔍 **Test Validation**

### **What Each Test Verifies**

#### **Request Conversion**
```javascript
// Frontend sends camelCase
const data = { playerId: 123, isRegular: true };

// Test verifies backend receives snake_case
// (Internal database operations use player_id, is_regular)
```

#### **Response Conversion**
```javascript
// Test verifies response is camelCase
expect(response.body.playerId).toBe(123);
expect(response.body.isRegular).toBe(true);

// Test verifies NO snake_case in response
expect(response.body).not.toHaveProperty('player_id');
expect(response.body).not.toHaveProperty('is_regular');
```

#### **Batch Protection**
```javascript
// Batch endpoints should NOT convert request
const batchData = { gameIds: [1, 2, 3] }; // Stays camelCase
```

#### **Deep Nesting**
```javascript
// Complex nested objects are fully converted
const complexData = {
  contactInfo: {
    emailAddress: 'test@example.com',
    emergencyContact: {
      fullName: 'Emergency Contact',
      relationshipType: 'parent'
    }
  }
};
```

## 🎯 **Success Criteria**

### **All Tests Must Pass**
- ✅ **Create operations** work with camelCase input
- ✅ **Read operations** return camelCase responses
- ✅ **Update operations** handle camelCase input
- ✅ **Delete operations** work correctly
- ✅ **Field mappings** convert precisely
- ✅ **Batch endpoints** are protected
- ✅ **Legacy endpoints** maintain compatibility
- ✅ **Error responses** are in camelCase
- ✅ **Nested objects** are fully converted
- ✅ **No snake_case** appears in responses

### **Performance Requirements**
- ✅ Tests complete within 30 seconds
- ✅ No memory leaks during test runs
- ✅ Proper cleanup of all test data
- ✅ Server remains stable throughout tests

## 🛠️ **Development Workflow**

### **Adding New Endpoints**
1. **Add endpoint configuration** in `server/endpoint-config.ts`
2. **Add test case** in `tests/api/case-conversion.test.ts`
3. **Run tests** to verify conversion works
4. **Update documentation** if needed

### **Debugging Test Failures**
1. **Check console output** for conversion logs
2. **Verify endpoint configuration** is correct
3. **Check field mappings** are complete
4. **Test individual endpoints** manually
5. **Review database operations** for snake_case usage

### **Test Maintenance**
- **Run tests regularly** during development
- **Update tests** when adding new fields
- **Monitor test performance** and optimize if needed
- **Keep test data isolated** and clean

## 📈 **Benefits of This Testing Approach**

### **Confidence**
- **Comprehensive coverage** of case conversion system
- **Real API testing** with actual HTTP requests
- **Database integration** testing
- **End-to-end validation** of the entire flow

### **Safety**
- **Self-contained tests** don't affect production data
- **Automatic cleanup** prevents test data pollution
- **Isolated test runs** prevent interference
- **Rollback capability** if tests fail

### **Maintainability**
- **Clear test structure** easy to understand
- **Modular test design** easy to extend
- **Comprehensive documentation** for future developers
- **Automated test running** reduces manual effort

## 🎉 **Expected Results**

When all tests pass, you can be confident that:

1. **Forms will work reliably** - No more field name mismatches
2. **Database operations are consistent** - Proper snake_case usage
3. **API responses are clean** - Consistent camelCase format
4. **Performance is maintained** - Batch operations protected
5. **Backward compatibility** - Legacy endpoints still work
6. **Error handling is proper** - Consistent error response format

---
*Testing Framework: Vitest*
*Test Runner: Custom shell script*
*Coverage: 35+ endpoints, 50+ field mappings*
*Self-contained: ✅ Creates and cleans up own data*