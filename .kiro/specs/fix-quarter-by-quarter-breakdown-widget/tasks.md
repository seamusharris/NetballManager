# Implementation Plan

- [x] 1. Identify and locate the calculateUnifiedQuarterByQuarterStats function

  - Find the function in the codebase that's currently returning zeros
  - Examine the current implementation to understand the data flow issue
  - Document the current function signature and expected inputs
  - _Requirements: 1.1, 3.1, 3.3_

- [x] 2. Fix the data structure mismatch in the calling component

  - Locate the component that calls calculateUnifiedQuarterByQuarterStats
  - Change the data source from unifiedData to allSeasonGamesWithStatistics
  - Ensure the games array has id property instead of gameId
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 3. Implement position percentage calculation logic

  - Create function to calculate GS/GA percentage breakdown from position statistics
  - Create function to calculate GK/GD percentage breakdown from position statistics
  - Handle cases where position statistics are not available (50/50 fallback)
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 4. Implement quarter score average calculation

  - Create function to calculate average goals scored per quarter across all games
  - Create function to calculate average goals conceded per quarter across all games
  - Use batchScores[game.id] to access quarter-by-quarter data
  - _Requirements: 1.3, 1.5, 3.2_

- [x] 5. Implement position breakdown application logic

  - Create function to apply position percentages to quarter score averages
  - Calculate GS and GA values by multiplying attack averages by percentages
  - Calculate GK and GD values by multiplying defense averages by percentages
  - _Requirements: 1.5, 2.4, 4.1, 4.2_

- [ ] 6. Add comprehensive error handling and validation

  - Add validation to check for id vs gameId property mismatch
  - Add fallback logic when batchScores[game.id] returns undefined
  - Add logging for debugging data structure issues
  - Handle edge cases (no games, no statistics, missing quarters)
  - _Requirements: 3.4, 5.1, 5.2, 5.3_

- [x] 7. Implement data formatting and output structure

  - Format calculated values to one decimal place for display
  - Return properly structured quarter breakdown data
  - Ensure non-zero values when valid data is available
  - Add appropriate fallback indicators when no data available
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 8. Add debugging and logging enhancements

  - Add detailed logging for position percentage calculations
  - Log when falling back to default 50/50 distributions
  - Add warnings for data structure mismatches
  - Log quarter average calculations for verification
  - _Requirements: 5.3, 5.4_

- [-] 9. Test the implementation with actual game data

  - Test with the same data used by working Quarter Performance Analysis Widget
  - Verify that non-zero values are displayed in all quarter cards
  - Compare calculated values with expected patterns
  - Test edge cases (single game, no position stats, missing quarters)
  - _Requirements: 1.1, 1.2, 4.3_

- [ ] 10. Verify consistency with other working widgets
  - Compare total values with Attack/Defense Total Breakdown widget
  - Ensure quarter averages align with Quarter Performance Analysis widget
  - Validate that position breakdowns sum correctly to totals
  - Test with multiple team datasets for consistency
  - _Requirements: 3.1, 3.4_
