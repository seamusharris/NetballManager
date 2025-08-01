# API Endpoint Mapping and Restructuring Plan

Generated: August 1, 2025

## Overview

This document maps all current API endpoints in NeballManager and proposes a restructured API design that better reflects the domain relationships:

- **Games** are independent entities where teams compete
- **Players** can belong to multiple clubs  
- **Teams** belong to clubs
- **Stats** can be game-level (official) or team-game level (recorded by teams)

## Current Endpoint Inventory

### 1. Club Management

| Current Endpoint | Method | Purpose | Status |
|-----------------|--------|---------|--------|
| `/api/clubs` | GET | List all clubs | ✅ Keep |
| `/api/clubs` | POST | Create club | ✅ Keep |
| `/api/clubs/:clubId` | GET | Get club details | ✅ Keep |
| `/api/clubs/:clubId` | PATCH | Update club | ✅ Keep |
| `/api/clubs/:clubId` | DELETE | Delete club | ✅ Keep |
| `/api/clubs/:clubId/players` | GET | Get club players | ✅ Keep |
| `/api/clubs/:clubId/players` | POST | Add player to club | ✅ Keep |
| `/api/clubs/:clubId/players/:playerId` | PATCH | Update player in club | ✅ Keep |
| `/api/clubs/:clubId/players/:playerId` | DELETE | Remove player from club | ✅ Keep |
| `/api/clubs/:clubId/teams` | GET | Get club teams | ✅ Keep |
| `/api/clubs/:clubId/teams` | POST | Create team in club | ✅ Keep |
| `/api/clubs/:clubId/games` | GET | Games involving club | ✅ Keep |
| `/api/clubs/:clubId/games/simplified` | GET | Simplified game list | ⚠️ Consolidate |

### 2. Team Management

| Current Endpoint | Method | Purpose | Status |
|-----------------|--------|---------|--------|
| `/api/teams` | GET | Get teams (deprecated) | ❌ Remove |
| `/api/teams` | POST | Create team (legacy) | ❌ Remove |
| `/api/teams/:id` | PATCH | Update team (legacy) | ❌ Remove |
| `/api/teams/:id` | DELETE | Delete team (legacy) | ❌ Remove |
| `/api/teams/all` | GET | All teams across clubs | ✅ Keep |
| `/api/teams/:teamId/players` | GET | Get team players | ✅ Keep |
| `/api/teams/:teamId/players` | POST | Add player to team | ✅ Keep |
| `/api/teams/:teamId/players/:playerId` | DELETE | Remove from team | ✅ Keep |
| `/api/teams/:teamId/games` | GET | Team's games | ✅ Keep |
| `/api/teams/:teamId/games/:gameId/stats` | GET | Team's stats for game | ✅ Keep |
| `/api/teams/:teamId/games/:gameId/roster` | GET | Team's roster for game | ✅ Keep |

### 3. Player Management  

| Current Endpoint | Method | Purpose | Status |
|-----------------|--------|---------|--------|
| `/api/players` | GET | All players (deprecated) | ❌ Remove |
| `/api/players` | POST | Create player (legacy) | ❌ Remove |
| `/api/players/:id` | GET | Get player details | ✅ Keep |
| `/api/players/:id` | PATCH | Update player | ✅ Keep |
| `/api/players/:id` | DELETE | Delete player | ⚠️ Review |
| `/api/players/:id/seasons` | GET | Get player seasons | ✅ Keep |
| `/api/players/:id/seasons` | POST | Update player seasons | ✅ Keep |
| `/api/players/:playerId/clubs` | GET | Get player's clubs | 🆕 Add |
| `/api/players/:playerId/clubs` | POST | Update player's clubs | 🆕 Add |

### 4. Game Management

| Current Endpoint | Method | Purpose | Status |
|-----------------|--------|---------|--------|
| `/api/games` | GET | List games | ⚠️ Enhance |
| `/api/games` | POST | Create game | ✅ Keep |
| `/api/games/:gameId` | GET | Get game details | ✅ Keep |
| `/api/games/:gameId` | PATCH | Update game | ✅ Keep |
| `/api/games/:gameId` | DELETE | Delete game | ✅ Keep |
| `/api/games/:gameId/scores` | GET | Get official scores | ✅ Keep |
| `/api/games/:gameId/scores` | POST | Set official scores | ✅ Keep |
| `/api/games/:gameId/permissions` | GET | Get permissions | ✅ Keep |
| `/api/games/:gameId/permissions` | POST | Grant permission | ✅ Keep |
| `/api/games/:gameId/teams` | GET | Get participating teams | 🆕 Add |
| `/api/games/:gameId/stats` | GET | All stats for game | 🆕 Add |
| `/api/games/:gameId/rosters` | GET | All rosters for game | 🆕 Add |

### 5. Statistics Management

| Current Endpoint | Method | Purpose | Status |
|-----------------|--------|---------|--------|
| `/api/game/:gameId/team/:teamId/stats` | POST | Record team stats | ⚠️ Standardize |
| `/api/game/:gameId/team/:teamId/stats/:statId` | PATCH | Update stat | ⚠️ Standardize |
| `/api/games/stats/batch` | POST | Batch fetch stats | ✅ Keep |
| `/api/games/:gameId/stats/team/:teamId` | GET | Team stats for game | 🆕 Add |

## Proposed New Structure

### Core Principles

1. **Resource Independence**: Games and players exist independently
2. **Clear Ownership**: Clubs own teams, teams participate in games
3. **Multiple Access Paths**: Same data accessible through different contexts
4. **Permission Context**: Use club/team context when auth matters

### Endpoint Patterns

```typescript
// Pattern 1: Global Resources
/api/v1/[resource]                                    // List/create
/api/v1/[resource]/:id                               // Get/update/delete

// Pattern 2: Club-Scoped Resources  
/api/v1/clubs/:clubId/[resource]                     // Club's resources
/api/v1/clubs/:clubId/[resource]/:id                 // Specific resource

// Pattern 3: Game-Related Resources
/api/v1/games/:gameId/[aspect]                       // Game aspects
/api/v1/games/:gameId/[aspect]/team/:teamId          // Team-specific

// Pattern 4: Team Views (for convenience)
/api/v1/teams/:teamId/games                          // Team's games
/api/v1/teams/:teamId/games/:gameId/[aspect]         // Team's view
```

### Detailed Mapping

#### 🎮 Games (Independent Entities)

```typescript
// Core game operations
GET    /api/v1/games                         // List all games
POST   /api/v1/games                         // Create new game
GET    /api/v1/games/:gameId                 // Get game details
PATCH  /api/v1/games/:gameId                 // Update game
DELETE /api/v1/games/:gameId                 // Delete game

// Game relationships
GET    /api/v1/games/:gameId/teams           // Teams in this game
GET    /api/v1/games/:gameId/scores          // Official scores
POST   /api/v1/games/:gameId/scores          // Submit official scores

// Game data by team
GET    /api/v1/games/:gameId/stats           // All stats for game
GET    /api/v1/games/:gameId/stats/team/:teamId     // Team's stats
POST   /api/v1/games/:gameId/stats/team/:teamId     // Record team stats

GET    /api/v1/games/:gameId/rosters         // All rosters
GET    /api/v1/games/:gameId/rosters/team/:teamId   // Team's roster
POST   /api/v1/games/:gameId/rosters/team/:teamId   // Set team roster
```

#### 👥 Players (Multi-Club Entities)

```typescript
// Global player operations
GET    /api/v1/players                       // All players (filtered)
POST   /api/v1/players                       // Create player
GET    /api/v1/players/:playerId             // Player details
PATCH  /api/v1/players/:playerId             // Update player

// Player relationships
GET    /api/v1/players/:playerId/clubs       // Player's clubs
POST   /api/v1/players/:playerId/clubs       // Update club memberships
GET    /api/v1/players/:playerId/games       // Player's games
GET    /api/v1/players/:playerId/availability // Player availability

// Club-specific player management
GET    /api/v1/clubs/:clubId/players         // Club's players
POST   /api/v1/clubs/:clubId/players         // Add player to club
DELETE /api/v1/clubs/:clubId/players/:playerId // Remove from club
```

#### 🏃 Teams (Club-Owned)

```typescript
// Team management (always club-scoped)
GET    /api/v1/clubs/:clubId/teams           // Club's teams
POST   /api/v1/clubs/:clubId/teams           // Create team
GET    /api/v1/clubs/:clubId/teams/:teamId   // Team details
PATCH  /api/v1/clubs/:clubId/teams/:teamId   // Update team
DELETE /api/v1/clubs/:clubId/teams/:teamId   // Delete team

// Team rosters
GET    /api/v1/clubs/:clubId/teams/:teamId/players    // Current roster
POST   /api/v1/clubs/:clubId/teams/:teamId/players    // Add to roster
DELETE /api/v1/clubs/:clubId/teams/:teamId/players/:playerId // Remove

// Team's view of games (convenience endpoints)
GET    /api/v1/teams/:teamId/games           // Team's games
GET    /api/v1/teams/:teamId/games/:gameId   // Specific game
GET    /api/v1/teams/:teamId/games/:gameId/stats    // Team's stats
GET    /api/v1/teams/:teamId/games/:gameId/roster   // Team's roster
```

#### 🏢 Clubs (Top-Level Organizations)

```typescript
// Club management
GET    /api/v1/clubs                         // All clubs
POST   /api/v1/clubs                         // Create club
GET    /api/v1/clubs/:clubId                 // Club details
PATCH  /api/v1/clubs/:clubId                 // Update club
DELETE /api/v1/clubs/:clubId                 // Delete club

// Club resources (existing structure is good)
GET    /api/v1/clubs/:clubId/teams           // Club's teams
GET    /api/v1/clubs/:clubId/players         // Club's players
GET    /api/v1/clubs/:clubId/games           // Games involving club
GET    /api/v1/clubs/:clubId/users           // Club users
```

### Migration Strategy

#### Phase 1: Add New Endpoints (Parallel)
1. Keep all existing endpoints working
2. Add new `/api/v1/` endpoints alongside old ones
3. Update `apiClient` to prefer new endpoints

#### Phase 2: Update Frontend
1. Update all API calls to use new endpoints
2. Update React Query keys to match new structure
3. Test all functionality thoroughly

#### Phase 3: Deprecate Legacy
1. Mark old endpoints as deprecated
2. Add console warnings when old endpoints used
3. Plan removal date (e.g., 3 months)

#### Phase 4: Remove Legacy
1. Remove old endpoint handlers
2. Remove URL correction logic
3. Clean up route files

### Example Migrations

#### Example 1: Getting Team's Games

```typescript
// ❌ OLD: Ambiguous ownership
GET /api/teams/:teamId/games

// ✅ NEW: Clear context
GET /api/v1/teams/:teamId/games
// Returns games where this team participates
```

#### Example 2: Recording Game Stats

```typescript
// ❌ OLD: Inconsistent patterns
POST /api/game/:gameId/team/:teamId/stats
POST /api/games/stats/batch

// ✅ NEW: Consistent resource-based
POST /api/v1/games/:gameId/stats/team/:teamId
POST /api/v1/games/stats/batch
```

#### Example 3: Player Management

```typescript
// ❌ OLD: No club context
GET /api/players
POST /api/players

// ✅ NEW: Club-scoped when needed
GET /api/v1/players                    // All players (with filters)
GET /api/v1/clubs/:clubId/players      // Club's players
POST /api/v1/clubs/:clubId/players     // Add to club
```

### Benefits of New Structure

1. **Clear Mental Model**
   - Games are competitions, not owned by teams
   - Players can belong to multiple clubs
   - Teams are always club-scoped

2. **Consistent Patterns**
   - Predictable URL structure
   - Clear resource ownership
   - Obvious permission boundaries

3. **Flexible Access**
   - Multiple paths to same data
   - Context-appropriate endpoints
   - Efficient batch operations

4. **Future-Proof**
   - Supports inter-club competitions
   - Allows player transfers/borrowing
   - Scales to multiple leagues/seasons

### Implementation Checklist

- [ ] Create `/api/v1/` route handlers
- [ ] Add new game-centric endpoints
- [ ] Add player-clubs relationship endpoints
- [ ] Update apiClient to use new routes
- [ ] Update React Query keys
- [ ] Add deprecation warnings to old endpoints
- [ ] Update documentation
- [ ] Plan legacy removal timeline
- [ ] Remove URL correction logic
- [ ] Clean up route files

### Notes

1. **Backward Compatibility**: Keep old endpoints during transition
2. **Gradual Migration**: Update one resource type at a time
3. **Testing**: Comprehensive tests for all new endpoints
4. **Documentation**: Update API docs as you go
5. **Monitoring**: Track usage of old vs new endpoints

---

Last Updated: August 1, 2025