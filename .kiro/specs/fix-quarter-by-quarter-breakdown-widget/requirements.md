# Requirements Document

## Introduction

The Attack/Defense Quarter-by-Quarter Breakdown Widget is currently showing all zeros in the bottom row (quarter-by-quarter breakdown) while the top row (total breakdown) shows correct values. This widget should display quarter-by-quarter breakdowns of goals scored and conceded, broken down by position (GS/GA for attack, GK/GD for defense).

## Requirements

### Requirement 1

**User Story:** As a team analyst, I want to see quarter-by-quarter position breakdowns for attack and defense, so that I can understand how goal scoring/conceding is distributed across quarters and positions.

#### Acceptance Criteria

1. WHEN the widget loads THEN the top row SHALL display correct total attack/defense breakdowns (GS: 14.4, GA: 14.4, GK: 9.8, GD: 8.8)
2. WHEN the widget loads THEN the bottom row SHALL display quarter-by-quarter breakdowns instead of zeros
3. WHEN calculating quarter breakdowns THEN the system SHALL use all games with quarter-by-quarter position statistics
4. WHEN calculating position percentages THEN the system SHALL calculate average percentage breakdown per quarter between GS/GA and GK/GD
5. WHEN applying percentages THEN the system SHALL apply these averages to each quarter's official score averages

### Requirement 2

**User Story:** As a team analyst, I want the quarter breakdown calculations to be based on actual position statistics, so that the data reflects real performance patterns.

#### Acceptance Criteria

1. WHEN calculating position percentages THEN the system SHALL use games that have quarter-by-quarter position statistics available
2. WHEN no position statistics are available THEN the system SHALL fall back to equal distribution (50/50 for GS/GA, 50/50 for GK/GD)
3. WHEN position statistics are available THEN the system SHALL calculate the actual percentage breakdown from the statistics
4. WHEN applying percentages THEN the system SHALL multiply quarter score averages by the calculated position percentages

### Requirement 3

**User Story:** As a team analyst, I want the data source to be consistent with other working widgets, so that all widgets show coherent and accurate information.

#### Acceptance Criteria

1. WHEN the function receives data THEN it SHALL expect games with an `id` property (like allSeasonGamesWithStatistics)
2. WHEN looking up quarter scores THEN the system SHALL use `batchScores[game.id]` to access quarter data
3. WHEN the data structure is incorrect THEN the system SHALL handle the mismatch gracefully
4. WHEN debugging THEN the system SHALL provide clear logging about data structure issues

### Requirement 4

**User Story:** As a team analyst, I want the quarter breakdown to show meaningful values (like "GS: 3.2, GA: 2.1"), so that I can make informed decisions about team performance.

#### Acceptance Criteria

1. WHEN displaying attack quarters THEN each quarter card SHALL show GS and GA values with one decimal place
2. WHEN displaying defense quarters THEN each quarter card SHALL show GK and GD values with one decimal place
3. WHEN values are calculated THEN they SHALL be non-zero when valid data is available
4. WHEN no data is available THEN the system SHALL display appropriate fallback values or indicators

### Requirement 5

**User Story:** As a developer, I want the calculation logic to be robust and well-documented, so that future maintenance is straightforward.

#### Acceptance Criteria

1. WHEN calculating averages THEN the system SHALL handle edge cases (no games, no statistics, missing quarters)
2. WHEN processing position statistics THEN the system SHALL validate data integrity
3. WHEN errors occur THEN the system SHALL log meaningful error messages
4. WHEN calculations complete THEN the system SHALL return properly formatted data structure