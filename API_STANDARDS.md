# API Standards Documentation

## Case Conversion Standards

### Overview
Our API follows **bidirectional case conversion** to maintain consistency between frontend (JavaScript/TypeScript) and backend (database) naming conventions.

### Case Conversion Rules

#### Frontend ↔ Backend Translation
- **Frontend sends**: `camelCase` field names (e.g., `availablePlayerIds`)
- **Backend receives**: `snake_case` field names (e.g., `available_player_ids`)
- **Backend responds**: `snake_case` from database
- **Frontend receives**: `camelCase` field names (automatically converted)

#### Implementation
1. **Request Conversion**: `standardCaseConversion()` middleware converts incoming request bodies from camelCase to snake_case
2. **Response Conversion**: Same middleware converts outgoing responses from snake_case to camelCase
3. **Database**: Always uses snake_case field names
4. **Frontend**: Always uses camelCase field names

### Middleware Application

```typescript
// server/index.ts
app.use('/api', standardCaseConversion()); // Applied to ALL /api routes
```

### Example Data Flow

#### POST Request Example
```javascript
// Frontend sends:
{
  "availablePlayerIds": [1, 2, 3],
  "explicitlyEmpty": false
}

// Backend receives (after middleware conversion):
{
  "available_player_ids": [1, 2, 3],
  "explicitly_empty": false
}

// Backend endpoint accesses:
const { available_player_ids: availablePlayerIds, explicitly_empty: explicitlyEmpty } = req.body;
```

#### GET Response Example
```javascript
// Database returns:
{
  "display_name": "John Doe",
  "first_name": "John",
  "position_preferences": ["GS", "GA"]
}

// Frontend receives (after middleware conversion):
{
  "displayName": "John Doe",
  "firstName": "John", 
  "positionPreferences": ["GS", "GA"]
}
```

### Skip Conversion Paths
Some endpoints skip case conversion for specific requirements:

```typescript
const skipConversionPaths = [
  '/api/games/stats/batch',
  '/api/games/scores/batch',
  '/api/clubs/*/games/stats/batch',
  '/api/clubs/*/games/scores/batch'
];
```

### Backend Endpoint Patterns

#### Standard Pattern (with case conversion)
```typescript
app.post('/api/teams/:teamId/games/:gameId/availability', async (req, res) => {
  // Expect snake_case due to middleware conversion
  const { available_player_ids: availablePlayerIds, explicitly_empty: explicitlyEmpty } = req.body;
  
  if (!Array.isArray(availablePlayerIds)) {
    return res.status(400).json({ message: "availablePlayerIds must be an array" });
  }
  
  // Process data...
  res.json({ message: "Success" }); // Response will be converted to camelCase
});
```

#### Skip Conversion Pattern
```typescript
app.post('/api/games/stats/batch', async (req, res) => {
  // Expect camelCase (no conversion applied)
  const { gameIds, playerStats } = req.body;
  
  // Process data...
  res.json({ success: true }); // Response will NOT be converted
});
```

### Frontend API Client
The frontend API client should always send camelCase and expect camelCase responses:

```typescript
// Always use camelCase in frontend
const response = await apiClient.post('/api/teams/123/games/112/availability', {
  availablePlayerIds: [1, 2, 3],
  explicitlyEmpty: false
});

// Response will be in camelCase
console.log(response.message); // "Success"
```

### Database Schema
Database tables and columns always use snake_case:

```sql
CREATE TABLE player_availability (
  id SERIAL PRIMARY KEY,
  game_id INTEGER NOT NULL,
  player_id INTEGER NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Key Points
1. **Consistency**: ALL API endpoints follow the same case conversion rules
2. **Transparency**: Frontend developers work with camelCase, backend developers work with snake_case
3. **Automatic**: Conversion happens automatically via middleware
4. **Exceptions**: Only specific endpoints skip conversion (documented above)
5. **Database**: Always snake_case, never mixed case

### Troubleshooting
If you encounter case-related issues:

1. **Check middleware application**: Ensure `standardCaseConversion()` is applied to `/api` routes
2. **Verify endpoint expectations**: Standard endpoints expect snake_case in req.body
3. **Check skip list**: Ensure endpoint isn't in the skip conversion paths
4. **Debug logging**: Add logging to see actual req.body structure

### Migration Notes
When updating existing endpoints:
- Endpoints expecting camelCase in req.body should be updated to expect snake_case
- OR added to the skip conversion paths if they need to remain camelCase
- Frontend code should always use camelCase regardless of backend changes