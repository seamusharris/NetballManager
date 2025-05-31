
# API Response Standards

## Data Transformation Rules

### 1. **Always Use Flat CamelCase Properties**
- ✅ `seasonName`, `seasonYear`, `opponentTeamName`
- ❌ `season: { name, year }`, `opponent: { teamName }`

### 2. **Database Column Mapping**
- `snake_case` database columns → `camelCase` API properties
- `team_name` → `teamName`
- `created_at` → `createdAt`

### 3. **Relationship Data Flattening**
When including related entity data, prefix with the entity name:
```typescript
// ✅ Correct - Flat with prefixes
{
  id: 1,
  name: "Game 1",
  seasonId: 1,
  seasonName: "Autumn 2025",
  seasonYear: 2025,
  opponentId: 2,
  opponentTeamName: "Thunder Netball"
}

// ❌ Incorrect - Nested objects
{
  id: 1,
  name: "Game 1",
  season: { id: 1, name: "Autumn 2025", year: 2025 },
  opponent: { id: 2, teamName: "Thunder Netball" }
}
```

### 4. **Implementation Checklist**
For every new API endpoint:
- [ ] Use storage layer transformation functions
- [ ] Apply camelCase conversion
- [ ] Flatten all relationship data
- [ ] Handle null values properly
- [ ] Test with TypeScript interfaces

### 5. **Validation**
All API responses should match this pattern:
- No snake_case properties
- No nested relationship objects
- Consistent null handling
- TypeScript type safety
