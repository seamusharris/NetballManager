# Position-Based Stats Implementation Plan

## Database Schema Changes
- Remove `playerId` from `game_stats` table
- Keep `position` as required field
- Add unique constraint on (gameId, position, quarter)

## Migration Strategy
1. Ensure all stats have position data from roster
2. For duplicates (same game/position/quarter), merge stats by summing
3. Back up old data with player IDs in a separate table
4. Remove player ID column

## Frontend Changes

### LiveStats Page
- Continue recording stats by player UI (easiest for users)
- Convert to position when saving to database
- Look up player position in roster for current quarter
- Save stat record with position instead of playerId

### Statistics Views
- When displaying stats, join with roster data
- Map position stats back to players based on who played that position
- For player history, use position + roster to determine which stats to include

### PlayerDetails Page
- Calculate stats by looking up all positions player was in
- Join with game_stats based on those positions

## Benefits
- Stats integrity maintained even if roster changes
- Position-specific analysis becomes easier
- Quarter and game totals more accurate
- No longer dependent on player assignments