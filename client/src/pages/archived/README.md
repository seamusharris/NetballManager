
# Archived Opponent System Pages

This directory contains the original opponent system pages that were archived during the migration to the team-based system.

## Archived Files

- `OpponentAnalysis.tsx` - Main opponent analysis page with matchup statistics
- `OpponentDetailed.tsx` - Detailed analysis for specific opponents  
- `Opponents.tsx` - Opponent management page
- `components/opponents/` - Component directory with OpponentForm and OpponentsList

## Why These Were Archived

The system has migrated from an "opponent" model to a "team" model where:
- Games are now between home_team and away_team (both are teams in the system)
- Opponents were external entities, now everything uses the unified team system
- This provides better tracking for inter-club games and statistics

## Future Plans

These pages will be used as templates for new team-based analysis features:
- Team vs Team analysis (replacing opponent analysis)
- Home/Away team performance metrics
- Inter-club game statistics

## How to Reference

If you need to see the original implementation for reference:
1. Check the files in this directory
2. The logic can be adapted for team-based analysis
3. The UI patterns and calculations are still valuable

## Migration Status

- Database: ✅ Completed (opponent_id removed, home_team_id/away_team_id added)
- API: ✅ Completed (team-based endpoints)
- UI: 🚧 In Progress (archived pages, building new team-based features)
