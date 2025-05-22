-- First, identify duplicate rows by keeping only the latest one (highest ID) for each game_id, position, quarter combination
-- This deletes all duplicate entries with lower IDs
DELETE FROM game_stats 
WHERE id NOT IN (
  SELECT MAX(id) 
  FROM game_stats 
  GROUP BY game_id, position, quarter
);

-- Then add the unique constraint to prevent future duplicates
-- Note: This may fail if there are still duplicates remaining
ALTER TABLE game_stats 
ADD CONSTRAINT IF NOT EXISTS position_quarter_unique 
UNIQUE (game_id, position, quarter);