# Design Document

## Overview

The Attack/Defense Quarter-by-Quarter Breakdown Widget needs to be fixed to display actual calculated values instead of zeros. The issue is a data structure mismatch where the function expects games with `id` property but receives data with `gameId` property, causing the quarter score lookups to fail.

## Architecture

### Current Data Flow (Broken)
```
Component → unifiedData (gameId) → calculateUnifiedQuarterByQuarterStats → batchScores[undefined] → zeros
```

### Fixed Data Flow
```
Component → allSeasonGamesWithStatistics (id) → calculateUnifiedQuarterByQuarterStats → batchScores[game.id] → actual values
```

## Components and Interfaces

### Data Structures

#### Input Data Structure (Expected)
```typescript
interface GameWithId {
  id: number;
  // other game properties
}

interface BatchScores {
  [gameId: number]: {
    quarter: number;
    homeScore: number;
    awayScore: number;
  }[];
}
```

#### Position Statistics Structure
```typescript
interface PositionStats {
  position: 'GS' | 'GA' | 'GK' | 'GD';
  quarter: number;
  goalsFor: number;
  goalsAgainst: number;
}
```

#### Output Structure
```typescript
interface QuarterBreakdown {
  quarter: number;
  attack: {
    gs: number;
    ga: number;
  };
  defense: {
    gk: number;
    gd: number;
  };
}
```

### Core Calculation Logic

#### Step 1: Calculate Position Percentages
```typescript
function calculatePositionPercentages(games: GameWithId[], batchScores: BatchScores) {
  // For each game with position statistics
  // Calculate GS/GA percentage of total attack goals per quarter
  // Calculate GK/GD percentage of total defense goals per quarter
  // Return average percentages across all games
}
```

#### Step 2: Calculate Quarter Score Averages
```typescript
function calculateQuarterAverages(games: GameWithId[], batchScores: BatchScores) {
  // For each quarter (1-4)
  // Calculate average goals scored and conceded
  // Return quarter averages
}
```

#### Step 3: Apply Position Percentages
```typescript
function applyPositionBreakdown(quarterAverages: QuarterAverage[], positionPercentages: PositionPercentages) {
  // For each quarter
  // Multiply scored average by GS/GA percentages
  // Multiply conceded average by GK/GD percentages
  // Return final breakdown
}
```

## Data Models

### Position Percentage Calculation
```typescript
interface PositionPercentages {
  attack: {
    gs: number; // percentage of attack goals from GS (0-1)
    ga: number; // percentage of attack goals from GA (0-1)
  };
  defense: {
    gk: number; // percentage of defense goals conceded to GK area (0-1)
    gd: number; // percentage of defense goals conceded to GD area (0-1)
  };
}
```

### Quarter Averages
```typescript
interface QuarterAverage {
  quarter: number;
  scored: number;    // average goals scored this quarter
  conceded: number;  // average goals conceded this quarter
}
```

## Error Handling

### Data Validation
1. **Missing ID Property**: Check if games have `id` property, log error if `gameId` found instead
2. **Empty BatchScores**: Handle cases where `batchScores[game.id]` returns undefined
3. **Missing Position Stats**: Fall back to 50/50 distribution when position statistics unavailable
4. **Invalid Quarter Data**: Skip quarters with invalid or missing score data

### Fallback Strategies
1. **No Position Statistics**: Use equal distribution (GS: 50%, GA: 50%, GK: 50%, GD: 50%)
2. **Partial Data**: Calculate percentages from available games only
3. **No Quarter Data**: Return zeros with appropriate logging

## Testing Strategy

### Unit Tests
1. Test position percentage calculation with various game scenarios
2. Test quarter average calculation with different score patterns
3. Test data structure validation and error handling
4. Test fallback behavior when position statistics unavailable

### Integration Tests
1. Test with actual game data from working components
2. Verify consistency with Quarter Performance Analysis Widget
3. Test with edge cases (no games, single game, missing quarters)

### Manual Testing
1. Verify widget displays non-zero values
2. Compare values with other working widgets for consistency
3. Test with different team data sets

## Implementation Notes

### Key Changes Required
1. **Component Level**: Pass `allSeasonGamesWithStatistics` instead of `unifiedData`
2. **Function Level**: Add data structure validation and logging
3. **Calculation Level**: Implement robust position percentage calculation
4. **Error Handling**: Add comprehensive fallback mechanisms

### Performance Considerations
1. Cache position percentage calculations if expensive
2. Optimize quarter score lookups for large datasets
3. Consider memoization for repeated calculations

### Debugging Enhancements
1. Add detailed logging for data structure validation
2. Log position percentage calculations for verification
3. Add warnings when falling back to default distributions